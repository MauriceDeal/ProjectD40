namespace DealCollega.Api.Integrations.Microsoft365;

public enum Microsoft365AuthenticationMode
{
    Delegated,
    Application,
}

public enum Microsoft365SourceKind
{
    SharePointDocument,
    OutlookMessage,
    OutlookEvent,
    TeamsChannelMessage,
    TeamsChatMessage,
    MicrosoftGraphSearchResult,
}

public sealed class Microsoft365GraphOptions
{
    public const string ConfigurationSectionName = "Integrations:Microsoft365";

    public string? TenantId { get; init; }
    public string? ClientId { get; init; }
    public string? RedirectUri { get; init; }
    public Microsoft365AuthenticationMode? AuthenticationMode { get; init; }
    public IReadOnlyList<string>? RequestedScopes { get; init; }

    public bool HasNonSecretRegistrationSettings =>
        !string.IsNullOrWhiteSpace(TenantId)
        && !string.IsNullOrWhiteSpace(ClientId)
        && AuthenticationMode is not null;
}

public sealed record Microsoft365PartnerQuery(
    string PartnerId,
    string QueryText,
    IReadOnlyList<Microsoft365SourceKind> SourceKinds);

public sealed record Microsoft365PartnerItem(
    string PartnerId,
    string SourceId,
    Microsoft365SourceKind SourceKind,
    DateTimeOffset? OccurredAt,
    string Title,
    string Summary,
    string? AuthorizedReference);

public interface IMicrosoftGraphAccessTokenProvider
{
    Task<string> AcquireAccessTokenAsync(CancellationToken cancellationToken);
}

public interface ISharePointDocumentReader
{
    Task<IReadOnlyList<Microsoft365PartnerItem>> GetPartnerDocumentsAsync(
        string partnerId,
        CancellationToken cancellationToken);
}

public interface IOutlookMessageReader
{
    Task<IReadOnlyList<Microsoft365PartnerItem>> GetPartnerMessagesAsync(
        string partnerId,
        CancellationToken cancellationToken);
}

public interface IOutlookEventReader
{
    Task<IReadOnlyList<Microsoft365PartnerItem>> GetPartnerEventsAsync(
        string partnerId,
        CancellationToken cancellationToken);
}

public interface ITeamsMessageReader
{
    Task<IReadOnlyList<Microsoft365PartnerItem>> GetPartnerMessagesAsync(
        string partnerId,
        CancellationToken cancellationToken);
}

public interface IMicrosoftGraphSearchReader
{
    Task<IReadOnlyList<Microsoft365PartnerItem>> SearchPartnerInformationAsync(
        Microsoft365PartnerQuery query,
        CancellationToken cancellationToken);
}

public interface IMicrosoft365PartnerContextService
{
    Task<IReadOnlyList<Microsoft365PartnerItem>> GetPartnerContextAsync(
        string partnerId,
        CancellationToken cancellationToken);
}

public sealed class Microsoft365PartnerContextService(
    ISharePointDocumentReader sharePointDocumentReader,
    IOutlookMessageReader outlookMessageReader,
    IOutlookEventReader outlookEventReader,
    ITeamsMessageReader teamsMessageReader) : IMicrosoft365PartnerContextService
{
    public async Task<IReadOnlyList<Microsoft365PartnerItem>> GetPartnerContextAsync(
        string partnerId,
        CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(partnerId);

        var sourceTasks = new Task<IReadOnlyList<Microsoft365PartnerItem>>[]
        {
            sharePointDocumentReader.GetPartnerDocumentsAsync(partnerId, cancellationToken),
            outlookMessageReader.GetPartnerMessagesAsync(partnerId, cancellationToken),
            outlookEventReader.GetPartnerEventsAsync(partnerId, cancellationToken),
            teamsMessageReader.GetPartnerMessagesAsync(partnerId, cancellationToken),
        };

        var sourceItems = await Task.WhenAll(sourceTasks);

        return sourceItems
            .SelectMany(items => items)
            .Where(item => string.Equals(item.PartnerId, partnerId, StringComparison.Ordinal))
            .OrderByDescending(item => item.OccurredAt)
            .ToArray();
    }
}