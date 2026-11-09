using DealCollega.Api.Data;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok", data = "demo" }));
app.MapGet("/api/partners", () => Results.Ok(PartnerTestData.All));

app.Run();