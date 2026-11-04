# Rörelseplan

En todo-app för rörelse och aktivitet. Appen är byggd i React Native (Expo, JavaScript) med expo-router.

Så används den:

- **Planera veckan.** Sätt ett mål för hur många pass du vill göra. Lägg sedan till aktiviteter på valfria dagar.
- **Bocka av.** Det finns två sätt:
  - Koppla aktiviteten till stegräknaren. Då bockas den av automatiskt när dagens steg når målet.
  - Bocka av själv.
- **Påminnelser.** Välj klockslag för varje aktivitet och om du vill ha en extra notis kvällen innan. Söndag kl 19:00 kommer en påminnelse om att utvärdera veckan.
- **Slumpa aktivitet.** Välj hur mycket tid du har och hur tufft det får vara, så får du ett förslag som du kan lägga till direkt.
- **Utvärdera.** När veckan är slut ser du vad du gjort och svarar på hur veckan kändes. Därefter justerar du nästa vecka: antal pass, om aktiviteterna ska vara kvar och om stegmålen ska höjas med 10 %.

## Kom igång

```bash
npm install
npx expo start
```

Skanna QR-koden med Expo Go, eller kör `npx expo run:ios` / `npx expo run:android` för en development build.

> **Tips:** Stegräknaren behöver en riktig telefon. Den fungerar inte i simulatorn eller emulatorn.

## Struktur

```
src/
  app/                    skärmar (expo-router)
    _layout.js            root: laddar data, synkar steg och notiser
    (tabs)/index.js       veckovy
    (tabs)/historik.js
    (tabs)/installningar.js
    ny-aktivitet.js       skapa/redigera (?id=)
    slumpa.js             slumpa förslag
    utvardering.js        veckoutvärdering
  components/             Icon (svg) och UI-komponenter
  data/suggestions.js     förslag för slumpknappen
  lib/week.js             ISO-veckor och datumhjälp
  lib/notifications.js    schemalägger påminnelser
  lib/useStepSync.js      läser stegräknaren
  store/useStore.js       zustand-store, sparas i AsyncStorage
  theme.js                färger och typografi från mockupen
```

## Bra att veta

- **Stegräknare på iOS.** Appen läser stegen för varje dag i veckan via `Pedometer.getStepCountAsync`. Därför bockas pass av även om appen var stängd under dagen, så länge du öppnar appen innan veckan är slut.
- **Stegräknare på Android.** Expo har ingen historik här, bara `watchStepCount`. Det betyder att steg bara räknas medan appen är öppen. För riktig automatik behöver nästa steg vara Health Connect, till exempel med `react-native-health-connect` i en development build.
- **Notiser.** Notiserna läggs om varje gång veckan ändras. Det är bara aktuell veckas notiser som är schemalagda.
- **Ångra automatisk avbockning.** Om du ångrar en aktivitet som bockades av automatiskt bockas den inte av igen automatiskt den veckan.
