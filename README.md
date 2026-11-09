# Deal Collega #40

Een eerste Partner 360-demo met uitsluitend fictieve gegevens.

## Vereisten

- Node.js 20.19+ of 22.12+
- .NET 10 SDK voor de optionele API

## Starten met fictieve gegevens

```powershell
cd frontend
npm install
npm run dev
```

Open de URL die Vite toont. De app toont de badge `Demo/mockdata` en gebruikt de fictieve partnergegevens.

## Zelf gegevens toevoegen

De website kan eigen wijzigingen lokaal in dezelfde browser bewaren:

- Voeg partners handmatig toe en bewerk hun profiel, contactmomenten, notities en acties.
- Importeer nieuwe partners vanuit `.csv` of `.xlsx`. De eerste werkbladrij bevat kolomnamen zoals `Partner`, `Sector`, `Regio`, `Status`, `Contactpersoon`, `Eigenaar`, `E-mail`, `Telefoon`, `Contract einddatum`, `Jaarwaarde` en `Samenvatting`. Alleen nieuwe partnernamen worden toegevoegd; bestaande namen worden overgeslagen en niet overschreven.
- Upload PDF-, Office-, tekst-, CSV- en afbeeldingsbestanden bij een partner. De bestanden worden lokaal bewaard en zijn te downloaden. De website leest de inhoud van bestanden niet automatisch uit.

Profielgegevens worden in de browseropslag bewaard en bestanden in de lokale IndexedDB-opslag van de browser. Ze worden niet gedeeld met collega's of naar een server gestuurd. Als browsergegevens worden gewist, verdwijnen deze lokale gegevens. De bestaande export bevat alleen een beperkte partnerlijst en is geen volledige back-up van notities of bestanden.

## Starten met de demo-API

Start in een tweede terminal vanuit de projectmap:

```powershell
dotnet run --project backend/DealCollega.Api --urls http://localhost:5070
```

De optionele lokale API biedt `GET /api/health` en `GET /api/partners` voor een losse backendcontrole. De Partner 360-interface roept deze API niet aan. De verouderde `VITE_USE_MOCKS`-schakelaar is vervangen door `frontend/src/config/dataSources.ts`; de bedrijfsbronnen staan op Mock. Een bron op Live zetten geeft nu een duidelijke foutmelding omdat er bewust nog geen adapter is.

## Indeling

- `frontend/src/features` is de plek voor toekomstige schermen en domeinfuncties.
- `frontend/src/data`, `frontend/src/types` en `frontend/src/services` scheiden mockbronnen, domeincontracten en gegevens ophalen.
- `frontend/src/services/partner360Service.ts` combineert de afzonderlijke domeinen tot het profiel dat Partner 360 gebruikt.
- `frontend/src/config/dataSources.ts` kiest per bron Mock of Live; `frontend/src/integrations/contracts.ts` bevat de frontendcontracten en `unconfiguredLiveSource.ts` blokkeert niet-aangesloten Live-modi.
- `backend/DealCollega.Api/Integrations` is de beoogde grens voor Microsoft 365, SharePoint, CRM en AI-adapters.
- `backend/DealCollega.Api/Integrations/Contracts/SourceContracts.cs` bevat alleen toekomstig te implementeren backendcontracten.
- `backend/DealCollega.Api/Models` bevat de contracten die frontend en API delen.

Er zijn nog geen echte Microsoft 365-, SharePoint-, CRM- of AI-koppelingen en er is geen echte bedrijfsinformatie opgenomen. Zelf ingevoerde gegevens blijven alleen lokaal in de browser.

## Deal Collega AI-sparringsbot

De Partner 360-chat gebruikt `assistantService` als vervangbare servicegrens. `partnerContextService` haalt via een partner-ID een context op uit het samengestelde profiel. `mockAssistantService` genereert daarop fictieve antwoorden; `PartnerAssistant` verzorgt alleen de chatweergave en conversatiestaat. De centrale AI-modus staat op Mock; er worden geen externe AI- of gegevensdiensten aangeroepen.

Zie [INTEGRATION_PLAN.md](INTEGRATION_PLAN.md) voor de huidige domeinscheiding en het aansluitplan.