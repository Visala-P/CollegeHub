using System.Globalization;
using System.Text.Json;
using Microsoft.ML;
using Microsoft.ML.Data;
using Microsoft.ML.Trainers.FastTree;
using MongoDB.Driver;

namespace CollegeHub.MLPredictor;

public sealed class AdmissionPredictorService
{
    private readonly ILogger<AdmissionPredictorService> _logger;
    private readonly IMongoCollection<CollegeDocument> _collegeCollection;
    private readonly MLContext _mlContext = new(seed: 20260529);
    private readonly string _modelDirectory;
    private readonly SemaphoreSlim _trainLock = new(1, 1);
    private readonly Dictionary<string, ITransformer> _models = new(StringComparer.OrdinalIgnoreCase);
    private readonly Dictionary<string, PredictionEngine<PredictionRow, PredictionScore>> _engines = new(StringComparer.OrdinalIgnoreCase);
    private bool _ready;
    private int _trainSize;

    private static readonly string[] Exams = ["jee-main", "jee-advanced", "neet"];
    private static readonly string[] Categories = ["GENERAL", "EWS", "OBC", "SC", "ST"];
    private static readonly string[] Quotas = ["AI", "HS"];
    private static readonly string[] Genders = ["male", "female", "other"];
    private static readonly string[] TopEngineeringBranches = ["Computer Science", "Electronics", "Mechanical", "Civil", "Electrical"];
    private static readonly string[] MedicalBranches = ["MBBS", "BDS", "Pharmacy", "Nursing"];

    public AdmissionPredictorService(ILogger<AdmissionPredictorService> logger, IConfiguration configuration)
    {
        _logger = logger;

            var mongoUri = LoadLocalEnvValue("MONGODB_URI")
                ?? LoadLocalEnvValue("MONGO_URI")
                ?? ResolveConfigurationValue(configuration, "MONGODB_URI", "MONGO_URI")
                ?? "mongodb://127.0.0.1:27017";
            var databaseName = LoadLocalEnvValue("MONGODB_DB")
                ?? LoadLocalEnvValue("DB_NAME")
                ?? ResolveConfigurationValue(configuration, "MONGODB_DB", "DB_NAME")
                ?? "college_discovery_platform";
        var client = new MongoClient(mongoUri);
        var database = client.GetDatabase(databaseName);
        _collegeCollection = database.GetCollection<CollegeDocument>("colleges");

        var baseDirectory = AppContext.BaseDirectory;
        _modelDirectory = configuration["MODEL_DIR"] ?? Path.GetFullPath(Path.Combine(baseDirectory, "ModelStore"));
    }

    public string ModelVersion => "mlnet-admission-v1";
    public int TrainSize => _trainSize;
    public bool IsReady => _ready;

    public async Task EnsureReadyAsync(CancellationToken cancellationToken = default)
    {
        if (_ready)
        {
            return;
        }

        await _trainLock.WaitAsync(cancellationToken);
        try
        {
            if (_ready)
            {
                return;
            }

            await TrainAsync(cancellationToken);
            _ready = true;
            _logger.LogInformation("Model loaded: {ModelVersion} trainSize={TrainSize}", ModelVersion, _trainSize);
        }
        finally
        {
            _trainLock.Release();
        }
    }

    public async Task ReTrainAsync(CancellationToken cancellationToken = default)
    {
        await _trainLock.WaitAsync(cancellationToken);
        try
        {
            await TrainAsync(cancellationToken);
            _ready = true;
            _logger.LogInformation("Model retrained: {ModelVersion} trainSize={TrainSize}", ModelVersion, _trainSize);
        }
        finally
        {
            _trainLock.Release();
        }
    }

    private async Task<List<CollegeDocument>> LoadCollegesAsync(CancellationToken cancellationToken = default)
    {
        var colleges = await _collegeCollection
            .Find(Builders<CollegeDocument>.Filter.Empty)
            .SortBy(college => college.Name)
            .ToListAsync(cancellationToken);

        if (colleges.Count == 0)
        {
            throw new InvalidOperationException("No colleges found in MongoDB. Seed the colleges collection before running predictions.");
        }

        var iitCount = colleges.Count(college => InferInstitutionType(college) == "IIT");
        var nitCount = colleges.Count(college => InferInstitutionType(college) == "NIT");
        var iiitCount = colleges.Count(college => InferInstitutionType(college) == "IIIT");
        var aiimsCount = colleges.Count(college => InferInstitutionType(college) == "AIIMS");

        _logger.LogInformation(
            "Loaded colleges from MongoDB total={Total} IIT={IitCount} NIT={NitCount} IIIT={IiitCount} AIIMS={AiimsCount}",
            colleges.Count,
            iitCount,
            nitCount,
            iiitCount,
            aiimsCount);

        return colleges;
    }

    private static List<CutoffRecord> BuildHistoricalCutoffs(IEnumerable<CollegeDocument> colleges)
    {
        var cutoffs = new List<CutoffRecord>();

        foreach (var college in colleges)
        {
            var institutionType = InferInstitutionType(college);
            var branchFamily = InferBranchFamilyFromCollege(college);
            var exam = institutionType is "AIIMS" or "GOVT_MEDICAL" or "MEDICAL_COLLEGE" or "PRIVATE_MEDICAL" ? "neet" : institutionType == "IIT" ? "jee-advanced" : "jee-main";
            var branch = branchFamily == "medical" ? "MBBS" : branchFamily == "cse" ? "Computer Science" : branchFamily == "electronics" ? "Electronics" : branchFamily == "mechanical" ? "Mechanical" : branchFamily == "civil" ? "Civil" : "General";

            var closingRank = (int)Math.Max(1, Math.Round(college.MaxRank > 0 ? college.MaxRank : Math.Max(100, college.MinRank * 1.5)));
            var openingRank = (int)Math.Max(1, Math.Round(Math.Min(college.MinRank > 0 ? college.MinRank : closingRank * 0.55, closingRank * 0.85)));

            cutoffs.Add(new CutoffRecord
            {
                CollegeId = college.Id.ToString(),
                CollegeName = college.Name,
                Branch = branch,
                Category = "GENERAL",
                Exam = exam,
                Year = DateTime.UtcNow.Year,
                OpeningRank = openingRank,
                ClosingRank = closingRank,
                State = college.State,
            });

            if (exam != "neet")
            {
                cutoffs.Add(new CutoffRecord
                {
                    CollegeId = college.Id.ToString(),
                    CollegeName = college.Name,
                    Branch = branch,
                    Category = "OBC",
                    Exam = exam,
                    Year = DateTime.UtcNow.Year,
                    OpeningRank = (int)Math.Max(1, Math.Round(openingRank * 1.12)),
                    ClosingRank = (int)Math.Max(1, Math.Round(closingRank * 1.12)),
                    State = college.State,
                });

                cutoffs.Add(new CutoffRecord
                {
                    CollegeId = college.Id.ToString(),
                    CollegeName = college.Name,
                    Branch = branch,
                    Category = "SC",
                    Exam = exam,
                    Year = DateTime.UtcNow.Year,
                    OpeningRank = (int)Math.Max(1, Math.Round(openingRank * 1.3)),
                    ClosingRank = (int)Math.Max(1, Math.Round(closingRank * 1.3)),
                    State = college.State,
                });

                cutoffs.Add(new CutoffRecord
                {
                    CollegeId = college.Id.ToString(),
                    CollegeName = college.Name,
                    Branch = branch,
                    Category = "ST",
                    Exam = exam,
                    Year = DateTime.UtcNow.Year,
                    OpeningRank = (int)Math.Max(1, Math.Round(openingRank * 1.45)),
                    ClosingRank = (int)Math.Max(1, Math.Round(closingRank * 1.45)),
                    State = college.State,
                });
            }
        }

        return cutoffs;
    }

    private static Dictionary<string, double> BuildRankingLookup(IEnumerable<CollegeDocument> colleges)
    {
        var lookup = new Dictionary<string, double>(StringComparer.OrdinalIgnoreCase);

        foreach (var college in colleges)
        {
            var score = Math.Clamp((college.Rating / 5.0) * 0.6 + (college.PlacementRate / 100.0) * 0.4, 0, 1);
            lookup[NormalizeKey(college.Name)] = Math.Round(1.0 + (1.0 - score) * 249.0, 2);
        }

        return lookup;
    }

    public async Task<AdmissionResponse> PredictAsync(AdmissionRequest request, CancellationToken cancellationToken = default)
    {
        await EnsureReadyAsync(cancellationToken);

        var colleges = await LoadCollegesAsync(cancellationToken);
        var percentile = request.Percentile ?? RankToPercentile(request.ExamType, request.Rank);
        var cutoffs = BuildHistoricalCutoffs(colleges);
        var rankingLookup = BuildRankingLookup(colleges);
        var ranked = new List<AdmissionPrediction>();

        _logger.LogInformation(
            "Inference started exam={Exam} rank={Rank} percentile={Percentile} category={Category} gender={Gender} state={State} quota={Quota} branch={Branch} colleges={CollegeCount}",
            request.ExamType,
            request.Rank,
            percentile,
            request.Category,
            request.Gender,
            request.HomeState ?? "",
            request.Quota,
            request.PreferredBranch ?? "",
            colleges.Count);

        foreach (var college in colleges)
        {
            if (!IsCollegeRelevantForExam(college, request.ExamType))
            {
                continue;
            }

            var institutionType = InferInstitutionType(college);
            var tier = EstimateTier(institutionType, college.Rating, college.PlacementRate, college.MaxRank, college.MinRank);
            var branchPrediction = PredictBranch(college, request);
            var branchFamily = InferBranchFamily(branchPrediction);
            var historicalWeight = GetHistoricalCutoffWeight(college, cutoffs, request.ExamType, request.Category, branchPrediction);
            var cutoffTrend = GetCutoffTrend(college, cutoffs);
            var priorityScore = GetPriorityScore(institutionType, tier, college);
            var row = BuildPredictionRow(college, request, percentile, institutionType, tier, branchPrediction, branchFamily, historicalWeight, cutoffTrend, priorityScore, rankingLookup);
            var probability = ScoreRow(row);

            _logger.LogInformation(
                "Prediction score college={College} probability={Probability} tier={Tier} institutionType={InstitutionType}",
                college.Name,
                probability.ToString("0.000", CultureInfo.InvariantCulture),
                tier,
                institutionType);
            ranked.Add(new AdmissionPrediction
            {
                Id = college.Id.ToString(),
                Name = college.Name,
                Location = college.Location,
                City = college.City,
                State = college.State,
                Fees = college.Fees,
                Rating = college.Rating,
                Courses = college.Courses,
                Type = college.Type,
                Established = college.Established,
                Image = college.Image,
                PlacementRate = college.PlacementRate,
                AveragePackage = college.AveragePackage,
                HighestPackage = college.HighestPackage,
                TotalStudents = college.TotalStudents,
                FacultyCount = college.FacultyCount,
                CampusSize = college.CampusSize,
                MinRank = college.MinRank,
                MaxRank = college.MaxRank,
                Description = college.Description,
                InstitutionType = institutionType,
                Tier = tier,
                BranchPrediction = branchPrediction,
                AdmissionProbability = probability,
                MatchBand = GetMatchBand(probability),
                AdmissionCategory = GetAdmissionCategory(probability),
                DifficultyBand = GetDifficultyBand(probability),
                Confidence = Math.Round(GetConfidence(probability, historicalWeight, cutoffTrend), 2),
                OpeningRank = Math.Max(1, college.MinRank),
                ClosingRank = Math.Max(college.MinRank, college.MaxRank),
            });
        }

        var sorted = ranked
            .OrderByDescending(college => college.AdmissionProbability)
            .ThenByDescending(college => GetPriorityOrder(college.InstitutionType))
            .ThenByDescending(college => GetTierOrder(college.Tier))
            .ThenBy(college => college.MaxRank)
            .Take(Math.Max(1, request.MaxResults))
            .ToList();

        _logger.LogInformation(
            "Returned colleges count={Count} colleges={Colleges}",
            sorted.Count,
            string.Join(", ", sorted.Select(college => $"{college.Name}:{college.AdmissionProbability:0.0}")));

        return new AdmissionResponse
        {
            ModelVersion = ModelVersion,
            Message = "Predictions generated by ML.NET inference",
            TrainSize = _trainSize,
            InputRank = request.Rank,
            InputPercentile = percentile,
            Colleges = sorted,
        };
    }

    private async Task TrainAsync(CancellationToken cancellationToken)
    {
        Directory.CreateDirectory(_modelDirectory);

        var colleges = await LoadCollegesAsync(cancellationToken);
        var cutoffs = BuildHistoricalCutoffs(colleges);
        var rankingLookup = BuildRankingLookup(colleges);
        var trainingRows = BuildTrainingRows(colleges, cutoffs, rankingLookup);
        _trainSize = trainingRows.Count;

        var dataView = _mlContext.Data.LoadFromEnumerable(trainingRows);
        var pipeline = BuildPreprocessingPipeline(_mlContext);
        var trainers = new Dictionary<string, IEstimator<ITransformer>>
        {
            ["fasttree"] = pipeline.Append(_mlContext.BinaryClassification.Trainers.FastTree(labelColumnName: nameof(PredictionRow.Label), featureColumnName: "Features")),
            ["lightgbm"] = pipeline.Append(_mlContext.BinaryClassification.Trainers.LightGbm(labelColumnName: nameof(PredictionRow.Label), featureColumnName: "Features")),
            ["sdca"] = pipeline.Append(_mlContext.BinaryClassification.Trainers.SdcaLogisticRegression(labelColumnName: nameof(PredictionRow.Label), featureColumnName: "Features")),
            ["fastforest"] = pipeline.Append(_mlContext.BinaryClassification.Trainers.FastForest(labelColumnName: nameof(PredictionRow.Label), featureColumnName: "Features")),
        };

        _models.Clear();
        _engines.Clear();

        foreach (var (name, trainer) in trainers)
        {
            var model = trainer.Fit(dataView);
            _models[name] = model;
            _engines[name] = _mlContext.Model.CreatePredictionEngine<PredictionRow, PredictionScore>(model);
            var modelPath = Path.Combine(_modelDirectory, $"{name}.zip");
            _mlContext.Model.Save(model, dataView.Schema, modelPath);
        }

        var summaryPath = Path.Combine(_modelDirectory, "model-metadata.json");
        await File.WriteAllTextAsync(summaryPath, JsonSerializer.Serialize(new
        {
            modelVersion = ModelVersion,
            trainSize = _trainSize,
            trainedAt = DateTimeOffset.UtcNow,
            models = _models.Keys.ToArray(),
        }, new JsonSerializerOptions { WriteIndented = true }), cancellationToken);
    }

    private static IEstimator<ITransformer> BuildPreprocessingPipeline(MLContext ml)
    {
        string[] numericColumns =
        [
            nameof(PredictionRow.Rank),
            nameof(PredictionRow.Percentile),
            nameof(PredictionRow.BranchCompetitiveness),
            nameof(PredictionRow.HistoricalCutoffWeight),
            nameof(PredictionRow.CutoffTrend),
            nameof(PredictionRow.PriorityScore),
            nameof(PredictionRow.Fees),
            nameof(PredictionRow.Rating),
            nameof(PredictionRow.PlacementRate),
            nameof(PredictionRow.AveragePackage),
            nameof(PredictionRow.TotalStudents),
            nameof(PredictionRow.FacultyCount),
            nameof(PredictionRow.MinRank),
            nameof(PredictionRow.MaxRank),
            nameof(PredictionRow.TierScore),
            nameof(PredictionRow.SameState),
            nameof(PredictionRow.BranchMatch),
            nameof(PredictionRow.NirfScore),
        ];

        string[] categoricalColumns =
        [
            nameof(PredictionRow.ExamType),
            nameof(PredictionRow.Category),
            nameof(PredictionRow.Gender),
            nameof(PredictionRow.HomeState),
            nameof(PredictionRow.Quota),
            nameof(PredictionRow.PreferredBranch),
            nameof(PredictionRow.CollegeState),
            nameof(PredictionRow.CollegeType),
            nameof(PredictionRow.InstitutionType),
            nameof(PredictionRow.Tier),
            nameof(PredictionRow.BranchFamily),
        ];

        IEstimator<ITransformer> pipeline = ml.Transforms.CopyColumns("Label", nameof(PredictionRow.Label));

        foreach (var numericColumn in numericColumns)
        {
            pipeline = pipeline.Append(ml.Transforms.NormalizeMinMax($"{numericColumn}Norm", numericColumn));
        }

        foreach (var categoricalColumn in categoricalColumns)
        {
            pipeline = pipeline.Append(ml.Transforms.Categorical.OneHotEncoding($"{categoricalColumn}Encoded", categoricalColumn));
        }

        var featureColumns = numericColumns.Select(column => $"{column}Norm").Concat(categoricalColumns.Select(column => $"{column}Encoded")).ToArray();
        return pipeline.Append(ml.Transforms.Concatenate("Features", featureColumns)).AppendCacheCheckpoint(ml);
    }

    private List<PredictionRow> BuildTrainingRows(
        IReadOnlyCollection<CollegeDocument> colleges,
        IReadOnlyCollection<CutoffRecord> cutoffs,
        IReadOnlyDictionary<string, double> rankingLookup)
    {
        var rows = new List<PredictionRow>();

        foreach (var college in colleges)
        {
            var institutionType = InferInstitutionType(college);
            var tier = EstimateTier(institutionType, college.Rating, college.PlacementRate, college.MaxRank, college.MinRank);
            var branchFamily = InferBranchFamilyFromCollege(college);
            var priorityScore = GetPriorityScore(institutionType, tier, college);
            var cutoffTrend = GetCutoffTrend(college, cutoffs);
            var historicalWeight = GetHistoricalCutoffWeight(college, cutoffs, "jee-main", "GENERAL", branchFamily == "medical" ? "MBBS" : "Computer Science");
            var nirfScore = GetNirfScore(college, rankingLookup);
            var baseClosing = GetReferenceClosingRank(college, cutoffs, "jee-main", "GENERAL", branchFamily == "medical" ? "MBBS" : "Computer Science");

            foreach (var exam in Exams)
            {
                if (!IsCollegeRelevantForExam(college, exam))
                {
                    continue;
                }

                var examBranches = exam == "neet" ? MedicalBranches : TopEngineeringBranches;
                var examBaseClosing = GetReferenceClosingRank(college, cutoffs, exam, "GENERAL", examBranches[0]);
                var effectiveClosing = Math.Max(baseClosing, examBaseClosing);
                var multipliers = new[] { 0.25, 0.55, 0.85, 1.0, 1.2, 1.5, 1.9 };

                foreach (var category in Categories)
                foreach (var quota in Quotas)
                foreach (var gender in Genders)
                foreach (var branch in examBranches)
                {
                    var categoryFactor = GetCategoryFactor(category);
                    var quotaFactor = GetQuotaFactor(quota);
                    var genderFactor = GetGenderFactor(gender);
                    var stateFactor = exam == "neet" && category != "GENERAL" ? 1.05 : 1.0;
                    var branchFactor = GetBranchFactor(branch, exam);
                    var adjustedClosing = Math.Max(25, (int)Math.Round(effectiveClosing * categoryFactor * quotaFactor * genderFactor * stateFactor * branchFactor));

                    foreach (var multiplier in multipliers)
                    {
                        var rank = Math.Max(1, (int)Math.Round(adjustedClosing * multiplier));
                        var percentile = RankToPercentile(exam, rank);
                        var admissionThreshold = adjustedClosing;
                        var label = rank <= admissionThreshold;
                        var sameState = 0.0;
                        var homeState = college.State;

                        rows.Add(new PredictionRow
                        {
                            Label = label,
                            ExamType = exam,
                            Rank = rank,
                            Percentile = (float)percentile,
                            Category = category,
                            Gender = gender,
                            HomeState = homeState,
                            Quota = quota,
                            PreferredBranch = branch,
                            CollegeId = college.Id.ToString(),
                            CollegeName = college.Name,
                            CollegeState = college.State,
                            CollegeType = college.Type,
                            InstitutionType = institutionType,
                            Tier = tier,
                            BranchFamily = branchFamily,
                            BranchCompetitiveness = (float)GetBranchCompetitiveness(branch),
                            HistoricalCutoffWeight = (float)historicalWeight,
                            CutoffTrend = (float)cutoffTrend,
                            PriorityScore = (float)priorityScore,
                            Fees = (float)college.Fees,
                            Rating = (float)college.Rating,
                            PlacementRate = (float)college.PlacementRate,
                            AveragePackage = (float)college.AveragePackage,
                            TotalStudents = (float)college.TotalStudents,
                            FacultyCount = (float)college.FacultyCount,
                            MinRank = (float)college.MinRank,
                            MaxRank = (float)college.MaxRank,
                            TierScore = (float)GetTierScore(tier),
                            SameState = (float)sameState,
                            BranchMatch = InferBranchFamily(branch) == branchFamily ? 1f : 0f,
                            NirfScore = (float)nirfScore,
                        });
                    }
                }
            }
        }

        return rows;
    }

    private static PredictionRow BuildPredictionRow(
        CollegeDocument college,
        AdmissionRequest request,
        double percentile,
        string institutionType,
        string tier,
        string branchPrediction,
        string branchFamily,
        double historicalWeight,
        double cutoffTrend,
        double priorityScore,
        IReadOnlyDictionary<string, double> rankingLookup)
    {
        var sameState = !string.IsNullOrWhiteSpace(request.HomeState) && string.Equals(request.HomeState.Trim(), college.State.Trim(), StringComparison.OrdinalIgnoreCase) ? 1.0 : 0.0;
        var branchMatch = string.Equals(InferBranchFamily(branchPrediction), branchFamily, StringComparison.OrdinalIgnoreCase) ? 1.0 : 0.0;

        return new PredictionRow
        {
            Label = false,
            ExamType = request.ExamType,
            Rank = request.Rank,
            Percentile = (float)percentile,
            Category = request.Category,
            Gender = request.Gender,
            HomeState = request.HomeState?.Trim() ?? string.Empty,
            Quota = request.Quota,
            PreferredBranch = branchPrediction,
            CollegeId = college.Id.ToString(),
            CollegeName = college.Name,
            CollegeState = college.State,
            CollegeType = college.Type,
            InstitutionType = institutionType,
            Tier = tier,
            BranchFamily = branchFamily,
            BranchCompetitiveness = (float)GetBranchCompetitiveness(branchPrediction),
            HistoricalCutoffWeight = (float)historicalWeight,
            CutoffTrend = (float)cutoffTrend,
            PriorityScore = (float)priorityScore,
            Fees = (float)college.Fees,
            Rating = (float)college.Rating,
            PlacementRate = (float)college.PlacementRate,
            AveragePackage = (float)college.AveragePackage,
            TotalStudents = (float)college.TotalStudents,
            FacultyCount = (float)college.FacultyCount,
            MinRank = (float)college.MinRank,
            MaxRank = (float)college.MaxRank,
            TierScore = (float)GetTierScore(tier),
            SameState = (float)sameState,
            BranchMatch = (float)branchMatch,
            NirfScore = (float)GetNirfScore(college, rankingLookup),
        };
    }

    private float ScoreRow(PredictionRow row)
    {
        if (_engines.Count == 0)
        {
            return 0.5f;
        }

        var probabilities = new List<float>();
        foreach (var engine in _engines.Values)
        {
            var prediction = engine.Predict(row);
            probabilities.Add(prediction.Probability);
        }

        return probabilities.Count > 0 ? probabilities.Average() : 0.5f;
    }

    private static string PredictBranch(CollegeDocument college, AdmissionRequest request)
    {
        if (!string.IsNullOrWhiteSpace(request.PreferredBranch))
        {
            return request.PreferredBranch.Trim();
        }

        var type = college.Type.ToLowerInvariant();
        var name = college.Name.ToLowerInvariant();
        if (type.Contains("medical") || name.Contains("aiims"))
        {
            return "MBBS";
        }

        if (type.Contains("engineering") || type.Contains("technology") || name.Contains("iit") || name.Contains("nit"))
        {
            return college.Courses.FirstOrDefault(course => course.Contains("Computer", StringComparison.OrdinalIgnoreCase) || course.Contains("CSE", StringComparison.OrdinalIgnoreCase) || course.Contains("IT", StringComparison.OrdinalIgnoreCase))
                   ?? "Computer Science";
        }

        return college.Courses.FirstOrDefault() ?? "General";
    }

    private static bool IsCollegeRelevantForExam(CollegeDocument college, string exam)
    {
        var institutionType = InferInstitutionType(college);
        return exam switch
        {
            "jee-advanced" => institutionType is "IIT" or "ENGINEERING_COLLEGE" or "TOP_PRIVATE_UNIVERSITY" or "STATE_UNIVERSITY" or "OTHER",
            "jee-main" => institutionType is "NIT" or "IIIT" or "GFTI" or "ENGINEERING_COLLEGE" or "STATE_UNIVERSITY" or "TOP_PRIVATE_UNIVERSITY" or "OTHER",
            "neet" => institutionType is "AIIMS" or "GOVT_MEDICAL" or "MEDICAL_COLLEGE" or "PRIVATE_MEDICAL" or "TOP_PRIVATE_UNIVERSITY" or "OTHER",
            _ => true,
        };
    }

    private static string InferInstitutionType(CollegeDocument college)
    {
        var text = $"{college.Name} {college.Type}".ToLowerInvariant();
        if (text.Contains("indian institute of technology") || text.Contains("iit")) return "IIT";
        if (text.Contains("national institute of technology") || text.Contains("nit")) return "NIT";
        if (text.Contains("indian institute of information technology") || text.Contains("iiit")) return "IIIT";
        if (text.Contains("all india institute of medical sciences") || text.Contains("aiims")) return "AIIMS";
        if (text.Contains("medical"))
        {
            if (text.Contains("private") || text.Contains("deemed")) return "PRIVATE_MEDICAL";
            if (text.Contains("government") || text.Contains("govt") || text.Contains("state")) return "GOVT_MEDICAL";
            return "MEDICAL_COLLEGE";
        }
        if (text.Contains("university"))
        {
            if (text.Contains("bits") || text.Contains("vit") || text.Contains("manipal") || text.Contains("srm") || text.Contains("amity") || text.Contains("thapar")) return "TOP_PRIVATE_UNIVERSITY";
            if (text.Contains("state")) return "STATE_UNIVERSITY";
            return "TOP_PRIVATE_UNIVERSITY";
        }
        if (text.Contains("gfti")) return "GFTI";
        if (text.Contains("engineering") || text.Contains("technology") || text.Contains("college")) return "ENGINEERING_COLLEGE";
        return "OTHER";
    }

    private static string EstimateTier(string institutionType, double rating, double placementRate, double maxRank, double minRank)
    {
        var quality = Math.Clamp((rating / 5.0) * 0.45 + (placementRate / 100.0) * 0.35 + (1.0 - Math.Clamp(maxRank / Math.Max(1.0, minRank + maxRank), 0, 1)) * 0.2, 0, 1);
        if (institutionType is "IIT" or "AIIMS")
        {
            if (quality >= 0.88) return "Tier 1A";
            if (quality >= 0.8) return "Tier 1B";
            return "Tier 1";
        }

        if (quality >= 0.8) return "Tier 1";
        if (quality >= 0.64) return "Tier 2";
        if (quality >= 0.48) return "Tier 3";
        return "Tier 4";
    }

    private static double GetTierScore(string tier) => tier switch
    {
        "Tier 1A" => 1.0,
        "Tier 1B" => 0.96,
        "Tier 1" => 0.9,
        "Tier 2" => 0.74,
        "Tier 3" => 0.54,
        _ => 0.34,
    };

    private static int GetTierOrder(string tier) => tier switch
    {
        "Tier 1A" => 6,
        "Tier 1B" => 5,
        "Tier 1" => 4,
        "Tier 2" => 3,
        "Tier 3" => 2,
        _ => 1,
    };

    private static int GetPriorityOrder(string institutionType) => institutionType switch
    {
        "IIT" => 9,
        "AIIMS" => 9,
        "NIT" => 8,
        "IIIT" => 7,
        "GFTI" => 6,
        "GOVT_MEDICAL" => 6,
        "MEDICAL_COLLEGE" => 5,
        "PRIVATE_MEDICAL" => 4,
        "TOP_PRIVATE_UNIVERSITY" => 4,
        "STATE_UNIVERSITY" => 3,
        "ENGINEERING_COLLEGE" => 3,
        _ => 2,
    };

    private static double GetPriorityScore(string institutionType, string tier, CollegeDocument college)
    {
        var typeWeight = GetPriorityOrder(institutionType) / 9.0;
        var tierWeight = GetTierScore(tier);
        var qualityWeight = Math.Clamp((college.Rating / 5.0) * 0.4 + (college.PlacementRate / 100.0) * 0.3, 0, 1);
        return Math.Clamp(typeWeight * 0.45 + tierWeight * 0.35 + qualityWeight * 0.2, 0, 1);
    }

    private static string InferBranchFamilyFromCollege(CollegeDocument college)
    {
        var text = $"{college.Name} {college.Type} {string.Join(' ', college.Courses)}".ToLowerInvariant();
        if (text.Contains("mbbs") || text.Contains("bds") || text.Contains("pharmacy") || text.Contains("nursing") || text.Contains("medical")) return "medical";
        if (text.Contains("computer") || text.Contains("cse") || text.Contains("it") || text.Contains("ai") || text.Contains("data")) return "cse";
        if (text.Contains("electronics") || text.Contains("ece") || text.Contains("electrical")) return "electronics";
        if (text.Contains("mechanical")) return "mechanical";
        if (text.Contains("civil")) return "civil";
        return "general";
    }

    private static string InferBranchFamily(string branch)
    {
        var text = branch.ToLowerInvariant();
        if (text.Contains("mbbs") || text.Contains("bds") || text.Contains("pharmacy") || text.Contains("nursing") || text.Contains("medical")) return "medical";
        if (text.Contains("computer") || text.Contains("cse") || text.Contains("it") || text.Contains("ai") || text.Contains("data")) return "cse";
        if (text.Contains("electronics") || text.Contains("ece") || text.Contains("electrical")) return "electronics";
        if (text.Contains("mechanical")) return "mechanical";
        if (text.Contains("civil")) return "civil";
        return "general";
    }

    private static double GetBranchCompetitiveness(string branch)
    {
        var family = InferBranchFamily(branch);
        return family switch
        {
            "medical" => 5,
            "cse" => 5,
            "electronics" => 4,
            "mechanical" => 3,
            "civil" => 2,
            _ => 1,
        } / 5.0;
    }

    private static double GetBranchFactor(string branch, string exam)
    {
        var family = InferBranchFamily(branch);
        if (exam == "neet") return family == "medical" ? 1.0 : 0.25;
        return family switch
        {
            "cse" => 0.96,
            "electronics" => 0.9,
            "mechanical" => 0.82,
            "civil" => 0.76,
            _ => 0.86,
        };
    }

    private static double GetCategoryFactor(string category) => category switch
    {
        "GENERAL" => 1.0,
        "EWS" => 1.06,
        "OBC" => 1.18,
        "SC" => 1.42,
        "ST" => 1.62,
        _ => 1.0,
    };

    private static double GetQuotaFactor(string quota) => quota == "HS" ? 1.08 : 1.0;

    private static double GetGenderFactor(string gender) => gender switch
    {
        "female" => 1.03,
        "other" => 1.01,
        _ => 1.0,
    };
    private static string? ResolveConfigurationValue(IConfiguration configuration, string primaryKey, string fallbackKey)
    {
        var value = configuration[primaryKey];
        if (!string.IsNullOrWhiteSpace(value))
        {
            return value;
        }

        value = configuration[fallbackKey];
        return string.IsNullOrWhiteSpace(value) ? null : value;
    }

    private static string? LoadLocalEnvValue(string key)
    {
        var candidateFiles = new[]
        {
            Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), ".env")),
            Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", ".env")),
            Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "backend", ".env")),
            Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", ".env")),
        };

        foreach (var candidateFile in candidateFiles.Distinct(StringComparer.OrdinalIgnoreCase))
        {
            if (!File.Exists(candidateFile))
            {
                continue;
            }

            foreach (var line in File.ReadLines(candidateFile))
            {
                var trimmed = line.Trim();
                if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith('#'))
                {
                    continue;
                }

                var equalsIndex = trimmed.IndexOf('=');
                if (equalsIndex <= 0)
                {
                    continue;
                }

                var envKey = trimmed[..equalsIndex].Trim();
                if (!string.Equals(envKey, key, StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                return trimmed[(equalsIndex + 1)..].Trim().Trim('"').Trim('\'');
            }
        }

        return null;
    }

    private double GetHistoricalCutoffWeight(CollegeDocument college, IReadOnlyCollection<CutoffRecord> cutoffs, string exam, string category, string branch)
    {
        var matching = cutoffs.Where(c =>
            string.Equals(c.Exam, exam, StringComparison.OrdinalIgnoreCase) &&
            (c.Category.Equals(category, StringComparison.OrdinalIgnoreCase) || c.Category == "OPEN" || (category == "GENERAL" && c.Category == "OPEN")) &&
            c.CollegeName.Contains(college.Name, StringComparison.OrdinalIgnoreCase));

        var best = matching.OrderByDescending(c => c.Year).FirstOrDefault();
        if (best is null)
        {
            return Math.Clamp(1.0 - (college.MaxRank / Math.Max(1.0, college.MaxRank + college.MinRank + 1000)), 0.08, 0.92);
        }

        var trend = Math.Clamp((best.ClosingRank - best.OpeningRank) / Math.Max(1.0, best.ClosingRank), 0, 1);
        return Math.Clamp(0.55 + trend * 0.4, 0.1, 0.95);
    }

    private double GetCutoffTrend(CollegeDocument college, IReadOnlyCollection<CutoffRecord> cutoffs)
    {
        var matches = cutoffs.Where(c => c.CollegeName.Contains(college.Name, StringComparison.OrdinalIgnoreCase)).ToList();
        if (matches.Count < 2)
        {
            return 0.58;
        }

        var latest = matches.OrderByDescending(c => c.Year).Take(2).ToArray();
        var trend = (latest[0].ClosingRank - latest[1].ClosingRank) / Math.Max(1.0, latest[1].ClosingRank);
        return Math.Clamp(0.55 + trend * 0.25, 0.25, 0.9);
    }

    private static double GetConfidence(float probability, double historicalWeight, double cutoffTrend)
    {
        var confidence = 0.55 + probability * 0.25 + historicalWeight * 0.1 + cutoffTrend * 0.1;
        return Math.Clamp(confidence, 0.5, 0.98);
    }

    private static string GetMatchBand(double probability) => probability switch
    {
        >= 80 => "Safe",
        >= 60 => "Moderate",
        >= 35 => "Reach",
        _ => "Dream",
    };

    private static string GetDifficultyBand(double probability) => probability switch
    {
        >= 70 => "easy",
        >= 40 => "medium",
        _ => "hard",
    };

    private static string GetAdmissionCategory(double probability) => probability switch
    {
        >= 75 => "Safe",
        >= 40 => "Moderate",
        _ => "Ambitious",
    };

    private static double RankToPercentile(string exam, int rank)
    {
        var total = exam switch
        {
            "jee-advanced" => 180000,
            "neet" => 2400000,
            _ => 1200000,
        };

        return Math.Clamp((1.0 - Math.Clamp(rank, 1, total) / (double)total) * 100.0, 0.01, 99.99);
    }

    private static double GetNirfScore(CollegeDocument college, IReadOnlyDictionary<string, double> rankings)
    {
        var keys = new[] { college.Name, college.Name.ToLowerInvariant(), college.Name.Replace(" ", string.Empty, StringComparison.OrdinalIgnoreCase) };
        var best = keys.Select(key => rankings.TryGetValue(NormalizeKey(key), out var rank) ? rank : double.NaN)
            .Where(rank => !double.IsNaN(rank))
            .DefaultIfEmpty(double.NaN)
            .Min();

        if (double.IsNaN(best))
        {
            return Math.Clamp((college.Rating / 5.0) * 0.4 + (college.PlacementRate / 100.0) * 0.3, 0, 1);
        }

        return Math.Clamp(1.0 - best / 250.0, 0, 1);
    }

    private static string NormalizeKey(string value)
    {
        var lowered = value.ToLowerInvariant();
        var chars = lowered.Where(char.IsLetterOrDigit).ToArray();
        return new string(chars);
    }

    private double GetReferenceClosingRank(CollegeDocument college, IReadOnlyCollection<CutoffRecord> cutoffs, string exam, string category, string branch)
    {
        var match = cutoffs
            .Where(c => string.Equals(c.Exam, exam, StringComparison.OrdinalIgnoreCase))
            .Where(c => c.Category.Equals(category, StringComparison.OrdinalIgnoreCase) || c.Category == "OPEN")
            .Where(c => c.CollegeName.Contains(college.Name, StringComparison.OrdinalIgnoreCase) || college.Name.Contains(c.CollegeName, StringComparison.OrdinalIgnoreCase))
            .Where(c => string.IsNullOrWhiteSpace(c.Branch) || branch.Contains(c.Branch, StringComparison.OrdinalIgnoreCase) || c.Branch.Contains(branch, StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(c => c.Year)
            .FirstOrDefault();

        if (match is not null)
        {
            return match.ClosingRank;
        }

        var institutionType = InferInstitutionType(college);
        var tier = EstimateTier(institutionType, college.Rating, college.PlacementRate, college.MaxRank, college.MinRank);
        var tierWeight = GetTierScore(tier);
        var branchFactor = GetBranchFactor(branch, exam);
        var baseRank = institutionType switch
        {
            "IIT" => 250,
            "AIIMS" => 200,
            "NIT" => 4500,
            "IIIT" => 8000,
            "GOVT_MEDICAL" => 12000,
            "GFTI" => 18000,
            "MEDICAL_COLLEGE" => 25000,
            "PRIVATE_MEDICAL" => 60000,
            "TOP_PRIVATE_UNIVERSITY" => 50000,
            "STATE_UNIVERSITY" => 75000,
            "ENGINEERING_COLLEGE" => 85000,
            _ => 90000,
        };

        return Math.Max(25, baseRank * (1.2 - tierWeight * 0.5) * branchFactor * GetCategoryFactor(category));
    }

}

