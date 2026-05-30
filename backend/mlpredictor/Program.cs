using CollegeHub.MLPredictor;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls(builder.Configuration["MLNET_URLS"] ?? "http://0.0.0.0:5107");
builder.Services.AddSingleton<AdmissionPredictorService>();

var app = builder.Build();
var logger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("CollegeHub.MLPredictor.Api");

app.MapGet("/health", () => Results.Ok(new
{
	status = "OK",
	service = "CollegeHub.MLPredictor",
	modelVersion = "mlnet-admission-v1",
	ready = app.Services.GetRequiredService<AdmissionPredictorService>().IsReady,
}));

app.MapPost("/train", async (AdmissionPredictorService predictor, CancellationToken cancellationToken) =>
{
	try
	{
		await predictor.ReTrainAsync(cancellationToken);
		return Results.Ok(new
		{
			message = "Model retrained",
			modelVersion = predictor.ModelVersion,
			trainSize = predictor.TrainSize,
		});
	}
	catch (InvalidOperationException ex)
	{
		logger.LogWarning(ex, "Training failed due to missing or invalid MongoDB data");
		return Results.Problem(ex.Message, statusCode: StatusCodes.Status503ServiceUnavailable);
	}
	catch (Exception ex)
	{
		logger.LogError(ex, "Training failed unexpectedly");
		return Results.Problem("Training failed", statusCode: StatusCodes.Status500InternalServerError);
	}
});

app.MapPost("/predict", async (AdmissionRequest request, AdmissionPredictorService predictor, CancellationToken cancellationToken) =>
{
	if (string.IsNullOrWhiteSpace(request.ExamType) || request.Rank <= 0)
	{
		return Results.BadRequest(new { message = "ExamType and Rank are required" });
	}

	try
	{
		var response = await predictor.PredictAsync(request, cancellationToken);
		return Results.Ok(response);
	}
	catch (InvalidOperationException ex)
	{
		logger.LogWarning(ex, "Prediction failed because MongoDB college data is unavailable");
		return Results.Problem(ex.Message, statusCode: StatusCodes.Status503ServiceUnavailable);
	}
	catch (Exception ex)
	{
		logger.LogError(ex, "Prediction failed unexpectedly");
		return Results.Problem("Prediction failed", statusCode: StatusCodes.Status500InternalServerError);
	}
});

app.Run();
