// Förslag för slumpknappen. time = minuter, 45 betyder "45+".
// mode: 'steps' kan kopplas till stegräknaren, 'manual' bockas av själv.
export const SUGGESTIONS = [
  { time: 10, level: 'Lätt', title: 'Kvarterspromenad', text: 'Gå ett varv runt kvarteret i rask takt. Perfekt mellan två måsten.', mode: 'steps', stepGoal: 1200 },
  { time: 10, level: 'Lätt', title: 'Stretchpaus', text: 'Rulla axlar, sträck ut höftböjare, vader och bröst. 1 minut per övning.', mode: 'manual' },
  { time: 10, level: 'Medel', title: 'Trappsprint', text: 'Gå trappor upp i jämnt tempo, lugnt ner. Upprepa 6 gånger.', mode: 'steps', stepGoal: 900 },
  { time: 10, level: 'Medel', title: 'Knäböjsstege', text: '10 knäböj, vila, 9 knäböj … ända ner till 1.', mode: 'manual' },
  { time: 10, level: 'Tuff', title: 'Tabata-pass', text: '20 s maxinsats, 10 s vila, 8 rundor. Burpees, knälyft, upphopp.', mode: 'manual' },

  { time: 20, level: 'Lätt', title: 'Morgonyoga', text: 'Lugnt flöde med solhälsningar och stretch för höfter och rygg.', mode: 'manual' },
  { time: 20, level: 'Lätt', title: 'Lunchpromenad', text: 'Ta en promenad efter lunch, gärna ute i dagsljus.', mode: 'steps', stepGoal: 2200 },
  { time: 20, level: 'Medel', title: 'Trappintervaller', text: 'Hitta en lång trappa. Spring upp, gå ner. Kör 8 vändor med lugn uppvärmning först.', mode: 'steps', stepGoal: 2500 },
  { time: 20, level: 'Medel', title: 'Cirkelträning hemma', text: 'Knäböj, armhävningar, utfall och planka. 40 s per övning, 3 varv.', mode: 'manual' },
  { time: 20, level: 'Tuff', title: 'Backintervaller', text: 'Spring uppför i 30 s, jogga ner. 8–10 repetitioner.', mode: 'steps', stepGoal: 3000 },
  { time: 20, level: 'Tuff', title: 'Hopprep-intervaller', text: '1 min hopp, 30 s vila. 10 rundor.', mode: 'manual' },

  { time: 30, level: 'Lätt', title: 'Promenad med podd', text: 'Lugn promenad i valfri riktning. Vänd när avsnittet är halvvägs.', mode: 'steps', stepGoal: 3500 },
  { time: 30, level: 'Lätt', title: 'Mobilitetspass', text: 'Rörlighet för höfter, bröstrygg och axlar i lugnt tempo.', mode: 'manual' },
  { time: 30, level: 'Medel', title: 'Distanslöpning', text: 'Jogga i samtalstempo hela vägen. Fokus på jämn andning.', mode: 'steps', stepGoal: 4500 },
  { time: 30, level: 'Medel', title: 'Styrka med kroppsvikt', text: 'Utfall, armhävningar, glute bridge och sidoplanka. 4 varv.', mode: 'manual' },
  { time: 30, level: 'Tuff', title: 'Fartlek', text: 'Löp och variera tempot fritt: spurta till nästa lyktstolpe, jogga till nästa.', mode: 'steps', stepGoal: 5000 },

  { time: 45, level: 'Lätt', title: 'Simning i lugnt tempo', text: 'Simma bröstsim eller crawl i jämnt tempo med korta pauser.', mode: 'manual' },
  { time: 45, level: 'Lätt', title: 'Naturpromenad', text: 'Gå en slinga i skogen eller längs vattnet. Inga krav på tempo.', mode: 'steps', stepGoal: 5500 },
  { time: 45, level: 'Medel', title: 'Cykeltur', text: 'Välj en slinga med några backar och håll jämn kadens.', mode: 'manual' },
  { time: 45, level: 'Medel', title: 'Långpromenad', text: 'Rask promenad, gärna med en kompis.', mode: 'steps', stepGoal: 6000 },
  { time: 45, level: 'Tuff', title: 'Skogslöpning', text: 'Löp på stig med ojämnt underlag. Gå i de brantaste backarna.', mode: 'steps', stepGoal: 7000 },
  { time: 45, level: 'Tuff', title: 'Simintervaller', text: '10 × 50 m snabbt med 30 s vila, lugn simning före och efter.', mode: 'manual' },
];

export const TIME_OPTIONS = [
  { value: 10, label: '10 min' },
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45+' },
];

export function filterSuggestions(time, level) {
  return SUGGESTIONS.filter((s) => s.time === time && s.level === level);
}

// Blanda listan så att "Slumpa igen" går igenom alla innan något upprepas
export function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
