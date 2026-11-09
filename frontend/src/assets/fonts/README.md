# Montserrat lokaal toevoegen

De applicatie declareert `Montserrat` centraal via `--font-family` en `--font-heading` in `src/index.css`. Er zijn nog geen Montserrat-bestanden aanwezig. De browser gebruikt daarom een lokaal beschikbare Montserrat-installatie als die bestaat, en anders de veilige systeemfallback `Segoe UI`, gevolgd door `sans-serif`.

Wanneer de organisatie Montserrat-bestanden wil bundelen:

1. Verkrijg de WOFF2-bestanden via de [officiële Montserrat-map in Google Fonts](https://github.com/google/fonts/tree/main/ofl/montserrat) en controleer de meegeleverde licentie.
2. Plaats alleen de benodigde reguliere en eventueel vetgedrukte Latin-bestanden in deze map.
3. Voeg daarna voor de werkelijk aangeleverde bestandsnamen passende lokale `@font-face`-regels toe aan `src/index.css`.
4. Voeg geen externe `@import`, Google Fonts-link of andere runtime-fontdownload toe.

Er zijn in deze prototypewijziging geen lettertypebestanden gedownload of gegenereerd.