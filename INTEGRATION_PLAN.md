# Integratieplan Deal Collega #40

## Doel en huidige grens

De applicatie gebruikt uitsluitend fictieve gegevens. Er zijn geen CRM-, Microsoft 365-, SharePoint- of externe AI-koppelingen. De huidige browserapp laadt de mockbronnen via domeinservices. Externe credentials en integraties horen later uitsluitend in de backend, niet in de React-app.

## Centrale bronconfiguratie

`frontend/src/config/dataSources.ts` is de centrale prototypeconfiguratie. De afzonderlijke modi zijn `crm`, `sharepoint`, `microsoft365` en `dealCollegaAi`; alle vier staan nu op `mock`. De topbar toont `CRM: Demo` en de overige bronstatussen in de tooltip. Een codeconfiguratie op `live` toont `CRM: Live niet aangesloten`; dit betekent nadrukkelijk niet dat de dienst verbonden is.

Iedere domeinservice leest de mode voor zijn bron. Bij `mock` gebruikt de service alleen zijn `mock*.ts`-bestand. Bij `live` stopt de service met een duidelijke melding via `frontend/src/integrations/unconfiguredLiveSource.ts`. Dit pad maakt geen request. Zo kan een mode niet per ongeluk een niet-bestaande of externe URL aanroepen. `VITE_USE_MOCKS` is niet meer de bronkeuze.

De frontendcontracten staan in `frontend/src/integrations/contracts.ts`. De backend-placeholders staan in `backend/DealCollega.Api/Integrations/Contracts/SourceContracts.cs`: `ICrmPartnerSource`, `ICrmContactSource`, `ICrmContactActivitySource`, `ICrmActionSource`, `ICrmNoteSource`, `ISharePointDocumentSource`, `IMicrosoft365InformationSource` en `IDealCollegaAiService`. Er zijn geen implementaties, registrations, endpoints of credentials toegevoegd.

De huidige mockbestanden zijn `mockPartners.ts`, `mockContacts.ts`, `mockContactActivities.ts`, `mockPartnerActions.ts`, `mockPartnerDocuments.ts` en `mockPartnerNotes.ts`. Microsoft 365 is afzonderlijk configureerbaar maar levert nu bewust een lege mockcollectie. `mockAssistantService.ts` is de enige antwoordimplementatie en gebruikt uitsluitend de partnergebonden context.

## Huidige lagen

| Laag | Huidige locatie | Verantwoordelijkheid |
| --- | --- | --- |
| Gebruikersinterface | `frontend/src/App.tsx`, `frontend/src/features/partner-assistant/PartnerAssistant.tsx` | Partnerlijst, Partner 360-profiel, zoek/filter/add/export en chatbediening. Geen bronselectie of AI-logica. |
| Partnergegevens | `frontend/src/data/mockPartners.ts`, `frontend/src/services/partnerService.ts`, `frontend/src/types/partner.ts` | Partner-ID, naam, sector, regio, status, eigenaar, waarde en samenvatting. |
| Contactpersonen | `frontend/src/data/mockContacts.ts`, `frontend/src/services/contactService.ts`, `frontend/src/types/contact.ts` | Contact-ID, partner-ID, naam, rol, fictief e-mailadres/telefoon en primaire contactindicatie. |
| Contactmomenten | `frontend/src/data/mockContactActivities.ts`, `frontend/src/services/contactActivityService.ts`, `frontend/src/types/contactActivity.ts` | Gedateerde contactgebeurtenissen, beschrijving en koppeling naar partner/contact. |
| Acties | `frontend/src/data/mockPartnerActions.ts`, `frontend/src/services/partnerActionService.ts`, `frontend/src/types/partnerAction.ts` | Open of wachtende actie, eigenaar en deadline. |
| Documenten | `frontend/src/data/mockPartnerDocuments.ts`, `frontend/src/services/partnerDocumentService.ts`, `frontend/src/types/partnerDocument.ts` | Fictieve documentmetadata en samenvattingen; geen externe bestanden. |
| Notities | `frontend/src/data/mockPartnerNotes.ts`, `frontend/src/services/partnerNoteService.ts`, `frontend/src/types/partnerNote.ts` | Fictieve interne notitie, auteur en datum. |
| Partner 360-compositie | `frontend/src/services/partner360Service.ts`, `frontend/src/types/partner.ts` | Haalt de domeinen op en maakt het `Partner360Profile` dat de bestaande interface gebruikt. Dit is de vervangbare applicatiegrens voor de UI. |
| Microsoft 365-context | `frontend/src/data/mockMicrosoft365Information.ts`, `frontend/src/services/microsoft365Service.ts`, `frontend/src/types/microsoft365Information.ts` | Lege mockbron en typegrens voor later toegestane agenda-/e-mailcontext; nu geen gegevens en geen verbinding. |
| AI-context | `frontend/src/data/partnerKnowledge.ts`, `frontend/src/services/partnerContextService.ts`, `frontend/src/types/partnerKnowledge.ts` | Vormt uitsluitend de geselecteerde profiel-ID om naar een getypeerde, partnergebonden context voor Deal Collega. |
| AI/Deal Collega | `frontend/src/services/assistantService.ts`, `frontend/src/services/mockAssistantService.ts` | `assistantService` ontvangt partner-ID en vraag; de mockservice formuleert lokaal antwoord en bronvermelding. Live zonder provider faalt gesloten. De chatcomponent kent geen AI-provider. |

Alle `mock*.ts` bestanden bevatten testdata; `*Service.ts` bestanden leveren die data. Als later een bron wordt aangesloten, vervangt of configureert de implementatie de service achter hetzelfde domeincontract. De Partner 360-component hoeft daarvoor niet opnieuw te worden opgebouwd.

## Toekomstige backend-integraties

De huidige frontend-mockservices mogen voor een prototype blijven bestaan. Zodra echte data wordt toegevoegd, wordt de backend de enige plek die met externe systemen communiceert. De frontend vraagt dan eigen, beperkte `/api/partners/...` contracten op; tokens, geheimen en upstream API-details blijven server-side.

| Systeem | Beoogde backendlocatie | Gegevens die de adapter moet leveren |
| --- | --- | --- |
| CRM | `backend/DealCollega.Api/Integrations/Crm/` | Stabiele CRM-partner-ID, partnerbasisgegevens en status; contactpersonen; contactmomenten; open acties met eigenaar, deadline en status; notities voor zover de gebruiker die mag zien. Bewaar bron-ID naast de interne partner-ID voor mapping en updates. |
| Microsoft 365 | `backend/DealCollega.Api/Integrations/Microsoft365/` | Alleen relevante, geautoriseerde contactmomenten uit bijvoorbeeld agenda/e-mail: bron-ID, datum, type, deelnemers, onderwerp en toegestane samenvatting. Geen mailboxbrede ingestie; gebruik gebruikersrechten en minimale scopes. |
| SharePoint | `backend/DealCollega.Api/Integrations/SharePoint/` | Partnergebonden document-ID, site/bibliotheek, naam, type, wijzigingsdatum, toegangs-URL en toegestane tekstextractie/samenvatting. Controleer documentrechten voordat inhoud naar de AI-context gaat. |
| Documenten en kennisbronnen | `backend/DealCollega.Api/Integrations/Documents/` | Genormaliseerde documentmetadata, partnerrelatie, tekstextractie, versie/datum, herkomst en machtigingscontext. De bronadapter blijft verantwoordelijk voor ophalen en toegangscontrole. |
| Echte Deal Collega AI | `backend/DealCollega.Api/Integrations/Ai/` | Een `partnerId`, vraag, compacte partnercontext, bronverwijzingen en toegestane content. Retourneer antwoord plus gebruikte bronnen; stuur geen niet-geautoriseerde of niet-partnergebonden data mee. |

Een latere API-laag kan deze providers achter applicatieservices plaatsen, bijvoorbeeld `Partner360Service` en `DealCollegaService`. De bestaande TypeScript-contracten zijn de frontendvorm; maak bij implementatie expliciete backend-DTO's en map de upstream schema's daar naartoe in plaats van CRM- of Graph-modellen rechtstreeks aan de interface te koppelen.

## Microsoft 365-integratie

### Huidige status en architectuur

De centrale modi `sharepoint` en `microsoft365` blijven op Mock. `frontend/src/services/microsoft365Service.ts` levert nu een lege of mockcollectie en heeft geen Graph-client. `backend/DealCollega.Api/Integrations/Microsoft365/Microsoft365Contracts.cs` bevat alleen options, interne contextrecords en readerinterfaces; er is geen Graph SDK, tokenproviderimplementatie, DI-registratie of requestcode. `Microsoft365GraphOptions` reserveert uitsluitend niet-geheime Entra-configuratievelden. De toekomstige Graph-adapters mappen naar `Microsoft365PartnerItem` en daarna naar het bestaande `Microsoft365Information`-model. Partner 360 en Deal Collega blijven van Graph-objecten afgeschermd.

### Officiële Microsoft-techniek per bron

| Bron | Officiële Microsoft-resource/API | Mogelijke partnercontext |
| --- | --- | --- |
| SharePoint / OneDrive | Microsoft Graph `driveItem`; voor SharePoint documentbibliotheken ook de relatie naar `listItem`. | Bestand-ID, naam, `lastModifiedDateTime`, `webUrl`, `parentReference`, bestandstype en alleen toegestane inhoud/samenvatting. Koppel alleen via afgesproken partner-ID of gecontroleerde metadata. |
| Outlook-mail | Microsoft Graph `message`. | Bericht-ID, `subject`, afzender, ontvangers, `receivedDateTime`/`sentDateTime`, `conversationId`, link en alleen na toestemming `body`/`bodyPreview`. `Mail.ReadBasic` laat berichtinhoud, preview en bijlagen juist weg; voor inhoud is een ander recht nodig. |
| Outlook-agenda | Microsoft Graph `event`. | Event-ID, `subject`, `start`, `end`, `organizer`, `attendees`, `location`, gevoeligheid en alleen toegestane samenvatting/inhoud. Tijdzones moeten expliciet worden verwerkt. |
| Teams-kanalen | Microsoft Graph `chatMessage` via team-/channel-resource. | Bericht-ID, `createdDateTime`, `body`, `from`, `channelIdentity`, replies en bronlink, maar alleen uit expliciet toegestane teams/kanalen. |
| Teams-chats | Microsoft Graph `chatMessage` via chat-resource. | Bericht-ID, `createdDateTime`, `body`, `from`, `chatId`, replies en bronlink, maar alleen chats waarvoor de gebruiker/app expliciet toegang heeft. |
| Microsoft Graph Search | Microsoft Graph Search API (`search/query`) met expliciete `entityTypes`; officiële entity types omvatten onder meer `driveItem`, `listItem`, `message`, `event` en `chatMessage`. | Partnergerichte zoekhits met bron-ID, type, samenvatting en verwijzing. Search-rechten hangen af van de gekozen entity types; Search mag niet als tenantbrede shortcut worden gebruikt. |

### Entra-authenticatie en rechten

- Gebruik Microsoft Entra ID en de Microsoft identity platform; MSAL is de door Microsoft aanbevolen auth-bibliotheekfamilie voor de ondersteunde app-scenario’s. De uiteindelijke flow hangt af van hoe gebruikers de app gebruiken en moet door IT worden gekozen.
- **Delegated access** is de voorkeursrichting wanneer dit functioneel volstaat: de app werkt namens een aangemelde gebruiker en kan volgens Microsoft niet meer zien dan die gebruiker zelf mag zien.
- **Application permissions** werken zonder aangemelde gebruiker en kunnen gegevens organisatiebreed toegankelijk maken; ze zijn gevoeliger en vereisen admin consent. Gebruik ze alleen als een service-to-service scenario noodzakelijk is en bronrechten aanvullend zijn afgebakend.
- Vraag per resource de kleinste geschikte read-only permission aan. Er is nog geen permissionset gekozen: concrete rechten hangen af van de werkelijk gekozen mailboxen, events, chats/kanalen, SharePoint-sites/lijsten en Search-entityTypes.
- Voor SharePoint/OneDrive beschrijft Microsoft Selected-permissions (`Sites.Selected`, `Lists.SelectedOperations.Selected`, `ListItems.SelectedOperations.Selected`, `Files.SelectedOperations.Selected`). Consent alleen geeft niet vanzelf toegang: de resource-eigenaar/administrator moet ook toegang toewijzen aan de specifieke site, lijst, item of file. De precieze scope-/resourcekeuze moet door IT worden bevestigd.
- Microsoft Graph Search heeft eigen permission-eisen. De officiële Search-querydocumentatie noemt voor werk-/schoolaccounts `Mail.Read` als minst geprivilegieerde gedelegeerde permission in de algemene tabel en `Files.Read.All` voor application context; andere entity types en combinaties kunnen aanvullende of andere rechten vereisen. Omdat sommige keuzes breed zijn, blijft Search optioneel totdat IT en security de benodigde entityTypes en scopes hebben beoordeeld.
- Teams kent gedelegeerde en application/RSC-opties, en channel-/chatberichten hebben verschillende rechten. De exacte keuze (bijvoorbeeld delegated versus resource-specific consent voor een specifiek team/chat) moet voor de concrete Teams-resources worden geverifieerd; er worden nu geen rechten aangevraagd.
- Graph-toegang gaat uitsluitend via een server-side adapter/tokenprovider. Tokens komen nooit in React, logs, statusbadges of broncode. De gebruiker moet bestaande bronrechten behouden; bij ontbrekende rechten wordt de bron overgeslagen/geweigerd, niet omzeild.

### Partner- en AI-context

De bronadapter normaliseert Graph-responses naar het interne `Microsoft365PartnerItem`/`Microsoft365Information`-contract. Elk item krijgt een interne Partner 360-ID, een bronsoort, bron-ID, datum, titel, toegestane samenvatting en verwijzing. `partnerContextService` kan later alleen informatie van de geselecteerde partner ophalen. Deal Collega ontvangt deze genormaliseerde, geautoriseerde context naast CRM- en SharePoint-bronnen; de AI-service ziet geen Graph SDK-objecten of onbegrensde mailbox-/tenantresultaten.

### Officiële documentatie

- [Microsoft identity platform overview](https://learn.microsoft.com/en-us/entra/identity-platform/v2-overview)
- [Microsoft Graph permissions overview and least privilege](https://learn.microsoft.com/en-us/graph/permissions-overview)
- [Selected permissions for OneDrive and SharePoint](https://learn.microsoft.com/en-us/graph/permissions-selected-overview)
- [driveItem resource](https://learn.microsoft.com/en-us/graph/api/resources/driveitem?view=graph-rest-1.0)
- [List messages](https://learn.microsoft.com/en-us/graph/api/user-list-messages?view=graph-rest-1.0), [event resource](https://learn.microsoft.com/en-us/graph/api/resources/event?view=graph-rest-1.0)
- [List channel messages](https://learn.microsoft.com/en-us/graph/api/channel-list-messages?view=graph-rest-1.0), [list chat messages](https://learn.microsoft.com/en-us/graph/api/chat-list-messages?view=graph-rest-1.0)
- [Microsoft Graph Search query](https://learn.microsoft.com/en-us/graph/api/search-query?view=graph-rest-1.0), [Search request entity types](https://learn.microsoft.com/en-us/graph/api/resources/searchrequest?view=graph-rest-1.0)

Er worden nu geen Entra-app, Graph-client, scopes, tenants, credentials, endpointconfiguratie of Microsoft 365-requests aangemaakt.

## Contextflow van Deal Collega

1. De geselecteerde rij bepaalt de interne `partnerId`.
2. De chat roept `assistantService` aan met alleen die ID en de vraag.
3. `partnerContextService` haalt het profiel en de bijbehorende contactpersonen, activiteiten, acties, documenten en notities op.
4. `partnerKnowledge` maakt een begrensde context en markeert ontbrekende informatie.
5. Nu antwoordt `mockAssistantService` lokaal. Later kan alleen de AI-provider achter `assistantService` worden vervangen door een backendservice; de chat-UI blijft ongewijzigd.

Een partnerwissel maakt een nieuwe chatinstantie en context. Er wordt nooit context uit de vorige partner hergebruikt.

## Aanbevolen eerste echte aansluiting

Begin met een **read-only CRM-aansluiting voor partnerbasisgegevens en contactpersonen**.

1. Implementeer `ICrmPartnerSource` uit `backend/DealCollega.Api/Integrations/Contracts/SourceContracts.cs` in `backend/DealCollega.Api/Integrations/Crm/` en plaats die achter een backend-applicatieservice.
2. Lever eerst een stabiele externe partner-ID, naam, categorie, regio en status, plus de bijbehorende contact-ID, naam, rol en primaire-contactindicatie.
3. Map de CRM-ID naar de interne `partnerId` en behoud die mapping in de backend. Dat partneranker is nodig om volgende contactmomenten, acties, documenten en AI-context veilig aan de juiste relatie te koppelen.
4. Laat de backend een eigen Partner 360-DTO aanbieden; vervang daarna de mockimplementatie achter `partnerService`/de backend-API, niet de interfacecomponenten.
5. Voeg pas na validatie van de ID-mapping contactgeschiedenis en acties toe. Sluit daarna SharePoint-documenten en Microsoft 365-contactmomenten aan. Koppel de echte AI-service als laatste, achter de bestaande AI-servicegrens en met bronverwijzingen en autorisatiecontrole.

De CRM-aansluiting moet eerst read-only zijn. Leg vóór uitbreiding vast welke velden de accountmanager mag zien, hoe verwijderde/inactieve partners worden behandeld en hoe bron-ID's worden gemapt. Er worden nu geen endpoints, authenticatie, packages, secrets of externe services toegevoegd.

## TRIBECRM

### Officiële entiteiten

De technische veldnamen hieronder zijn gecontroleerd in de [officiële TribeCRM-documentatie](https://developer.tribecrm.nl/), met name de pagina’s [Organisations](https://developer.tribecrm.nl/docs/api/relations/customers), [Persons](https://developer.tribecrm.nl/docs/api/relations/contacts), [Customer relationships](https://developer.tribecrm.nl/docs/api/relationships/customer), [Contact relationships](https://developer.tribecrm.nl/docs/api/relationships/contact), [Addresses](https://developer.tribecrm.nl/docs/api/entities/addresses), [Data Model](https://developer.tribecrm.nl/docs/api/concepts/data-model) en [OData Queries](https://developer.tribecrm.nl/docs/api/concepts/odata). Dit zijn documentatiereferenties, geen actieve endpoints in deze applicatie.

| TribeCRM-entiteit | Betekenis | Gedocumenteerde relevante velden/relaties |
| --- | --- | --- |
| `Relation_Organization` | De organisatie zelf; het aanbevolen basisrecord voor een Partner 360-bedrijf. | `ID` (Guid), `name`, `phoneNumber`, `emailAddress`, `website`, `companyActivity`, `chamberOfCommerceNumber`, `chamberOfCommerceName`, `establishmentNumber`, `numberOfEmployees`; `VisitingAddress` en `PostalAddress` zijn Address-relaties. |
| `Relationship_Organization_CommercialRelationship_Customer` | De Customer-rol van een organisatie; dit is niet hetzelfde record als `Relation_Organization`. | Eigen `ID` (Guid), `Name`, `IsActive`, `IsClosed`, `IsFormer`; `Organization`, `Status`, `AccountManager`, `Owners`, `Activities`, `Notes` zijn relaties. Status-/medewerkerwaarden zijn configuratie-/relatierecords en moeten per TribeCRM-schema worden gecontroleerd. |
| `Relation_Person` | De persoon zelf. | `ID` (Guid), `firstName`, `middleName`, `lastName`, `title`, `emailAddress`, `phoneNumber`, `mobilePhoneNumber`. De gedocumenteerde `title` is een aanspreektitel zoals Mr/Ms/Dr, geen functie. |
| `Relationship_Person_Contact_Standard` | De contactrol die een persoon aan een organisatie koppelt. | Eigen `ID` (Guid), `Name`, `EmailAddress`, `PhoneNumber`, `MobilePhoneNumber`, `Department`; `Function` en `Role` zijn Datastore-relaties; `Relation` verwijst naar de parentorganisatie en `Person` naar de persoon. |
| `Address` | Een fysiek adres dat via de organisatie is gekoppeld. | `ID` (Guid), `Street`, `HouseNumber`, `HouseNumberSuffix`, `Extra`, `Postalcode`, `City`; `AddressType` is een Datastore-relatie. Organisaties kunnen meerdere bezoek- en postadressen hebben. |

**Organisatiekeuze moet nog worden bevestigd:** `Relation_Organization` bevat organisaties in het algemeen. Een TribeCRM Customer is alleen een commerciële rol. Voor deze koppeling moeten we van de data-eigenaar horen of Partner 360 alle organisaties, alleen Customer-relaties, of ook andere rollen (zoals Supplier/Prospect) bevat. We nemen niet aan dat iedere partner een Customer is.

De officiële documentatie zegt dat `ID` de unieke Guid-primary key is en altijd terugkomt. Een Customer-relatie-ID, Contact-relatie-ID, organisatie-ID en persoon-ID identificeren verschillende records en worden niet onderling verwisseld. Ook waarschuwt de OData-documentatie dat filteren op `_Type` wordt genegeerd; gebruik bij implementatie dus de passende gedocumenteerde subtype-entityset en valideer de responses.

### Mapping naar Deal Collega

```text
TribeCRM OData DTO's (alleen binnen TribeCrm-adapter)
	Relation_Organization.ID ── identity map ──> interne PartnerId
	Relation_Person.ID ──────── identity map ──> interne ContactId
	Contact.Relation.ID ───────────────────────> interne PartnerId-koppeling
	Contact.ID ────────────────────────────────> bron-ID van de Contact-relatie
												 ↓
CrmPartnerRecord / CrmCustomerRelationshipRecord / CrmContactRecord
												 ↓
Partner 360-compositie → bestaand Partner360Profile → bestaande UI
```

- `Relation_Organization.name` → interne partnernaam; `companyActivity` → optionele bedrijfsactiviteit/categorie.
- `phoneNumber`, `emailAddress`, `website`, KVK-naam/-nummer, vestigingsnummer en personeelsaantal blijven losse, optionele interne velden. IBAN/BIC/bankgegevens en fiscale velden zijn niet nodig voor de eerste scope.
- `VisitingAddress` en `PostalAddress` → een verzameling interne adressen met de gedocumenteerde Address-velden. We kiezen niet zelf welk adres in Partner 360 als hoofdadres geldt.
- Customer `Status` en `AccountManager` worden alleen gemapt wanneer de organisatie bevestigt dat de Customer-relatie de leidende rol/status/eigenaar bevat. De Datastore-/Employee-displaywaarden en toegestane mappings moeten tegen de metadata van jullie TribeCRM-omgeving worden gecontroleerd.
- Contact `Person.ID` → interne ContactId via de identity map. Contact `Relation.ID` → interne PartnerId via dezelfde organisatie-ID-map. Het contactrelatie-ID blijft afzonderlijk bewaard, zodat één persoon aan meer dan één organisatie kan zijn gekoppeld.
- Contactnaam komt uit `Person.firstName`, `middleName` en `lastName`; zakelijke e-mail/telefoon en `Department` komen bij voorkeur van de Standard Contact-relatie; `Function._Name` en `Role._Name` zijn optionele lookupwaarden. `Person.title` wordt niet als functie gebruikt.
- Partner 360 ontvangt alleen de interne `Partner360Profile`-vorm. TribeCRM DTO’s worden niet aan React-componenten doorgegeven.

### Adapter en huidige beveiligingsgrens

`backend/DealCollega.Api/Integrations/TribeCrm/TribeCrmODataRecords.cs` bevat uitsluitend TribeCRM-DTO’s met officieel gedocumenteerde wire field names. `TribeCrmReadOnlyAdapter.cs` bevat een read-only adapter en `ITribeCrmODataReader`-placeholder; de reader heeft geen implementatie. `ITribeCrmIdentityMap` beschrijft de benodigde stabiele ID-koppeling. Er is geen HttpClient, OData-request, DI-registratie of route toegevoegd. `Program.cs` blijft ongewijzigd.

`TribeCrmConnectionOptions.cs` reserveert niet-geheime configuratievelden (API-basis, optionele Tribe-organisatie-ID, auth-flow, Client ID, redirect URI en scopes). De Client Secret en eventuele refresh token horen alleen via de nog niet geïmplementeerde `ITribeCrmCredentialProvider` uit een goedgekeurde secret store te komen. `HasReadOnlySettings` weigert onvolledige configuratie, vereist een `read`-scope, weigert `write` en vereist voor Authorization Code de geregistreerde redirect URI. Er is geen options-binding, secret providerimplementatie, tokenaanvraag of readiness-registratie in `Program.cs`.

De officiële TribeCRM-authenticatiedocumentatie noemt twee flows: Authorization Code voor gebruikersgebonden toestemming en Client Credentials voor server-to-server. Welke flow voor Deal Collega past, moet IT en de CRM-eigenaar bepalen. Voor Authorization Code zijn onder meer een geregistreerde redirect URI, Client ID, scopes en server-side afhandeling van code/token nodig. Voor Client Credentials zijn Client ID, scopes en de rechten van de aangemaakte application employee relevant. De docs geven scopevoorbeelden, maar alleen de CRM-beheerder kan bevestigen dat de gekozen app uitsluitend de noodzakelijke leesrechten krijgt. Er is nog geen flow gekozen en geen app geregistreerd.

De interne ID-map moet duurzaam worden opgeslagen zodra er echte data wordt aangesloten. Een passende mapping bewaart ten minste `(provider=TribeCRM, entity type, TribeCRM source ID) → internal PartnerId/ContactId`. De adapter mag niet telkens een nieuw willekeurig intern ID genereren en mag een TribeCRM-ID niet als interne Partner 360-ID presenteren. Voor `Relation_Organization.ID` en `Relation_Person.ID` zijn aparte mappings nodig; de Customer- en Contact-relatie-ID’s blijven extra bronreferenties.

### Nog nodig voor een veilige read-only test

- Bevestiging of Partner 360 alle `Relation_Organization` records leest of alleen records met de Customer-relatie; bevestig ook hoe organisaties met meerdere rollen behandeld worden.
- De door IT goedgekeurde authenticatiekeuze en read-only rechten. TribeCRM documenteert Authorization Code en Client Credentials; de passende flow is nog niet gekozen en deze code bevat geen van beide.
- Het tenant-specifieke OData `$metadata`-document of een geschoonde schema-export, zodat daadwerkelijke navigatievelden, Datastore-labels, custom velden en veldtypes per omgeving bevestigd zijn. TribeCRM documenteert dat custom entity-/field IDs per omgeving kunnen verschillen.
- De afgesproken persistente opslag en lifecycle voor de externe-ID → interne-ID-map.
- De productkeuze voor het hoofdadres, de toegestane organisatie/contactvelden en eventuele statustoewijzing naar de bestaande Deal Collega-statussen.
- Test/sandboxomgeving, eigenaar en goedkeuring voor read-only toegang. Credentials worden later buiten source control en buiten de frontend in een goedgekeurde secret store beheerd.

Totdat deze keuzes zijn bevestigd blijft `dataSources.crm` op Mock. De adapter wordt nergens aangeroepen en er worden geen echte TribeCRM-verzoeken uitgevoerd.

De frontendstatus blijft `CRM: Demo` zolang de centrale CRM-modus Mock is. Er wordt pas een status `CRM: Verbonden` toegevoegd wanneer een echte, goedgekeurde provider is geregistreerd en een expliciete server-side verbindingscontrole succesvol is; een ingevuld configuratiebestand alleen is daarvoor niet voldoende. Secrets en tokens worden nooit in de statusweergave getoond.

## Aan te leveren voor echte koppelingen

Lever voor de eerste technische verkenning documentatie en niet-geheime configuratie aan. Deel API-sleutels, wachtwoorden, certificaten en tokens nooit in broncode, dit document of de chat; die worden later via een goedgekeurde secret store en beveiligd proces ingericht. De exacte URL's, resources en rechten moeten uit jullie eigen tenant/API-documentatie komen; er zijn hieronder geen waarden ingevuld of verondersteld.

### CRM

- [ ] CRM-product/leverancier, versie en omgeving (test/sandbox en productie).
- [ ] Officiële API-/SDK-documentatie en de door de beheerder verstrekte basis-URL en resource-identificatie; nog geen credentials.
- [ ] Gekozen authenticatiemethode, beheerder/contactpersoon, vereiste scopes/rollen en bevestiging dat eerst read-only is toegestaan.
- [ ] Partnerrecord: stabiele CRM-record-ID, weergavenaam, categorie/sector, regio, status, eigenaar, samenvatting en eventueel waarde/valuta.
- [ ] Veldmapping van jullie CRM-schema naar `CrmPartnerRecord`; regels voor ontbrekende, samengevoegde, verwijderde en inactieve records.
- [ ] Contactpersonen: stabiele contact-ID, gekoppelde partner-ID, naam, rol, zakelijk e-mailadres/telefoon en primaire-contactindicatie.
- [ ] Contactmomenten: record-ID, partner-ID, optionele contact-ID, datum/tijd en tijdzone, type, onderwerp, deelnemers en toegestane samenvatting.
- [ ] Acties: record-ID, partner-ID, titel, eigenaar-ID/naam, deadline, status en eventuele prioriteit.
- [ ] Notities: record-ID, partner-ID, datum, auteur en toegestane tekst; expliciete regels voor vertrouwelijke notities.
- [ ] Geschoonde voorbeeldresponses/schema's zonder echte persoonsgegevens, paginering/rate limits, wijzigingsfrequentie en databeheerder.

### SharePoint

- [ ] SharePoint-tenant en de officiële site-/bibliotheekidentificatie uit jullie eigen beheerinformatie.
- [ ] Authenticatiemethode, service-identiteit of delegated-user-model, goedgekeurde minimale leesrechten en eigenaar die toestemming verleent.
- [ ] Documentenbibliotheken en partner-matchregel: CRM-ID als metadata, een afgesproken kolom, of een door jullie bevestigde andere sleutel.
- [ ] Voor elk document: stabiele item-ID, partner-ID, naam, contenttype, gewijzigde datum/tijd, versie en toegangsgebonden URL.
- [ ] Welke bestandsformaten en bibliotheken gelezen mogen worden en of extractie/samenvatting van inhoud is toegestaan.
- [ ] Rechten-/gevoeligheidslabels, bewaartermijn, vertrouwelijke documentregels en gedrag bij ingetrokken toegang.
- [ ] Geschoonde metadata-/inhoudsvoorbeelden of schema, zonder echte documenten of persoonsgegevens.

### Microsoft 365

- [ ] Tenant-/organisatiecontext en eigenaar van de Microsoft 365-/Entra-configuratie.
- [ ] Bevestigde authenticatiekeuze (delegated of application permissions), vereiste resources/scopes en goedkeurende beheerder.
- [ ] Welke gegevenssoorten nodig zijn (bijvoorbeeld agenda-afspraken of expliciet geselecteerde e-mails); geen mailboxbrede toegang by default.
- [ ] Partner-matchregel voor deelnemers/adressen en partner-ID, toegestane tijdsperiode en relevante gebruikers/groepen.
- [ ] Gewenste velden: stabiele bron-ID, type, datum/tijd en tijdzone, onderwerp, deelnemers en toegestane samenvatting/link.
- [ ] Privacy-, bewaartermijn-, consent- en autorisatieregels; bevestiging welke velden naar AI-context mogen.
- [ ] Officiële Microsoft-documentatie voor de gekozen resources en geschoonde voorbeeldresponses; geen tenant-ID of credentials in deze repo.

### AI / Deal Collega

- [ ] Goedgekeurde AI-provider/service, eigenaar, regio en deployment/modelnaam of versie.
- [ ] Officiële servicecontract-/SDK-documentatie en door de beheerder verstrekte resourcegegevens; geen verzonnen endpoint.
- [ ] Authenticatiemethode en minimale rechten; geheimen pas later via secret store, nooit in frontendconfig of repository.
- [ ] Input/output contract: partner-ID, vraag, geselecteerde-partnercontext, bronverwijzingen en antwoordformaat.
- [ ] Goedgekeurde contextvelden per bron en maximale omvang; uitsluiting van niet-geautoriseerde documenten, notities en persoonsgegevens.
- [ ] Bewaar-/trainingsbeleid, regio/data residency, logging, content safety, timeout/rate limits en foutgedrag.
- [ ] Eisen aan bronvermelding, onzekerheid/ontbrekende gegevens en gedrag wanneer bronnen elkaar tegenspreken.
- [ ] Bevestiging van privacy/security review en testset met uitsluitend geschoonde of synthetische voorbeelden.

## Veilige eerste configuratiestap

Na ontvangst van de CRM-checklist kunnen we eerst uitsluitend de CRM-partner- en contactvelden in de sandbox uitlezen. De concrete adapter wordt server-side geïmplementeerd, met de echte bron-ID naar interne `partnerId`-mapping. Pas na aparte toestemming worden contactmomenten en acties toegevoegd. De centrale UI blijft `Partner360Profile` consumeren; bronwisseling gebeurt achter de bestaande services. De huidige `Live`-modus blijft geblokkeerd totdat die gecontroleerde implementatie en autorisatie zijn afgerond.