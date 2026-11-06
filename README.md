# Rörelseplan

<img width="639" height="400" alt="Rörelseplan - planera och genomför" src="https://github.com/user-attachments/assets/fd450cf4-1658-495a-838a-b11791e9f40e" />
<img width="626" height="394" alt="Följ upp och dela" src="https://github.com/user-attachments/assets/9f8621b9-e133-4696-b5b7-231b0600777b" />

En app som hjälper dig att planera, genomföra och följa upp vardagsrörelse, en vecka i taget. Byggd under Probits hackathon - Lag 03.

## Idé

Många vill röra sig mer men tappar bort det i vardagen. Stora träningsappar fokuserar ofta på prestation och kan kännas krävande. Rörelseplan är tvärtom: en enkel veckoplan för rörelse där du själv bestämmer vad du vill göra, får en vänlig påminnelse, bockar av (eller låter stegräknaren göra det) och tittar tillbaka på veckan.

Appen är tänkt som ett stöd mellan träffar med en hälsocoach och stöd för egen reflektion och motivation. Du äger din data och väljer själv vad och när du delar.

## Användarbehov

| Användaren behöver … | Så löser appen det |
| --- | --- |
| veta vad den ska göra och när | Veckoplan med aktiviteter på valda dagar och ett mål för antal pass |
| komma ihåg det | Påminnelse vid valt klockslag, och om man vill även kvällen innan |
| slippa registrera allt själv | Stegaktiviteter bockas av automatiskt när dagens stegmål nås |
| få idéer när motivationen tryter | "Förslag på aktivitet" utifrån tid och svårighetsgrad |
| se att det går framåt | Framstegsmätare i veckovyn, historik per vecka och sammanställning per månad |
| justera när planen inte passar | Veckoutvärdering: kändes veckan för lätt, lagom eller för tuff? Nästa vecka anpassas efter svaret |
| stöd från en coach utan att lämna ifrån sig kontrollen | Månadsrapport som delas via sms eller mejl först när användaren själv trycker |

## Metodkoppling

Appens funktioner bygger på etablerade beteendeförändringstekniker (BCT, Michie m.fl.) och på självbestämmandeteori (SDT).

| Teknik | I appen |
| --- | --- |
| Målsättning och handlingsplan | Veckans mål i antal pass, med konkreta aktiviteter, dagar och tider |
| Självmonitorering | Avbockning, stegräkning och veckans framstegsmätare |
| Påminnelser och triggers | Notis vid passet, kvällen innan och söndag kväll för utvärdering |
| Återkoppling | "Fint att du rörde på dig", statistik i utvärdering och historik |
| Utvärdering och omprövning av mål | Veckoutvärderingen föreslår fler eller färre pass och höjda stegmål |
| Gradvis ökning | Stegmålen kan höjas 10 % i taget när veckan kändes lätt |
| Socialt stöd | Rapport och chatt med hälsocoach |

**Självbestämmande:** Texterna är skrivna för att stärka känslan av eget val, till exempel "Lust för en promenad?" och "om du vill" i stället för krav. Missade pass visas som "inte den här gången" utan skuld. Användaren styr själv vad som delas med coachen.

## Teknik

- **React Native med Expo** (SDK 58), JavaScript
- **Expo Router** för navigering (flikar och modaler)
- **Zustand** för state, sparat lokalt med **AsyncStorage**. Ingen backend, all data stannar på enheten.
- **expo-sensors** (Pedometer) för stegräkning
- **expo-notifications** för lokala, schemalagda påminnelser
- **react-native-svg** för ikoner

### Struktur

```
src/
  app/                    skärmar (expo-router)
    _layout.js            root: laddar data, synkar steg och notiser
    (tabs)/index.js       veckovy
    (tabs)/historik.js    historik och delning med coach
    (tabs)/coach.js       coachchatt (platshållare)
    (tabs)/installningar.js
    ny-aktivitet.js       skapa/redigera aktivitet (?id=)
    slumpa.js             förslag på aktivitet
    utvardering.js        veckoutvärdering
  components/             återanvändbara UI-komponenter
  data/                   aktivitetsförslag och humörval
  lib/week.js             ISO-veckor och datumhjälp
  lib/notifications.js    schemalägger påminnelser
  lib/useStepSync.js      läser stegräknaren
  lib/coachReport.js      bygger månadsrapporten
  store/useStore.js       zustand-store
  theme.js                färger och typografi
```

## Testa lösningen

### Starta appen

Kräver Node.js 20 eller senare och appen **Expo Go** på en telefon.

```bash
git clone https://github.com/JungblomSt/probits-hackathon-03.git
cd probits-hackathon-03
npm install
npx expo start
```

Skanna QR-koden med kameran (iPhone) eller med Expo Go (Android). Datorn och telefonen behöver vara på samma nätverk. Fungerar det inte, prova `npx expo start --tunnel`.

> **Använd en riktig telefon.** Stegräknaren fungerar inte i simulator eller emulator. Webbversionen (`npx expo start --web`) går att använda för att titta på gränssnittet, men stegräknare, notiser och bekräftelsedialoger fungerar inte där.

### Testscenarier

1. **Planera veckan.** Tryck på **+**, ge aktiviteten ett namn, välj en eller flera dagar och tryck "Lägg till". Aktiviteterna visas i veckovyn, sorterade per dag.
2. **Bocka av själv.** Tryck på cirkeln till höger om en aktivitet. Ett kort frågar hur det kändes. Välj ett humör eller "Inte nu".
3. **Automatisk avbockning.** Skapa en aktivitet för idag, välj "Automatiskt via stegräknaren" och sätt ett lågt stegmål (t.ex. 500). Gå en sväng med telefonen. Aktiviteten bockas av när målet nås.
   *Android:* steg räknas bara medan appen är öppen.
4. **Påminnelse.** Slå på påminnelse för en aktivitet idag och välj en tid ett par minuter fram. Godkänn notiser och lås telefonen.
5. **Förslag på aktivitet.** Tryck "Förslag på aktivitet", välj tid och svårighet, bläddra med "Nytt förslag" och tryck "Lägg till". Formuläret är då förifyllt.
6. **Utvärdera veckan.** Tryck "Översikt" i veckovyn. Välj hur veckan kändes och se hur förslaget för nästa vecka ändras.
7. **Dela med coach.** Gå till fliken **Historik**, skriv eventuellt en hälsning och tryck "Dela". Rapporten öppnas i telefonens delningsmeny.
8. **Börja om.** Under **Inställningar → Rensa all data** återställs appen.

## Kända begränsningar

- **Android och steghistorik:** Expo saknar steghistorik på Android, så steg räknas bara medan appen är öppen. Nästa steg vore Health Connect.
- **Coachen:** Chatten och "Skicka till coach" är en lokal demo. Ingen data lämnar telefonen, förutom den rapport användaren själv delar.
- **Veckobyte:** En ny vecka skapas först när den gamla har utvärderats.
- **Webb:** Bekräftelsedialoger (`Alert.alert`) visas inte i webbläsaren.

## Licens

MIT

