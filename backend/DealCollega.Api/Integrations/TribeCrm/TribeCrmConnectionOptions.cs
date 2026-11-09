namespace DealCollega.Api.Integrations.TribeCrm;

public enum TribeCrmAuthenticationFlow
{
    AuthorizationCode,
    ClientCredentials,
}

public sealed class TribeCrmConnectionOptions
{
    public const string ConfigurationSectionName = "Integrations:TribeCRM";

    public string? ApiBaseUrl { get; init; }
    public Guid? OrganizationId { get; init; }
    public TribeCrmAuthenticationFlow? AuthenticationFlow { get; init; }
    public string? ClientId { get; init; }
    public string? RedirectUri { get; init; }
    public string? Scopes { get; init; }

    public bool HasReadOnlySettings(TribeCrmCredentialSet? credentials)
    {
        var scopes = Scopes?.Split(' ', StringSplitOptions.RemoveEmptyEntries) ?? [];

        if (string.IsNullOrWhiteSpace(ApiBaseUrl)
            || AuthenticationFlow is null
            || string.IsNullOrWhiteSpace(ClientId)
            || !scopes.Any(scope => scope.Equals("read", StringComparison.OrdinalIgnoreCase))
            || scopes.Any(scope => scope.Equals("write", StringComparison.OrdinalIgnoreCase))
            || string.IsNullOrWhiteSpace(credentials?.ClientSecret))
        {
            return false;
        }

        return AuthenticationFlow != TribeCrmAuthenticationFlow.AuthorizationCode
            || !string.IsNullOrWhiteSpace(RedirectUri);
    }
}

public sealed record TribeCrmCredentialSet(string? ClientSecret, string? RefreshToken);

public interface ITribeCrmCredentialProvider
{
    Task<TribeCrmCredentialSet?> GetCredentialsAsync(CancellationToken cancellationToken);
}