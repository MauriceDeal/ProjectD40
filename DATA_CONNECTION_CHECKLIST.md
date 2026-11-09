# Checklist toekomstige databronnen

## Huidige situatie

Deal Collega #40 gebruikt nu alleen fictieve Mock/Demo-data. CRM, SharePoint, Microsoft 365 en AI staan centraal op Mock ingesteld. Er zijn geen externe verbindingen actief. Deze checklist helpt informatie verzamelen voor een later ontwerp; het verzamelen ervan maakt nog geen verbinding.

**Deel nergens in deze chat of in broncode:** wachtwoorden, API-keys, client secrets, toegangstokens, certificaten/private keys, echte persoonsgegevens of vertrouwelijke documenten. Als technische toegang later nodig is, laat IT die veilig via de goedgekeurde secret store of het beveiligde beheerproces beschikbaar maken.

## 1. CRM

### Wat ik nodig heb

- [ ] Naam van het CRM-product en eventueel de versie.
- [ ] Welke omgeving als eerste gebruikt mag worden: test/sandbox of productie. Begin bij voorkeur met test/sandbox.
- [ ] Welke CRM-records de Partner 360-relatie voorstellen en hoe ik herken welke partnergegevens bruikbaar zijn.
- [ ] Een geschoond voorbeeld of schema van een partnerrecord en contactrecord. Verwijder namen, e-mailadressen, telefoonnummers en andere echte persoonsgegevens.
- [ ] Een uitleg welke velden de relatiebeheerder in Deal Collega moet kunnen zien.

### Waar vind ik dit waarschijnlijk?

- De naam en omgeving vind je mogelijk in het CRM-inlogscherm of de interne applicatielijst.
- Veldnamen en recordsoorten vind je meestal in CRM-schermen, rapportages, datadocumentatie of een export met uitsluitend testgegevens.
- Vraag de CRM-applicatiebeheerder wie eigenaar is van de gegevens en van de integratie.

### Wat kan ik bij IT of de CRM-beheerder opvragen?

- [ ] Officiële API-/SDK-documentatie en informatie over de ondersteunde CRM-omgeving.
- [ ] Welke authenticatiemethode en minimale leesrechten zijn toegestaan.
- [ ] Of een sandbox en een niet-geheime testgebruiker/testrol beschikbaar zijn.
- [ ] Hoe paginering, gebruikslimieten, recordwijzigingen en verwijderde/inactieve relaties worden verwerkt.
- [ ] Wie toestemming kan geven voor read-only toegang.

### Technische gegevens die later nodig zijn

- Stabiele CRM-partner-ID en veldmapping naar naam, categorie/sector, regio, status, eigenaar en eventueel waarde/samenvatting.
- Stabiele contact-ID, gekoppelde partner-ID, rol, primaire-contactindicatie en toegestane contactvelden.
- Voor contactmomenten: bron-ID, partner-ID, optionele contact-ID, datum/tijd en tijdzone, type, onderwerp, deelnemers en toegestane samenvatting.
- Voor acties: bron-ID, partner-ID, titel, eigenaar, deadline en status.
- Voor notities: bron-ID, partner-ID, datum, auteur en expliciet toegestane tekst.
- De regels waarmee een CRM-ID gekoppeld wordt aan de interne partner-ID van Deal Collega #40.

### Rechten of toestemmingen

- Alleen-lezen toegang is genoeg voor de eerste stap.
- De CRM-eigenaar en IT-beheerder moeten toestemming geven voor de gekozen gegevens en omgeving.
- Spreek af welke gebruikers de informatie mogen zien en hoe vertrouwelijke notities worden uitgesloten.

### Gegevens die we uiteindelijk willen ophalen

- Partnerbasisgegevens, contactpersonen en primaire contactpersoon.
- Daarna eventueel contactmomenten, open acties en toegestane interne notities.

### Niet delen

Plak geen CRM-wachtwoord, API-key, client secret, token, echte CRM-export of persoonsgegevens in deze chat, checklist of broncode. Een echte basis-URL of tenantwaarde deelt u pas via het afgesproken interne IT-proces; vul die hier niet in.

## TRIBECRM

De technische namen hieronder komen uitsluitend uit de [officiële TribeCRM API-documentatie](https://developer.tribecrm.nl/). Er is nog geen verbinding. De code bevat alleen DTO’s, mapping en een reader-interface zonder netwerkimplementatie.

### Welke officiële entiteiten zijn relevant?

- **`Relation_Organization`**: het organisatie-/bedrijfsrecord zelf. Gedocumenteerde gegevens zijn onder andere `ID` (Guid), `name`, `phoneNumber`, `emailAddress`, `website`, `companyActivity`, `chamberOfCommerceNumber`, `chamberOfCommerceName`, `establishmentNumber` en `numberOfEmployees`.
- **`Relationship_Organization_CommercialRelationship_Customer`**: de Customer-rol van een organisatie, niet de organisatie zelf. Heeft een eigen `ID`, `Name`, `IsActive`, `IsClosed` en `IsFormer`; `Organization`, `Status` en `AccountManager` zijn gerelateerde gegevens.
- **`Relation_Person`**: de persoon zelf. Gedocumenteerde velden zijn `ID` (Guid), `firstName`, `middleName`, `lastName`, `title`, `emailAddress`, `phoneNumber` en `mobilePhoneNumber`. Let op: `title` betekent aanspreektitel zoals Mr/Ms/Dr, niet functie.
- **`Relationship_Person_Contact_Standard`**: de koppeling die een persoon contact bij een organisatie maakt. Heeft een eigen `ID`, `Name`, `EmailAddress`, `PhoneNumber`, `MobilePhoneNumber` en `Department`. `Function` en `Role` zijn lookup-relaties. `Relation` verwijst naar de organisatie en `Person` naar de persoon.
- **`Address`**: gekoppelde adressen met `Street`, `HouseNumber`, `HouseNumberSuffix`, `Extra`, `Postalcode` en `City`. Een organisatie kan meerdere bezoek- en postadressen hebben.

Documentatie: [Organisations](https://developer.tribecrm.nl/docs/api/relations/customers), [Persons](https://developer.tribecrm.nl/docs/api/relations/contacts), [Customer relationships](https://developer.tribecrm.nl/docs/api/relationships/customer), [Contact relationships](https://developer.tribecrm.nl/docs/api/relationships/contact), [Addresses](https://developer.tribecrm.nl/docs/api/entities/addresses), [Data Model](https://developer.tribecrm.nl/docs/api/concepts/data-model), [OData](https://developer.tribecrm.nl/docs/api/concepts/odata) en [Authentication](https://developer.tribecrm.nl/docs/api/concepts/authentication).

### Wat moet ik nog uit onze organisatie verzamelen?

- [ ] Bevestig of Partner 360 **alle organisaties** in TribeCRM moet tonen, of alleen organisaties met de Customer-rol. De documentatie maakt duidelijk dat een Customer een rol is; organisaties kunnen ook andere rollen hebben.
- [ ] Bevestig welke Standard Contacts en eventueel andere contactsoorten gebruikt mogen worden. De documentatie noemt Standard Contact en Employee als verschillende relatievarianten.
- [ ] Vraag de CRM-beheerder om de tenant-specifieke metadata/schema-export, zonder records met persoonsgegevens. Daarmee controleren we welke velden en relatieverbindingen in jullie eigen TribeCRM zijn ingeschakeld.
- [ ] Bevestig welk adres leidend is wanneer een organisatie meerdere `VisitingAddress`- of `PostalAddress`-records heeft.
- [ ] Bevestig of `companyActivity` de juiste invulling is voor sector/categorie en hoe eventuele Customer-statussen naar Deal Collega-statussen vertaald mogen worden.
- [ ] Bevestig welke contactlookup (`Function`, `Role`) als functie/rol in Partner 360 mag worden getoond.
- [ ] Vraag of er tenant-specifieke velden of relatievarianten zijn die noodzakelijk zijn voor Partner 360. Custom velden kunnen volgens de documentatie UUID-gebaseerde API-namen hebben.
- [ ] Kies met IT en de CRM-eigenaar een blijvende interne ID-opslag voor de koppeling tussen TribeCRM-ID’s en Deal Collega-ID’s.

### Waar vind ik dit waarschijnlijk?

- De officiële standaardentiteiten en velden staan in de TribeCRM-documentatie hierboven.
- De tenant-specifieke velden en verbindingen kan de TribeCRM-beheerder bekijken in de configuratie van Relations/Contacts. De officiële Data Model-documentatie beschrijft ook de `$metadata`-schemafunctie; laat IT een geschoonde schema-export beoordelen.
- Welke organisaties jullie als Partner 360-relaties beschouwen, vind je samen met de CRM-data-eigenaar of proceseigenaar.

### Wat moet ik bij IT/CRM-beheer opvragen?

- [ ] Een test/sandboxomgeving en toestemming voor uitsluitend lezen.
- [ ] De officiële TribeCRM-authenticatiekeuze. De officiële docs beschrijven Authorization Code en Client Credentials; IT moet bepalen welke past bij onze gebruikers- en servercontext.
- [ ] Welke rechten/scopes minimaal nodig zijn om alleen de bevestigde organisatie-, contact- en relatiegegevens te lezen.
- [ ] Bevestiging dat de client later uitsluitend server-side draait en dat geheimen in de goedgekeurde secret store komen.
- [ ] Hoe wijzigingen, gesloten/inactieve relaties, paginering en limieten worden behandeld. De TribeCRM OData-documentatie noemt een maximum van 100 records per pagina en vereist sortering bij paginering.
- [ ] Wie toestemming geeft voor toegang en wie de interne ID-mapping beheert.
- [ ] Welke officiële OAuth-flow IT kiest: Authorization Code (met gebruikerstoestemming) of Client Credentials (server-to-server).
- [ ] Wie de applicatieregistratie en eventuele toestemming in TribeCRM mag beheren. Er is nog geen applicatie aangemaakt.

### Niet-geheime configuratie die later nodig is

- [ ] Bevestig de API-basis uit de officiële TribeCRM-documentatie en of jullie omgeving een aparte organisatie-ID nodig heeft. Er staat nu geen basis-URL of organisatie-ID in de configuratie.
- [ ] De gekozen OAuth-flow.
- [ ] Client ID (dit is geen Client Secret, maar deel het alsnog alleen via het afgesproken IT-configuratieproces).
- [ ] Bij Authorization Code: de door IT gekozen en geregistreerde redirect-URI.
- [ ] De gewenste scopes. De eerste test moet alleen lezen; laat de CRM-beheerder bevestigen dat de gekozen flow een scope zonder schrijfrechten ondersteunt. De codeguard accepteert `read` en weigert `write`.
- [ ] Of de CRM-organisatie-ID nodig is voor de gekozen setup; in de officiële Authorization Code-flow staat deze als optioneel.
- [ ] Waar de beheerder de geheimen veilig zal beheren. Client Secret en tokens worden later door een server-side secret provider gelezen; er komt geen waarde in `appsettings.json`, frontendconfig of repository.

De officiële TribeCRM-documentatie beschrijft Authorization Code en Client Credentials. Bij Authorization Code is de redirect-URI verplicht en wordt de code server-side ingewisseld. Bij Client Credentials gelden de rechten van de applicatiegebruiker. Laat IT bepalen welke variant past en controleer de toegestane scopes; er is nog geen flow gekozen of geregistreerd.

### Hoe koppelen de gegevens aan Partner 360?

- `Relation_Organization.ID` is de CRM-ID van het organisatie-record. Die wordt opgezocht in een duurzame ID-map en gekoppeld aan een aparte interne `PartnerId`; de CRM-Guid wordt niet de UI-ID.
- Een eventuele Customer-relatie heeft een eigen relatie-ID. Die wordt apart bewaard en niet verward met de organisatie-ID.
- `Relation_Person.ID` identificeert de persoon. `Relationship_Person_Contact_Standard.ID` identificeert de contactrol. De Contact-relatie bevat ook `Relation.ID`, waarmee het contact aan de organisatie wordt gekoppeld.
- Het interne profiel krijgt uitsluitend Deal Collega-velden. TribeCRM-DTO’s blijven achter de adapter en worden niet direct aan het scherm geleverd.
- De adapter bevat alleen leesmethoden en mapping. Er komt geen OData-client of echte request bij totdat de benodigde gegevens en goedkeuring zijn aangeleverd.

### Welke gegevens willen we uiteindelijk ophalen?

- Organisatie: stabiele bron-ID, naam, bedrijfsactiviteit, telefoon, e-mail, website en eventueel KVK-naam/-nummer, vestigingsnummer en personeelsaantal.
- Adressen: alle relevante bezoek-/postadressen met type, straat, huisnummer/toevoeging, postcode en plaats; de keuze van een hoofdadres volgt pas na jullie bevestiging.
- Contacten: stabiele persoon-ID, contactrelatie-ID, partner-ID, naam, afdeling, functie-/rol-labels en zakelijke contactgegevens.
- Alleen als bevestigd: Customer-rol met eigen bron-ID, actieve/gesloten/voormalige status, statuslabel en accountmanager.
- Bank- en fiscale gegevens worden niet in de eerste Partner 360-mapping opgenomen.

### Niet delen

Plak geen Client ID/Secret, access- of refresh-token, wachtwoord, API-key, echte CRM-records, persoonsgegevens of tenantgeheimen in deze chat of broncode. Deel ook geen ongeschoonde `$metadata`-export als die tenant- of persoonsgegevens bevat. IT bewaart eventuele geheimen later via de goedgekeurde secret store.

## 2. SHAREPOINT

### Wat ik nodig heb

- [ ] Welke SharePoint-site, documentbibliotheek of documentsoort relevant kan zijn voor Partner 360.
- [ ] Hoe een document aan een partner gekoppeld kan worden: bijvoorbeeld via een bestaande partner-ID/metadatawaarde of een door de organisatie afgesproken regel.
- [ ] Welke documentsoorten wel en niet gebruikt mogen worden.
- [ ] Een geschoond voorbeeld van documentmetadata of een leeg sjabloon. Stuur geen echt document mee.

### Waar vind ik dit waarschijnlijk?

- De site en bibliotheek zijn zichtbaar in SharePoint of Microsoft Teams; vraag de site-eigenaar welke bibliotheek leidend is.
- Metadata en kolomnamen vind je in de bibliotheekinstellingen of bij de SharePoint-beheerder.
- De eigenaar van de documenten kan aangeven welke mappen vertrouwelijk zijn.

### Wat kan ik bij IT of de SharePoint-beheerder opvragen?

- [ ] De officiële documentatie en de exacte site-/bibliotheekidentificatie voor de gekozen omgeving.
- [ ] Welke aanmeldmethode gebruikt moet worden en wie die mag goedkeuren.
- [ ] De kleinste benodigde leesrechten en hoe gebruikersrechten op documenten worden gecontroleerd.
- [ ] Welke bestandstypen, metadata en tekstextractie zijn toegestaan.
- [ ] Regels rond bewaartermijnen, gevoeligheidslabels en ingetrokken toegang.

### Technische gegevens die later nodig zijn

- Stabiele document-/item-ID en de partner-ID of gevalideerde matchregel.
- Site/bibliotheekidentificatie, documentnaam, type/contenttype, versie en wijzigingsdatum.
- Een toegangsgebonden documentverwijzing en, alleen indien toegestaan, de tekstextractie of samenvatting.
- De metadata die nodig is om toegang te controleren voordat inhoud aan Deal Collega wordt gegeven.

### Rechten of toestemmingen

- Toestemming van de site-eigenaar en IT-beheerder.
- Alleen-lezen toegang tot de gekozen bibliotheek; geen algemene toegang tot alle SharePoint-bestanden.
- Bevestiging dat de huidige gebruiker het document mag lezen voordat inhoud in een AI-context wordt gebruikt.

### Gegevens die we uiteindelijk willen ophalen

- Partnergebonden documenten met ID, naam, type, wijzigingsdatum, toegangsverwijzing en eventueel toegestane inhoud/samenvatting.

### Niet delen

Plak geen SharePoint-wachtwoord, API-key, client secret, token, echte site-URL, privélink of documentinhoud in deze chat of broncode. Laat IT site- en bibliotheekgegevens via het interne proces beschikbaar maken.

## 3. MICROSOFT 365

De Microsoft 365-bronnen blijven op **Mock**. Er is geen Entra-appregistratie, Graph-client, tokenprovider, scope, tenantverbinding of echte request. Deze checklist verzamelt alleen ontwerpkeuzes; het invullen ervan verleent geen toegang.

### Gebruik en partnerkoppeling

- [ ] Welke concrete use cases zijn goedgekeurd: documenten, e-mail, agenda, Teams-kanaalberichten, Teams-chatberichten en/of zoeken?
- [ ] Welke gebruikers, mailboxen, agenda’s, sites/bibliotheken, teams/kanalen en periode vallen binnen de scope? Leg ook expliciet vast wat uitgesloten blijft.
- [ ] Welke bestaande, stabiele partner-ID of gecontroleerde metadataregel koppelt elk item aan een interne Deal Collega-partner? Gebruik geen onbetrouwbare naam- of vrije-tekstmatch als autorisatie.
- [ ] Welke velden en inhoud mogen zichtbaar zijn in Partner 360 en aan AI-context worden meegegeven? Bepaal apart of body/preview, bijlagen, replies, deelnemers en privé-/gevoelige items uitgesloten zijn.
- [ ] Welke bronverwijzing mag aan de gebruiker worden getoond en hoe wordt toegang opnieuw gecontroleerd wanneer die link wordt geopend?

### Bronnen en minimale gegevens

- **SharePoint/OneDrive:** Graph `driveItem` en eventueel SharePoint `listItem`; bepaal de site, bibliotheek/lijst, partnerkoppelmetadata, bestandstypen, metadata en of bestandsinhoud nodig is. Vraag geen toegang tot alle bestanden aan.
- **Outlook-mail:** Graph `message`; begin met de vraag of alleen basisvelden volstaan. `Mail.ReadBasic` is een mogelijke delegated read-only kandidaat voor basisgegevens, maar bevat geen body, preview of bijlagen. Inhoud vereist een andere permission en aparte privacy-/securitygoedkeuring.
- **Outlook-agenda:** Graph `event`; bepaal welke agenda’s en velden nodig zijn. `Calendars.ReadBasic` is een mogelijke delegated read-only kandidaat voor beperkte eventgegevens; laat IT de exacte veldbehoefte en permission valideren.
- **Teams:** Graph `chatMessage`; kies expliciet kanaal, chat of beide. Rechten verschillen per API en context. Onderzoek resource-specific consent (RSC) voor een concreet team/chat waar passend; vraag niet standaard tenantbrede `Chat.Read.All` of `ChannelMessage.Read.All` aan.
- **Microsoft Graph Search:** optioneel, pas na vaststellen van de bron/entity types en directe bronrechten. Search-permissions verschillen per type en kunnen breed zijn; behandel Search niet als standaard tenantbrede toegang.

### Vragen aan Entra-/Microsoft 365-beheer

- [ ] Wie is eigenaar van de appregistratie, consent, gegevensbronnen en periodieke toegangsreview?
- [ ] Welke accounttypen en gebruikersgroepen mogen de app gebruiken?
- [ ] Kies de auth-flow en onderbouw die keuze. Gebruik delegated access namens de gebruiker als dat volstaat: toegang blijft dan begrensd door zowel apprechten als diens bestaande bronrechten.
- [ ] Als een service-to-service scenario application permissions vereist: documenteer waarom delegated niet volstaat, welke gegevens/resources bereikbaar worden, hoe dit aanvullend wordt begrensd en wie admin consent verleent. Application permissions kunnen veel breder bereik hebben.
- [ ] Laat de beheerder per gekozen API/resource de kleinste read-only delegated of application permission bevestigen en documenteer consent-eigenaar en reviewdatum.
- [ ] Voor SharePoint/OneDrive Selected-permissions: laat IT de passende `Sites.Selected`, `Lists.SelectedOperations.Selected`, `ListItems.SelectedOperations.Selected` of `Files.SelectedOperations.Selected`-scope kiezen. Regel daarnaast de afzonderlijke toewijzing aan de specifieke site/lijst/item/file; consent alleen verleent geen resource-toegang.
- [ ] Voor Teams: laat IT de exacte delegated/application/RSC-optie controleren voor de gekozen API en concrete chat/team/channel. RSC is resourcegebonden en geen algemene tenanttoestemming.
- [ ] Voor Search: laat IT de permission-eisen per gekozen `entityType` en auth-context valideren voordat Search wordt opgenomen.
- [ ] Bevestig privacy, verwerkingsgrondslag/toestemming, gegevensminimalisatie, retentie/verwijdering, logging, gevoeligheidslabels, datalocatie en incident-/toegangsreview.

### Niet-geheime registratiegegevens (later, via IT-proces)

- [ ] Entra-tenanttype en tenant-ID, uitsluitend via het goedgekeurde interne configuratieproces.
- [ ] Client-/app-ID, appregistratie-eigenaar en ondersteunde accounttypen.
- [ ] Gekozen auth-modus (delegated/application) en bevestigde resource-specifieke permissions/scopes.
- [ ] Redirect-URI uitsluitend indien de gekozen delegated web-flow die nodig heeft; IT registreert de exacte URI.
- [ ] Bevestigde site-/bibliotheek-, mailbox-/agenda- en team-/channel-scope, zonder deze waarden in deze checklist te plakken.
- [ ] Goedgekeurde secret/certificaatbeheerlocatie voor eventueel noodzakelijke server-side credentials. Secretwaarden zelf worden uitsluitend rechtstreeks door IT in die secret store gezet.

### Interne datagrens

Graph-responses worden server-side naar het interne partnercontextmodel gemapt. De UI en AI krijgen geen Graph-objecten of onbegrensde zoekresultaten. De huidige frontendbron `Microsoft365Information` blijft de interne vorm; de backendcontracten zijn placeholders zonder concrete provider. Een bron die niet is geconfigureerd of geautoriseerd blijft gesloten en levert geen live data.

### Officiële Microsoft-documentatie

- [Microsoft identity platform overview](https://learn.microsoft.com/en-us/entra/identity-platform/v2-overview)
- [Microsoft Graph permissions overview and least privilege](https://learn.microsoft.com/en-us/graph/permissions-overview)
- [Selected permissions for OneDrive and SharePoint](https://learn.microsoft.com/en-us/graph/permissions-selected-overview)
- [driveItem resource](https://learn.microsoft.com/en-us/graph/api/resources/driveitem?view=graph-rest-1.0), [message resource](https://learn.microsoft.com/en-us/graph/api/resources/message?view=graph-rest-1.0), [event resource](https://learn.microsoft.com/en-us/graph/api/resources/event?view=graph-rest-1.0)
- [List channel messages](https://learn.microsoft.com/en-us/graph/api/channel-list-messages?view=graph-rest-1.0), [list chat messages](https://learn.microsoft.com/en-us/graph/api/chat-list-messages?view=graph-rest-1.0)
- [Microsoft Graph Search query and permissions](https://learn.microsoft.com/en-us/graph/api/search-query?view=graph-rest-1.0), [Search request entity types](https://learn.microsoft.com/en-us/graph/api/resources/searchrequest?view=graph-rest-1.0)

### Niet delen

Plak geen wachtwoorden, tokens, client secrets, certificaten/private keys, echte mailbox-/agenda-items, Teams-berichten, documenten, persoonsgegevens, echte resource-ID’s of tenantwaarden in deze chat, checklist of broncode. IT verstrekt eventuele configuratiewaarden uitsluitend via het afgesproken beveiligde proces; geheimen worden rechtstreeks in de goedgekeurde server-side secret store geplaatst.

## 4. AI / DEAL COLLEGA

### Wat ik nodig heb

- [ ] Welke taken Deal Collega moet ondersteunen en welke antwoorden buiten de bedoeling vallen.
- [ ] Welke partnergegevens de bot voor een antwoord mag gebruiken.
- [ ] Of de bot bronverwijzingen moet tonen en hoe hij onzekerheid of ontbrekende informatie moet melden.
- [ ] Wie de eigenaar is van de AI-keuze en wie privacy-/securitygoedkeuring geeft.

### Waar vind ik dit waarschijnlijk?

- De accountmanager en product-/proceseigenaar kunnen de gewenste ondersteuning en voorbeeldvragen beschrijven.
- De AI-platformkeuze en organisatievoorwaarden zijn op te vragen bij IT, security en de eventuele platformeigenaar.
- Gebruik voor ontwerp en test uitsluitend de bestaande mockdata of door de organisatie goedgekeurde synthetische voorbeelden.

### Wat kan ik bij IT of de AI-platformbeheerder opvragen?

- [ ] Welke AI-dienst en omgeving de organisatie heeft goedgekeurd, inclusief regio en deployment/modelversie.
- [ ] Officiële technische documentatie en het door de beheerder bevestigde servicecontract.
- [ ] Welke server-side authenticatie en minimale rechten zijn toegestaan.
- [ ] Beleid voor dataretentie, modeltraining, logging, privacy, beveiliging en regio.
- [ ] Limieten, time-outs, foutafhandeling en eventuele eisen voor contentveiligheid.

### Technische gegevens die later nodig zijn

- De goedgekeurde provider, service/deployment en versie; geen zelfbedachte URL of endpoint.
- Inputcontract met interne partner-ID, vraag, begrensde context en bronverwijzingen.
- Outputcontract met antwoord en de gebruikte bronnen.
- Toegestane contextvelden per bron, maximale omvang en regels voor gegevensminimalisatie.
- Server-side authenticatie via het door IT goedgekeurde secretbeheer; nooit in de browserconfiguratie.

### Rechten of toestemmingen

- Formele goedkeuring van de AI-service, IT/security en zo nodig privacy/juridisch.
- Goedkeuring dat de gekozen partnergegevens naar die service mogen worden gestuurd.
- Afspraken over welke documenten, notities, contactgegevens en Microsoft 365-informatie uitgesloten blijven.

### Gegevens die we uiteindelijk willen ophalen of versturen

- Naar de AI-service: de vraag en alleen de toegestane context van de momenteel geselecteerde partner, met bronverwijzingen.
- Terug van de AI-service: een antwoord en de bronnen waarop dat antwoord steunt.
- De huidige mock-AI gebruikt alleen de lokale fictieve Partner 360-context; er is geen AI-provider aangesloten.

### Niet delen

Plak geen API-key, client secret, wachtwoord, token, certificaat/private key, productieprompt met vertrouwelijke gegevens of echte partnerinformatie in deze chat, checklist of frontendbroncode. Gevoelige configuratie wordt later uitsluitend via een goedgekeurde secret store ingericht.

## EERSTE STAP VOOR MAURICE

1. Noteer de naam/versie van het CRM en vraag wie de functioneel beheerder en data-eigenaar zijn.
2. Vraag of er een test- of sandboxomgeving beschikbaar is voor een eerste read-only aansluiting.
3. Vraag de officiële CRM-API-documentatie of een geschoond schema van partner- en contactvelden; geen echte CRM-export.
4. Verzamel de beoogde partner-ID, primaire contact-ID en de manier waarop die aan elkaar gekoppeld zijn.
5. Vraag IT welke minimale leesrechten en goedkeuring nodig zijn; deel geen wachtwoorden, tokens of API-keys.