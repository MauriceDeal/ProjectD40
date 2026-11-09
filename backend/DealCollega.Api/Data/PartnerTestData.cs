using DealCollega.Api.Models;

namespace DealCollega.Api.Data;

public static class PartnerTestData
{
    public static IReadOnlyList<Partner> All { get; } =
    [
        new Partner(
            "partner-001", "Stadshaven Groep", "Gebiedsontwikkeling", "Dordrecht", "Actief",
            "Maurice van Alten", "Sanne de Wit", "Directeur partnerships", "sanne.dewit@stadshaven.example",
            "078 555 01 40", "€ 42.500", "21 okt 2026", "2026-10-21", "Voortgangsbespreking · 4 nov",
            "Samen bouwen aan levendige plekken en kansen voor de regio.",
            [
                new PartnerActivity("2026-10-21", "Voortgang gedeeld", "Nieuwe planning voor de gebiedsverkenning besproken."),
                new PartnerActivity("2026-10-13", "Kennismaking projectteam", "Teams van beide organisaties aan elkaar voorgesteld."),
                new PartnerActivity("2026-09-29", "Samenwerkingsafspraken bevestigd", "Afspraken voor het eerste kwartaal vastgelegd."),
            ]),
        new Partner(
            "partner-002", "Bureau Rivier", "Communicatie", "Zwijndrecht", "In gesprek",
            "Lieke Vermeer", "Joris Bakker", "Strategisch adviseur", "joris.bakker@bureaurivier.example",
            "078 555 02 40", "€ 18.000", "19 okt 2026", "2026-10-19", "Voorstel bespreken · 30 okt",
            "Een mogelijke communicatiepartner met sterke lokale kennis.",
            [
                new PartnerActivity("2026-10-19", "Voorstel ontvangen", "Eerste opzet voor de gezamenlijke campagne binnen."),
                new PartnerActivity("2026-10-08", "Verkenningsgesprek", "Doelgroepen en regionale aanpak in kaart gebracht."),
                new PartnerActivity("2026-09-24", "Introductie via netwerk", "Contact gelegd tijdens een regionale bijeenkomst."),
            ]),
        new Partner(
            "partner-003", "De Waard Energie", "Duurzaamheid", "Papendrecht", "Aandacht nodig",
            "Maurice van Alten", "Nina van Dijk", "Programmamanager", "nina.vandijk@dewaard.example",
            "078 555 03 40", "€ 31.250", "2 okt 2026", "2026-10-02", "Afstemming plannen · deze week",
            "Regionale samenwerking rond toegankelijke energietransitie.",
            [
                new PartnerActivity("2026-10-02", "Actiepunt blijft open", "Wachten op terugkoppeling over de gedeelde planning."),
                new PartnerActivity("2026-09-18", "Projectupdate", "Voortgang van het buurtprogramma besproken."),
                new PartnerActivity("2026-09-05", "Werkafspraken gemaakt", "Rolverdeling voor de pilot gezamenlijk afgestemd."),
            ]),
    ];
}