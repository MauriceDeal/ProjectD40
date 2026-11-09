using DealCollega.Api.Integrations.Contracts;

namespace DealCollega.Api.Integrations.TribeCrm;

public interface ITribeCrmODataReader
{
    Task<IReadOnlyList<TribeCrmOrganizationDto>> ReadOrganizationsAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<TribeCrmCustomerRelationshipDto>> ReadOrganizationCustomersAsync(Guid organizationId, CancellationToken cancellationToken);
    Task<IReadOnlyList<TribeCrmContactRelationshipDto>> ReadStandardContactsAsync(Guid organizationId, CancellationToken cancellationToken);
}

public interface ITribeCrmIdentityMap
{
    Task<string> GetOrCreatePartnerIdAsync(Guid organizationSourceId, CancellationToken cancellationToken);
    Task<Guid?> FindOrganizationSourceIdAsync(string partnerId, CancellationToken cancellationToken);
    Task<string> GetOrCreateContactIdAsync(Guid personSourceId, CancellationToken cancellationToken);
}

public sealed class TribeCrmReadOnlyAdapter(
    ITribeCrmODataReader reader,
    ITribeCrmIdentityMap identityMap) : ICrmPartnerSource, ICrmContactSource, ICrmCustomerRelationshipSource
{
    public async Task<IReadOnlyList<CrmPartnerRecord>> GetPartnersAsync(CancellationToken cancellationToken)
    {
        var organizations = await reader.ReadOrganizationsAsync(cancellationToken);
        var results = new List<CrmPartnerRecord>(organizations.Count);

        foreach (var organization in organizations)
        {
            results.Add(await MapOrganizationAsync(organization, cancellationToken));
        }

        return results;
    }

    public async Task<IReadOnlyList<CrmContactRecord>> GetContactsAsync(string partnerId, CancellationToken cancellationToken)
    {
        var organizationId = await RequireOrganizationSourceIdAsync(partnerId, cancellationToken);
        var relationships = await reader.ReadStandardContactsAsync(organizationId, cancellationToken);
        var results = new List<CrmContactRecord>(relationships.Count);

        foreach (var relationship in relationships)
        {
            if (relationship.Relation?.Id != organizationId)
            {
                throw new InvalidOperationException("TribeCRM-contactrelatie hoort niet bij de opgevraagde organisatie.");
            }

            results.Add(await MapContactAsync(relationship, partnerId, cancellationToken));
        }

        return results;
    }

    public async Task<IReadOnlyList<CrmCustomerRelationshipRecord>> GetCustomerRelationshipsAsync(string partnerId, CancellationToken cancellationToken)
    {
        var organizationId = await RequireOrganizationSourceIdAsync(partnerId, cancellationToken);
        var relationships = await reader.ReadOrganizationCustomersAsync(organizationId, cancellationToken);
        var results = new List<CrmCustomerRelationshipRecord>();

        foreach (var relationship in relationships.Where(item => item.Organization?.Id == organizationId))
        {
            results.Add(new CrmCustomerRelationshipRecord(
                partnerId,
                relationship.Id.ToString("D"),
                relationship.Name,
                relationship.IsActive,
                relationship.IsClosed,
                relationship.IsFormer,
                relationship.Status?.DisplayName,
                relationship.AccountManager?.DisplayName));
        }

        return results;
    }

    private async Task<CrmPartnerRecord> MapOrganizationAsync(TribeCrmOrganizationDto organization, CancellationToken cancellationToken)
    {
        var partnerId = await identityMap.GetOrCreatePartnerIdAsync(organization.Id, cancellationToken);
        var addresses = new List<CrmAddressRecord>();

        AddAddresses(addresses, organization.VisitingAddress, "VisitingAddress");
        AddAddresses(addresses, organization.PostalAddress, "PostalAddress");

        return new CrmPartnerRecord(
            partnerId,
            organization.Id.ToString("D"),
            organization.Name,
            organization.CompanyActivity,
            organization.PhoneNumber,
            organization.EmailAddress,
            organization.Website,
            organization.ChamberOfCommerceNumber,
            organization.ChamberOfCommerceName,
            organization.EstablishmentNumber,
            organization.NumberOfEmployees,
            addresses);
    }

    private async Task<CrmContactRecord> MapContactAsync(TribeCrmContactRelationshipDto relationship, string partnerId, CancellationToken cancellationToken)
    {
        var person = relationship.Person
            ?? throw new InvalidOperationException("TribeCRM-contactrelatie bevat geen uitgeklapte Person.");

        var contactName = string.Join(" ", new[] { person.FirstName, person.MiddleName, person.LastName }
            .Where(part => !string.IsNullOrWhiteSpace(part)));
        var contactId = await identityMap.GetOrCreateContactIdAsync(person.Id, cancellationToken);

        return new CrmContactRecord(
            contactId,
            person.Id.ToString("D"),
            relationship.Id.ToString("D"),
            partnerId,
            string.IsNullOrWhiteSpace(contactName) ? relationship.Name ?? string.Empty : contactName,
            relationship.Department,
            relationship.Function?.DisplayName,
            relationship.Role?.DisplayName,
            relationship.EmailAddress ?? person.EmailAddress,
            relationship.PhoneNumber ?? person.PhoneNumber,
            relationship.MobilePhoneNumber ?? person.MobilePhoneNumber);
    }

    private async Task<Guid> RequireOrganizationSourceIdAsync(string partnerId, CancellationToken cancellationToken)
    {
        var sourceId = await identityMap.FindOrganizationSourceIdAsync(partnerId, cancellationToken);
        return sourceId ?? throw new InvalidOperationException("Er bestaat nog geen TribeCRM-ID-koppeling voor deze interne partner-ID.");
    }

    private static void AddAddresses(List<CrmAddressRecord> results, IReadOnlyList<TribeCrmAddressDto>? addresses, string addressUse)
    {
        if (addresses is null) return;

        results.AddRange(addresses.Select(address => new CrmAddressRecord(
            address.Id.ToString("D"),
            addressUse,
            address.AddressType?.DisplayName,
            address.Street,
            address.HouseNumber,
            address.HouseNumberSuffix,
            address.Extra,
            address.Postalcode,
            address.City)));
    }
}