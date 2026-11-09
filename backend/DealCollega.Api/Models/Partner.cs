namespace DealCollega.Api.Models;

public sealed record PartnerActivity(
    string Date,
    string Title,
    string Description);

public sealed record Partner(
    string Id,
    string Name,
    string Category,
    string Region,
    string Status,
    string Owner,
    string ContactName,
    string ContactRole,
    string Email,
    string Phone,
    string AnnualValue,
    string LastContact,
    string LastUpdated,
    string NextAction,
    string Summary,
    IReadOnlyList<PartnerActivity> Activity);