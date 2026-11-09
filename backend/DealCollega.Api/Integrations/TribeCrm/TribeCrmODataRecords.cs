using System.Text.Json.Serialization;

namespace DealCollega.Api.Integrations.TribeCrm;

public sealed record TribeCrmOrganizationDto
{
    [JsonPropertyName("ID")]
    public Guid Id { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; } = string.Empty;

    [JsonPropertyName("phoneNumber")]
    public string? PhoneNumber { get; init; }

    [JsonPropertyName("emailAddress")]
    public string? EmailAddress { get; init; }

    [JsonPropertyName("website")]
    public string? Website { get; init; }

    [JsonPropertyName("companyActivity")]
    public string? CompanyActivity { get; init; }

    [JsonPropertyName("chamberOfCommerceNumber")]
    public string? ChamberOfCommerceNumber { get; init; }

    [JsonPropertyName("chamberOfCommerceName")]
    public string? ChamberOfCommerceName { get; init; }

    [JsonPropertyName("establishmentNumber")]
    public double? EstablishmentNumber { get; init; }

    [JsonPropertyName("numberOfEmployees")]
    public double? NumberOfEmployees { get; init; }

    [JsonPropertyName("VisitingAddress")]
    public IReadOnlyList<TribeCrmAddressDto>? VisitingAddress { get; init; }

    [JsonPropertyName("PostalAddress")]
    public IReadOnlyList<TribeCrmAddressDto>? PostalAddress { get; init; }
}

public sealed record TribeCrmCustomerRelationshipDto
{
    [JsonPropertyName("ID")]
    public Guid Id { get; init; }

    [JsonPropertyName("Name")]
    public string? Name { get; init; }

    [JsonPropertyName("IsActive")]
    public bool? IsActive { get; init; }

    [JsonPropertyName("IsClosed")]
    public bool? IsClosed { get; init; }

    [JsonPropertyName("IsFormer")]
    public bool? IsFormer { get; init; }

    [JsonPropertyName("Status")]
    public TribeCrmLookupDto? Status { get; init; }

    [JsonPropertyName("AccountManager")]
    public TribeCrmLookupDto? AccountManager { get; init; }

    [JsonPropertyName("Organization")]
    public TribeCrmOrganizationReferenceDto? Organization { get; init; }
}

public sealed record TribeCrmPersonDto
{
    [JsonPropertyName("ID")]
    public Guid Id { get; init; }

    [JsonPropertyName("firstName")]
    public string? FirstName { get; init; }

    [JsonPropertyName("middleName")]
    public string? MiddleName { get; init; }

    [JsonPropertyName("lastName")]
    public string? LastName { get; init; }

    [JsonPropertyName("title")]
    public string? Title { get; init; }

    [JsonPropertyName("emailAddress")]
    public string? EmailAddress { get; init; }

    [JsonPropertyName("phoneNumber")]
    public string? PhoneNumber { get; init; }

    [JsonPropertyName("mobilePhoneNumber")]
    public string? MobilePhoneNumber { get; init; }
}

public sealed record TribeCrmContactRelationshipDto
{
    [JsonPropertyName("ID")]
    public Guid Id { get; init; }

    [JsonPropertyName("Name")]
    public string? Name { get; init; }

    [JsonPropertyName("EmailAddress")]
    public string? EmailAddress { get; init; }

    [JsonPropertyName("PhoneNumber")]
    public string? PhoneNumber { get; init; }

    [JsonPropertyName("MobilePhoneNumber")]
    public string? MobilePhoneNumber { get; init; }

    [JsonPropertyName("Department")]
    public string? Department { get; init; }

    [JsonPropertyName("Function")]
    public TribeCrmLookupDto? Function { get; init; }

    [JsonPropertyName("Role")]
    public TribeCrmLookupDto? Role { get; init; }

    [JsonPropertyName("Relation")]
    public TribeCrmOrganizationReferenceDto? Relation { get; init; }

    [JsonPropertyName("Person")]
    public TribeCrmPersonDto? Person { get; init; }
}

public sealed record TribeCrmOrganizationReferenceDto
{
    [JsonPropertyName("ID")]
    public Guid Id { get; init; }

    [JsonPropertyName("_Name")]
    public string? DisplayName { get; init; }
}

public sealed record TribeCrmLookupDto
{
    [JsonPropertyName("ID")]
    public Guid Id { get; init; }

    [JsonPropertyName("_Name")]
    public string? DisplayName { get; init; }
}

public sealed record TribeCrmAddressDto
{
    [JsonPropertyName("ID")]
    public Guid Id { get; init; }

    [JsonPropertyName("Street")]
    public string? Street { get; init; }

    [JsonPropertyName("HouseNumber")]
    public double? HouseNumber { get; init; }

    [JsonPropertyName("HouseNumberSuffix")]
    public string? HouseNumberSuffix { get; init; }

    [JsonPropertyName("Extra")]
    public string? Extra { get; init; }

    [JsonPropertyName("Postalcode")]
    public string? Postalcode { get; init; }

    [JsonPropertyName("City")]
    public string? City { get; init; }

    [JsonPropertyName("AddressType")]
    public TribeCrmLookupDto? AddressType { get; init; }
}