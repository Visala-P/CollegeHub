using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CollegeHub.MLPredictor;

[BsonIgnoreExtraElements]
public sealed class CollegeDocument
{
    [BsonId]
    public ObjectId Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("location")]
    public string Location { get; set; } = string.Empty;

    [BsonElement("city")]
    public string City { get; set; } = string.Empty;

    [BsonElement("state")]
    public string State { get; set; } = string.Empty;

    [BsonElement("fees")]
    public double Fees { get; set; }

    [BsonElement("rating")]
    public double Rating { get; set; }

    [BsonElement("courses")]
    public List<string> Courses { get; set; } = [];

    [BsonElement("type")]
    public string Type { get; set; } = string.Empty;

    [BsonElement("established")]
    public int Established { get; set; }

    [BsonElement("image")]
    public string Image { get; set; } = string.Empty;

    [BsonElement("placement_rate")]
    public double PlacementRate { get; set; }

    [BsonElement("average_package")]
    public double AveragePackage { get; set; }

    [BsonElement("highest_package")]
    public double HighestPackage { get; set; }

    [BsonElement("total_students")]
    public double TotalStudents { get; set; }

    [BsonElement("faculty_count")]
    public double FacultyCount { get; set; }

    [BsonElement("campus_size")]
    public string CampusSize { get; set; } = string.Empty;

    [BsonElement("min_rank")]
    public double MinRank { get; set; }

    [BsonElement("max_rank")]
    public double MaxRank { get; set; }

    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;
}

public sealed class CutoffRecord
{
    public string CollegeId { get; set; } = string.Empty;
    public string CollegeName { get; set; } = string.Empty;
    public string? Branch { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Exam { get; set; } = string.Empty;
    public int Year { get; set; }
    public int OpeningRank { get; set; }
    public int ClosingRank { get; set; }
    public string State { get; set; } = string.Empty;
}

public sealed class AdmissionRequest
{
    public string ExamType { get; set; } = string.Empty;
    public int Rank { get; set; }
    public double? Percentile { get; set; }
    public string Category { get; set; } = "GENERAL";
    public string Gender { get; set; } = "male";
    public string? HomeState { get; set; }
    public string Quota { get; set; } = "AI";
    public string? PreferredBranch { get; set; }
    public int MaxResults { get; set; } = 30;
}

public sealed class AdmissionPrediction
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public double Fees { get; set; }
    public double Rating { get; set; }
    public List<string> Courses { get; set; } = [];
    public string Type { get; set; } = string.Empty;
    public int Established { get; set; }
    public string Image { get; set; } = string.Empty;
    public double PlacementRate { get; set; }
    public double AveragePackage { get; set; }
    public double HighestPackage { get; set; }
    public double TotalStudents { get; set; }
    public double FacultyCount { get; set; }
    public string CampusSize { get; set; } = string.Empty;
    public double MinRank { get; set; }
    public double MaxRank { get; set; }
    public string Description { get; set; } = string.Empty;
    public string InstitutionType { get; set; } = string.Empty;
    public string Tier { get; set; } = string.Empty;
    public string BranchPrediction { get; set; } = string.Empty;
    public double AdmissionProbability { get; set; }
    public string MatchBand { get; set; } = string.Empty;
    public string AdmissionCategory { get; set; } = string.Empty;
    public string DifficultyBand { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public double OpeningRank { get; set; }
    public double ClosingRank { get; set; }
}

public sealed class AdmissionResponse
{
    public string ModelVersion { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int TrainSize { get; set; }
    public double InputRank { get; set; }
    public double InputPercentile { get; set; }
    public List<AdmissionPrediction> Colleges { get; set; } = [];
}

public sealed class PredictionRow
{
    public bool Label { get; set; }
    public string ExamType { get; set; } = string.Empty;
    public float Rank { get; set; }
    public float Percentile { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string HomeState { get; set; } = string.Empty;
    public string Quota { get; set; } = string.Empty;
    public string PreferredBranch { get; set; } = string.Empty;
    public string CollegeId { get; set; } = string.Empty;
    public string CollegeName { get; set; } = string.Empty;
    public string CollegeState { get; set; } = string.Empty;
    public string CollegeType { get; set; } = string.Empty;
    public string InstitutionType { get; set; } = string.Empty;
    public string Tier { get; set; } = string.Empty;
    public string BranchFamily { get; set; } = string.Empty;
    public float BranchCompetitiveness { get; set; }
    public float HistoricalCutoffWeight { get; set; }
    public float CutoffTrend { get; set; }
    public float PriorityScore { get; set; }
    public float Fees { get; set; }
    public float Rating { get; set; }
    public float PlacementRate { get; set; }
    public float AveragePackage { get; set; }
    public float TotalStudents { get; set; }
    public float FacultyCount { get; set; }
    public float MinRank { get; set; }
    public float MaxRank { get; set; }
    public float TierScore { get; set; }
    public float SameState { get; set; }
    public float BranchMatch { get; set; }
    public float NirfScore { get; set; }
}

public sealed class PredictionScore
{
    public bool PredictedLabel { get; set; }
    public float Score { get; set; }
    public float Probability { get; set; }
}
