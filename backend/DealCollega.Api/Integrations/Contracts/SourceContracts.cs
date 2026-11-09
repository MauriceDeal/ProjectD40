namespace DealCollega.Api.Integrations.Contracts;

public sealed record CrmPartnerRecord(
    string PartnerId,
    string SourceId,
    string Name,
    string? CompanyActivity,
    string? PhoneNumber,
    string? EmailAddress,
    string? Website,
    string? ChamberOfCommerceNumber,
    string? ChamberOfCommerceName,
    double? EstablishmentNumber,
    double? NumberOfEmployees,
    IReadOnlyList<CrmAddressRecord> Addresses);

public sealed record CrmAddressRecord(
    string SourceId,
    string AddressUse,
    string? AddressType,
    string? Street,
    double? HouseNumber,
    string? HouseNumberSuffix,
    string? Extra,
    string? Postalcode,
    string? City);

public sealed record CrmCustomerRelationshipRecord(
    string PartnerId,
    string SourceId,
    string? Name,
    bool? IsActive,
    bool? IsClosed,
    bool? IsFormer,
    string? Status,
    string? AccountManager);

public sealed record CrmContactRecord(
    string ContactId,
    string SourceId,
    string RelationshipSourceId,
    string PartnerId,
    string Name,
    string? Department,
    string? Function,
    string? Role,
    string? EmailAddress,
    string? PhoneNumber,
    string? MobilePhoneNumber);

public sealed record CrmContactActivityRecord(
    string SourceId,
    string PartnerSourceId,
    string? ContactSourceId,
    DateTimeOffset OccurredAt,
    string Kind,
    string Subject,
    string Summary);

public sealed record CrmActionRecord(
    string SourceId,
    string PartnerSourceId,
    string Title,
    string Owner,
    DateOnly? DueDate,
    string Status);

public sealed record CrmNoteRecord(
    string SourceId,
    string PartnerSourceId,
    DateTimeOffset CreatedAt,
    string Author,
    string Text);

public sealed record SharePointDocumentRecord(
    string SourceId,
    string PartnerSourceId,
    string Name,
    string ContentType,
    DateTimeOffset ModifiedAt,
    string? AuthorizedContent);

public sealed record Microsoft365InformationRecord(
    string SourceId,
    string PartnerSourceId,
    string Kind,
    DateTimeOffset OccurredAt,
    string Title,
    string AuthorizedSummary);

public sealed record DealCollegaAiRequest(
    string PartnerId,
    string Question,
    IReadOnlyDictionary<string, string> PartnerContext,
    IReadOnlyList<string> SourceReferences);

public sealed record DealCollegaAiResponse(
    string Answer,
    IReadOnlyList<string> SourceReferences);

public interface ICrmPartnerSource
{
    Task<IReadOnlyList<CrmPartnerRecord>> GetPartnersAsync(CancellationToken cancellationToken);
}

public interface ICrmContactSource
{
    Task<IReadOnlyList<CrmContactRecord>> GetContactsAsync(string partnerId, CancellationToken cancellationToken);
}

public interface ICrmCustomerRelationshipSource
{
    Task<IReadOnlyList<CrmCustomerRelationshipRecord>> GetCustomerRelationshipsAsync(string partnerId, CancellationToken cancellationToken);
}

public interface ICrmContactActivitySource
{
    Task<IReadOnlyList<CrmContactActivityRecord>> GetActivitiesAsync(string partnerSourceId, CancellationToken cancellationToken);
}

public interface ICrmActionSource
{
    Task<IReadOnlyList<CrmActionRecord>> GetOpenActionsAsync(string partnerSourceId, CancellationToken cancellationToken);
}

public interface ICrmNoteSource
{
    Task<IReadOnlyList<CrmNoteRecord>> GetNotesAsync(string partnerSourceId, CancellationToken cancellationToken);
}

public interface ISharePointDocumentSource
{
    Task<IReadOnlyList<SharePointDocumentRecord>> GetDocumentsAsync(string partnerSourceId, CancellationToken cancellationToken);
}

public interface IMicrosoft365InformationSource
{
    Task<IReadOnlyList<Microsoft365InformationRecord>> GetInformationAsync(string partnerSourceId, CancellationToken cancellationToken);
}

public interface IDealCollegaAiService
{
    Task<DealCollegaAiResponse> AnswerAsync(DealCollegaAiRequest request, CancellationToken cancellationToken);
}