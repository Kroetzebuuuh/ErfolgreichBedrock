// erfolgescriptangedeutet.js
document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  // ------------------------------------------------------------
  // 1. Accountsystem
  // ------------------------------------------------------------
  let accountName = localStorage.getItem("currentAccount");
  if (!accountName) {
    const loginDiv = document.createElement("div");
    loginDiv.className = "flex flex-col items-center justify-center text-center mt-20";
    loginDiv.innerHTML = `
      <h1 class="hero-title mb-6">Minecraft Erfolge Tracker</h1>
      <p class="text-white mb-4 text-sm">Bitte gib deinen Accountnamen ein:</p>
      <input id="nameField" class="px-4 py-2 text-black rounded mb-4 w-64 text-center" placeholder="Dein Name...">
      <button id="startBtn" class="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded">Starten</button>
    `;
    app.appendChild(loginDiv);

    document.getElementById("startBtn").addEventListener("click", () => {
      const name = document.getElementById("nameField").value.trim();
      if (!name) return alert("Bitte gib einen Namen ein!");
      localStorage.setItem("currentAccount", name);
      location.reload();
    });
    return;
  }

  const storageKey = `erfolge_${accountName}`;
  let erfolgStatus = JSON.parse(localStorage.getItem(storageKey)) || {};
  let offeneKategorien = new Set();
  let currentSearchTerm = "";
  let showCompletedOnly = false;
  let showOpenOnly = false;

  // Bild-Codes für die Erfolge (aus Exophase extrahiert)
  const bildCodes = {
    1: "5570j635", 2: "0034ebd3", 3: "8j5d7e66", 4: "ee30561g", 5: "40e7d416",
    6: "6d741b5b", 7: "b8gd1e6b", 8: "gj1b4g3e", 9: "dg07e413", 10: "j067g453",
    11: "137b6g06", 12: "3571gj01", 13: "770b3g5j", 14: "5570j6g5", 15: "0034ebj3",
    16: "8j5d7e06", 17: "ee3056gg", 18: "40e7d4b6", 19: "6d741b3b", 20: "b8gd1e4b",
    21: "gj1b4g5e", 22: "dg07e4b3", 23: "j067g4e3", 24: "137b6gj6", 25: "3571gj61",
    26: "770b3gdj", 27: "5570j6b5", 28: "0034eb13", 29: "8j5d7e46", 30: "ee30568g",
    31: "40e7d466", 32: "6d741bgb", 33: "b8gd1e3b", 34: "gj1b4g7e", 35: "dg07e483",
    36: "j067g413", 37: "137b6g16", 38: "3571gj41", 39: "770b3ggj", 40: "5570j665",
    41: "0034ebb3", 42: "8j5d7ee6", 43: "ee30566g", 44: "40e7d446", 45: "6d741bbb",
    46: "b8gd1eeb", 47: "gj1b4gge", 48: "dg07e443", 49: "j067g443", 50: "137b6gg6",
    51: "3571gjj1", 52: "770b3g6j", 53: "40e7d4j0", 54: "6d741be7", 55: "b8gd1eb6",
    56: "gj1b4g85", 57: "dg07e4d8", 58: "j067g484", 59: "137b6gee", 60: "3571gjde",
    61: "770b3g68", 62: "5570j61d", 63: "0034eb6e", 64: "8j5d7ebd", 65: "ee30564d",
    66: "40e7d430", 67: "6d741b67", 68: "b8gd1e06", 69: "gj1b4ge5", 70: "dg07e458",
    71: "j067g4j4", 72: "137b6gde", 73: "3571gjee", 74: "770b3ge8", 75: "5570j64d",
    76: "0034ebge", 77: "8j5d7egd", 78: "ee30567d", 79: "40e7d480", 80: "6d741b87",
    81: "b8gd1ej6", 82: "gj1b4g65", 83: "dg07e438", 84: "j067g4d4", 85: "137b6g8e",
    86: "3571gj8e", 87: "770b3g88", 88: "5570j68d", 89: "0034eb8e", 90: "8j5d7e8d",
    91: "ee3056bd", 92: "40e7d4g0", 93: "6d741bj7", 94: "b8gd1e56", 95: "gj1b4gd5",
    96: "dg07e468", 97: "j067g434", 98: "137b6g4e", 99: "3571gjbe", 100: "770b3g18",
    101: "5570j6dd", 102: "0034eb5e", 103: "8j5d7e3d", 104: "ee30565d", 105: "40e7d4d0",
    106: "6d741b17", 107: "b8gd1e16", 108: "gj1b4g45", 109: "dg07e4e8", 110: "j067g4g4",
    111: "137b6g6e", 112: "3571gjge", 113: "770b3g38", 114: "5570j6jd", 115: "0034ebee",
    116: "8j5d7e7d", 117: "ee30560d", 118: "40e7d470", 119: "6d741b47", 120: "b8gd1ed6",
    121: "gj1b4gb5", 122: "dg07e478", 123: "j067g474", 124: "137b6gbe", 125: "3571gj1e",
    126: "770b3gb8", 127: "5570j60d", 128: "0034eb4e", 129: "8j5d7edd", 130: "ee305jdd",
    131: "40e7dj50", 132: "6d741e07", 133: "b86ed1bd", 134: "55gj34g5"
  };

  // Funktion um Bild-Pfad zu generieren
  function getBildPfad(erfolgId) {
    const code = bildCodes[erfolgId];
    return code ? `./Bilder/erfolg_${erfolgId}_${code}.png` : './Bilder/default.png';
  }

  // ------------------------------------------------------------
  // 2. Erfolgsdaten (Beispiel - nur 3 Zeilen zum Testen)
  // Ersetze dies durch die vollständige erfolge-Liste
  // ------------------------------------------------------------
  const erfolge = [
      // BASE GAME
      { id: 1, name: "Alle Trophäen erhalten", beschreibung: "Alle Trophäen wurden erhalten.", punkte: "10G", typ: "EPIC", kategorie: "Base Game" },
      { id: 2, name: "Inventur machen", beschreibung: "Öffne dein Inventar.", punkte: "10G", typ: "COMMON", kategorie: "Base Game" },
      { id: 3, name: "Dreimal auf Holz geklopft", beschreibung: "Schlage gegen einen Baum, bis ein Holzblock herausspringt.", punkte: "10G", typ: "COMMON", kategorie: "Base Game" },
      { id: 4, name: "Fortgeschrittenes Handwerk", beschreibung: "Fertige aus vier Holzbrettern eine Werkbank an.", punkte: "10G", typ: "COMMON", kategorie: "Base Game" },
      { id: 5, name: "Glückauf!", beschreibung: "Stelle aus Holz und Stöcken eine Spitzhacke her.", punkte: "10G", typ: "COMMON", kategorie: "Base Game" },
      { id: 6, name: "Heiße Angelegenheit", beschreibung: "Konstruiere aus acht Bruchstein-Blöcken einen Schmelzofen.", punkte: "12G", typ: "COMMON", kategorie: "Base Game" },
      { id: 7, name: "Schmiedekunst", beschreibung: "Schmelze einen Eisenbarren.", punkte: "14G", typ: "COMMON", kategorie: "Base Game" },
      { id: 8, name: "Fang an zu ackern!", beschreibung: "Stelle aus Holz und Stöcken eine Hacke her.", punkte: "19G", typ: "COMMON", kategorie: "Base Game" },
      { id: 9, name: "Bäcker", beschreibung: "Backe ein Brot aus Weizen.", punkte: "18G", typ: "COMMON", kategorie: "Base Game" },
      { id: 10, name: "Die Lüge", beschreibung: "Backe einen Kuchen aus Weizen, Zucker, Milch und Eiern!", punkte: "58G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 11, name: "Technischer Fortschritt", beschreibung: "Konstruiere eine bessere Spitzhacke.", punkte: "11G", typ: "COMMON", kategorie: "Base Game" },
      { id: 12, name: "Köstlicher Fisch", beschreibung: "Fange und brate einen Fisch!", punkte: "30G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 13, name: "Bahn frei!", beschreibung: "Reise mit einer Lore mindestens 500 Meter in eine Richtung.", punkte: "69G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 14, name: "Zu den Waffen!", beschreibung: "Stell aus Holz und Stöcken ein Schwert her.", punkte: "11G", typ: "COMMON", kategorie: "Base Game" },
      { id: 15, name: "Monsterjäger", beschreibung: "Greife ein Monster an und töte es.", punkte: "11G", typ: "COMMON", kategorie: "Base Game" },
      { id: 16, name: "Kuhschubser", beschreibung: "Gewinne Leder.", punkte: "11G", typ: "COMMON", kategorie: "Base Game" },
      { id: 17, name: "Wenn Schweine fliegen", beschreibung: "Nutze eine Sattel, um ein Schwein zu reiten und füg ihm dann während des Reitens Fallschaden zu.", punkte: "69G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 18, name: "Alphawolf", beschreibung: "Freunde dich mit fünf Wölfen an.", punkte: "64G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 19, name: "Bestens ausgerüstet", beschreibung: "Konstruiere ein Exemplar von jedem Werkzeug (eine Spitzhacke, einen Spaten, eine Axt und eine Hacke).", punkte: "18G", typ: "COMMON", kategorie: "Base Game" },
      { id: 20, name: "Zum Verschießen", beschreibung: "Konstruiere einen Werfer.", punkte: "50G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 21, name: "In den Nether", beschreibung: "Konstruiere ein Netherportal.", punkte: "28G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 22, name: "Scharfschützenduell", beschreibung: "Töte ein Skelett mit einem Pfeil aus über 50 Metern Entfernung.", punkte: "80G", typ: "RARE", kategorie: "Base Game" },
      { id: 23, name: "DIAMANTEN!", beschreibung: "Beschaffe mithilfe deiner Eisenwerkzeuge Diamanten.", punkte: "16G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 24, name: "Zurück zum Absender", beschreibung: "Zerstöre einen Ghast mit einem Feuerball.", punkte: "45G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 25, name: "Spiel mit dem Feuer", beschreibung: "Nimm einer Lohe ihre Rute.", punkte: "37G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 26, name: "Alchemie", beschreibung: "Braue einen Trank.", punkte: "42G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 27, name: "Das Ende?", beschreibung: "Betritt ein Endportal.", punkte: "45G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 28, name: "Das Ende.", beschreibung: "Töte den Enderdrachen.", punkte: "48G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 29, name: "Zauberer", beschreibung: "Konstruiere einen Zaubertisch.", punkte: "35G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 30, name: "Meister des Kampfes", beschreibung: "Verursache neun Herzen Schaden mit einem einzigen Schlag.", punkte: "36G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 31, name: "Bibliothekar", beschreibung: "Baue Bücherregale, um deinen Zaubertisch zu verbessern.", punkte: "30G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 32, name: "Abenteurerzeit", beschreibung: "Entdecke 17 der 40 Biome.", punkte: "14G", typ: "COMMON", kategorie: "Base Game" },
      { id: 33, name: "Nachzucht", beschreibung: "Züchte zwei Kühe mit Weizen.", punkte: "30G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 34, name: "Diamanten für dich!", beschreibung: "Wirf mit Diamanten nach einem anderen Spieler.", punkte: "32G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 35, name: "Schweinekotelett", beschreibung: "Koche und iss ein Stück Schweinekotelett.", punkte: "16G", typ: "COMMON", kategorie: "Base Game" },
      { id: 36, name: "Wie die Zeit vergeht", beschreibung: "Spiele 100 Tage lang.", punkte: "29G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 37, name: "Bogenschütze", beschreibung: "Töte einen Creeper mit Pfeilen.", punkte: "33G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 38, name: "Der Feilscher", beschreibung: "Erhalte 30 Smaragde durch Handel mit Dorfbewohnern oder Bergbau.", punkte: "34G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 39, name: "Topfbepflanzer", beschreibung: "Fertige einen Blumentopf an und platziere ihn.", punkte: "46G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 40, name: "Das ist ein Zeichen!", beschreibung: "Fertige ein Schild an und platziere es.", punkte: "28G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 41, name: "Starker Magen", beschreibung: "Verhindere den Hungertod mithilfe von verrottetem Fleisch.", punkte: "71G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 42, name: "Hab einen schaf-tastischen Tag", beschreibung: "Verwende eine Schere, um Wolle von einem Schaf zu erhalten.", punkte: "32G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 43, name: "Regenbogensammlung", beschreibung: "Sammle Wolle in allen 16 Farben.", punkte: "73G", typ: "RARE", kategorie: "Base Game" },
      { id: 44, name: "Cool bleiben", beschreibung: "Schwimme in Lava, während du den Feuerresistenz-Effekt hast.", punkte: "53G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 45, name: "Bruchsteinreich", beschreibung: "Baue 1.728 Bruchsteine ab und lege sie in eine Truhe.", punkte: "46G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 46, name: "Erneuerbare Energie", beschreibung: "Verkohle Baumstämme mit Holzkohle, um mehr Holzkohle herzustellen.", punkte: "30G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 47, name: "Musik in meinen Ohren", beschreibung: "Spiele eine Schallplatte in einem Plattenspieler ab.", punkte: "46G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 48, name: "Leibwächter", beschreibung: "Erschaffe einen Eisengolem.", punkte: "67G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 49, name: "Eisenmann", beschreibung: "Trage eine komplette Eisenrüstung.", punkte: "18G", typ: "COMMON", kategorie: "Base Game" },
      { id: 50, name: "Zombie-Doktor", beschreibung: "Heile einen Zombie-Dorfbewohner.", punkte: "60G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 51, name: "Löwenjäger", beschreibung: "Gewinne das Vertrauen eines Ozelots.", punkte: "73G", typ: "UNCOMMON", kategorie: "Base Game" },

      // EXPANSION PACK 1
      { id: 52, name: "Der Anfang?", beschreibung: "Spawne den Wither.", punkte: "83G", typ: "RARE", kategorie: "Expansion Pack 1" },
      { id: 53, name: "Der Anfang.", beschreibung: "Töte den Wither.", punkte: "100G", typ: "EPIC", kategorie: "Expansion Pack 1" },
      { id: 54, name: "Leuchtturmwärter", beschreibung: "Erstelle ein Leuchtfeuer und versorge es vollständig mit Energie.", punkte: "96G", typ: "RARE", kategorie: "Expansion Pack 1" },
      { id: 55, name: "Übermächtig", beschreibung: "Iss einen Notch-Apfel.", punkte: "75G", typ: "RARE", kategorie: "Expansion Pack 1" },
      { id: 56, name: "Trendfarben", beschreibung: "Färbe alle 4 einzigartigen Teile der Lederrüstung.", punkte: "123G", typ: "RARE", kategorie: "Expansion Pack 1" },
      { id: 57, name: "Trampolin", beschreibung: "Lasse 30 Blöcke von einem Schleimblock nach oben prallen.", punkte: "117G", typ: "RARE", kategorie: "Expansion Pack 1" },

      // EXPANSION PACK 3
      { id: 58, name: "Das Ende ... mal wieder ...", beschreibung: "Lasse den Enderdrachen erneut erscheinen.", punkte: "126G", typ: "RARE", kategorie: "Expansion Pack 3" },
      { id: 59, name: "Pfefferminz gefällig?", beschreibung: "Sammle Drachenatem in einer Glasflasche.", punkte: "125G", typ: "RARE", kategorie: "Expansion Pack 3" },
      { id: 60, name: "Überschall", beschreibung: "Fliege mit Elytren mit mehr als 40 m/s durch einen Spalt, der 1 mal 1 Block misst.", punkte: "140G", typ: "RARE", kategorie: "Expansion Pack 3" },
      { id: 61, name: "Auf dem Trockenen", beschreibung: "Trockne einen Schwamm in einem Ofen.", punkte: "118G", typ: "RARE", kategorie: "Expansion Pack 3" },

      // EXPANSION PACK 4
      { id: 62, name: "Freitaucher", beschreibung: "Bleibe 2 Minuten unter Wasser.", punkte: "82G", typ: "UNCOMMON", kategorie: "Expansion Pack 4" },
      { id: 63, name: "Superbrennstoff", beschreibung: "Heize einen Ofen mit Lava.", punkte: "60G", typ: "UNCOMMON", kategorie: "Expansion Pack 4" },
      { id: 64, name: "Aufsatteln", beschreibung: "Zähme ein Pferd.", punkte: "31G", typ: "UNCOMMON", kategorie: "Expansion Pack 4" },
      { id: 65, name: "Schmecke deine eigene Medizin", beschreibung: "Vergifte eine Hexe mit einem Wurftrank.", punkte: "151G", typ: "RARE", kategorie: "Expansion Pack 4" },
      { id: 66, name: "Beam mich hoch", beschreibung: "Teleportiere dich durch einen einzelnen Wurf einer Enderperle über mehr als 100 Meter.", punkte: "43G", typ: "UNCOMMON", kategorie: "Expansion Pack 4" },
      { id: 67, name: "Kartenraum", beschreibung: "Hänge 9 vollständig erkundete, angrenzende Karten in 9 Gegenstandsrahmen im Quadrat (3 x 3) auf.", punkte: "155G", typ: "RARE", kategorie: "Expansion Pack 4" },
      { id: 68, name: "Tarnung", beschreibung: "Töte eine Kreatur, während du den gleichen Typ von Kreaturen-Kopf trägst.", punkte: "127G", typ: "RARE", kategorie: "Expansion Pack 4" },

      // EXPANSION PACK 6
      { id: 69, name: "Das tiefe Ende", beschreibung: "Besiege einen Großwächter.", punkte: "114G", typ: "RARE", kategorie: "Expansion Pack 6" },
      { id: 70, name: "Tolle Aussicht hier oben", beschreibung: "Schwebe vor den Angriffen eines Shulkers 50 Blöcke nach oben.", punkte: "163G", typ: "RARE", kategorie: "Expansion Pack 6" },
      { id: 71, name: "Lakenwechsel", beschreibung: "Färbe dein Bett in einer anderen Farbe.", punkte: "58G", typ: "UNCOMMON", kategorie: "Expansion Pack 6" },
      { id: 72, name: "Dem Tod entkommen", beschreibung: "Verwende das Totem der Unsterblichkeit, um dem Tod zu entkommen.", punkte: "69G", typ: "UNCOMMON", kategorie: "Expansion Pack 6" },
      { id: 73, name: "Die Runde geht an mich ...", beschreibung: "Führe eine Karawane mit mindestens 5 Lamas.", punkte: "170G", typ: "RARE", kategorie: "Expansion Pack 6" },
      { id: 74, name: "Lass los!", beschreibung: "Laufe mit den Eisläufer-Stiefeln mindestens 1 Block auf gefrorenem Wasser im tiefen Ozean.", punkte: "121G", typ: "RARE", kategorie: "Expansion Pack 6" },
      { id: 75, name: "Das ist böse", beschreibung: "Besiege einen Magier.", punkte: "64G", typ: "UNCOMMON", kategorie: "Expansion Pack 6" },

      // EXPANSION PACK 7
      { id: 76, name: "Meeresgurkentruppe", beschreibung: "Platziere vier Meeresgurken in einem Block.", punkte: "130G", typ: "RARE", kategorie: "Expansion Pack 7" },
      { id: 77, name: "Alternativer Brennstoff", beschreibung: "Benutze einen getrockneten Seetang-Block im Ofen als Brennstoff.", punkte: "99G", typ: "UNCOMMON", kategorie: "Expansion Pack 7" },
      { id: 78, name: "Mahlstrom", beschreibung: "Aktiviere einen Aquisator.", punkte: "139G", typ: "RARE", kategorie: "Expansion Pack 7" },
      { id: 79, name: "Schiffbrüchiger", beschreibung: "Iss 3 Tage lang nur Seetang.", punkte: "183G", typ: "RARE", kategorie: "Expansion Pack 7" },
      { id: 80, name: "Bei den Fischen schlafen", beschreibung: "Bleibe einen ganzen Tag lang unter Wasser, ohne Tränke einzusetzen.", punkte: "176G", typ: "RARE", kategorie: "Expansion Pack 7" },
      { id: 81, name: "Echoortung", beschreibung: "Füttere einen Delfin mit rohem Kabeljau, damit er dich zu einem Schatz führt.", punkte: "127G", typ: "RARE", kategorie: "Expansion Pack 7" },

      // EXPANSION PACK 8
      { id: 82, name: "Mache eine Fassrolle", beschreibung: "Verwende Sog, um dir selbst Schub zu verleihen.", punkte: "108G", typ: "UNCOMMON", kategorie: "Expansion Pack 8" },
      { id: 83, name: "Meeresbiologe", beschreibung: "Sammle einen beliebigen Fisch in einem Eimer ein.", punkte: "77G", typ: "UNCOMMON", kategorie: "Expansion Pack 8" },
      { id: 84, name: "Ahoy!", beschreibung: "Entdecke ein Schiffswrack.", punkte: "32G", typ: "UNCOMMON", kategorie: "Expansion Pack 8" },
      { id: 85, name: "Dach der Welt", beschreibung: "Baue einen Turm aus Gerüsten, der die maximale Bauhöhe erreicht.", punkte: "150G", typ: "RARE", kategorie: "Expansion Pack 8" },
      { id: 86, name: "Wo bist du herumgesummt?", beschreibung: "Erhalte am Morgen ein Geschenk von einer gezähmten Katze.", punkte: "107G", typ: "UNCOMMON", kategorie: "Expansion Pack 8" },
      { id: 87, name: "Zoologe", beschreibung: "Züchte zwei Pandas mit Bambus.", punkte: "153G", typ: "RARE", kategorie: "Expansion Pack 8" },

      // EXPANSION PACK 9
      { id: 88, name: "Atlantis?", beschreibung: "Finde eine Unterwasserruine.", punkte: "34G", typ: "UNCOMMON", kategorie: "Expansion Pack 9" },
      { id: 89, name: "Organisationstalent", beschreibung: "Beschrifte eine Shulker-Kiste mit einem Amboss.", punkte: "134G", typ: "RARE", kategorie: "Expansion Pack 9" },
      { id: 90, name: "Früchte des Webstuhls", beschreibung: "Fertige ein Banner mit einem verzauberten Apfel an.", punkte: "170G", typ: "RARE", kategorie: "Expansion Pack 9" },
      { id: 91, name: "Tausend Katzen", beschreibung: "Freunde dich mit zwanzig streunenden Katzen an.", punkte: "187G", typ: "RARE", kategorie: "Expansion Pack 9" },
      { id: 92, name: "Die sieben Weltmeere", beschreibung: "Besuche alle Ozean-Biome.", punkte: "66G", typ: "UNCOMMON", kategorie: "Expansion Pack 9" },

      // EXPANSION PACK 10
      { id: 93, name: "Gewinn um jeden Preis", beschreibung: "Für bestmöglichen Preis eintauschen.", punkte: "58G", typ: "UNCOMMON", kategorie: "Expansion Pack 10" },
      { id: 94, name: "Entzaubert", beschreibung: "Nutze einen Schleifstein, um von einem verzauberten Gegenstand Erfahrung zu erhalten.", punkte: "46G", typ: "UNCOMMON", kategorie: "Expansion Pack 10" },
      { id: 95, name: "Ich hab dabei ein schlechtes Gefühl", beschreibung: "Töte einen Plünderer-Hauptmann.", punkte: "39G", typ: "UNCOMMON", kategorie: "Expansion Pack 10" },
      { id: 96, name: "Nieder mit der Bestie!", beschreibung: "Besiege einen Verwüster.", punkte: "67G", typ: "UNCOMMON", kategorie: "Expansion Pack 10" },
      { id: 97, name: "Schlagt Alarm!", beschreibung: "Läute die Glocke, wenn sich ein Gegner im Dorf befindet.", punkte: "45G", typ: "UNCOMMON", kategorie: "Expansion Pack 10" },
      { id: 98, name: "Wir werden angegriffen!", beschreibung: "Löse einen Plünderer-Überfall aus.", punkte: "72G", typ: "UNCOMMON", kategorie: "Expansion Pack 10" },

      // EXPANSION PACK 11
      { id: 99, name: "Frachtstation", beschreibung: "Verwende einen Trichter, um einen Gegenstand aus einer Güterlore zu einer Truhe zu bewegen. [Nur in Bedrock]", punkte: "153G", typ: "RARE", kategorie: "Expansion Pack 11" },
      { id: 100, name: "Alles schmilzt!", beschreibung: "Verbinde drei Truhen mit einem einzigen Ofen mit drei Trichtern. [Nur in Bedrock]", punkte: "90G", typ: "UNCOMMON", kategorie: "Expansion Pack 11" },
      { id: 101, name: "Der Anfang", beschreibung: "Drücke einen Kolben mit einem Kolben, ziehe dann den Originalkolben mit diesem Kolben. [Nur in Bedrock]", punkte: "157G", typ: "RARE", kategorie: "Expansion Pack 11" },
      { id: 102, name: "Künstliche Selektion", beschreibung: "Züchte ein Maultier aus einem Pferd und einem Esel. [Nur in Bedrock]", punkte: "168G", typ: "RARE", kategorie: "Expansion Pack 11" },
      { id: 103, name: "Kaninchensaison", beschreibung: "Koche und iss ein Stück Kaninchenfleisch. [Nur in Bedrock]", punkte: "79G", typ: "UNCOMMON", kategorie: "Expansion Pack 11" },
      { id: 104, name: "Schatzjäger", beschreibung: "Kauf eine Ozeanentdecker- oder Waldentdeckerkarte von einem Dorfbewohner und betritt dann die aufgedeckte Struktur. [Nur in Bedrock]", punkte: "187G", typ: "RARE", kategorie: "Expansion Pack 11" },
      { id: 105, name: "Mein Schatz!", beschreibung: "Grabe einen Schatz aus. [Nur in Bedrock]", punkte: "75G", typ: "UNCOMMON", kategorie: "Expansion Pack 11" },
      { id: 106, name: "Meisterhändler", beschreibung: "Handle Waren im Wert von 1.000 Smaragden. [Nur in Bedrock]", punkte: "136G", typ: "RARE", kategorie: "Expansion Pack 11" },

      // EXPANSION PACK 12
      { id: 107, name: "Zeit für ein Süppchen", beschreibung: "Gib jemandem eine verdächtige Suppe. [Nur in Bedrock]", punkte: "156G", typ: "RARE", kategorie: "Expansion Pack 12" },
      { id: 108, name: "Biene-venu", beschreibung: "Fülle mithilfe eines Lagerfeuers Honig aus dem Bienenstock in eine Flasche, ohne die Bienen zu stören. [Nur in Bedrock]", punkte: "135G", typ: "RARE", kategorie: "Expansion Pack 12" },
      { id: 109, name: "Kompletter Summzug", beschreibung: "Setze Behutsamkeit ein, um ein Bienennest mit 3 Bienen darin zu bewegen und zu platzieren. [Nur in Bedrock]", punkte: "138G", typ: "RARE", kategorie: "Expansion Pack 12" },
      { id: 110, name: "Klebrige Angelegenheit", beschreibung: "Rutsche einen Honigblock hinab, um deinen Fall zu verlangsamen. [Nur in Bedrock]", punkte: "148G", typ: "RARE", kategorie: "Expansion Pack 12" },

      // EXPANSION PACK 13
      { id: 111, name: "Volltreffer", beschreibung: "Triff bei einem Ziel-Block mitten ins Ziel. [Nur in Bedrock]", punkte: "153G", typ: "RARE", kategorie: "Expansion Pack 13" },
      { id: 112, name: "Trümmermode", beschreibung: "Trage ein komplettes Rüstungsset aus Netherit. [Nur in Bedrock]", punkte: "54G", typ: "UNCOMMON", kategorie: "Expansion Pack 13" },
      { id: 113, name: "Ach, wie goldig!", beschreibung: "Lenke ein Piglin mit Gold ab. [Nur in Bedrock]", punkte: "105G", typ: "UNCOMMON", kategorie: "Expansion Pack 13" },
      { id: 114, name: "Touristen-Hotspot", beschreibung: "Besuche alle Nether-Biome. [Nur in Bedrock]", punkte: "39G", typ: "UNCOMMON", kategorie: "Expansion Pack 13" },

      // EXPANSION PACK 14
      { id: 115, name: "Mäh-chtig viel Wasserspaß", beschreibung: "Steig in ein Boot und paddle mit einer Ziege.", punkte: "5G", typ: "UNCOMMON", kategorie: "Expansion Pack 14" },
      { id: 116, name: "Wie gewachst", beschreibung: "Trage Wachs auf alle Kupferblöcke auf und entferne es wieder!", punkte: "5G", typ: "UNCOMMON", kategorie: "Expansion Pack 14" },
      { id: 117, name: "Die heilende Kraft der Freundschaft", beschreibung: "Tu dich mit einem Axolotl zusammen und gewinne einen Kampf.", punkte: "5G", typ: "UNCOMMON", kategorie: "Expansion Pack 14" },

      // EXPANSION PACK 15
      { id: 118, name: "Höhlen und Klippen", beschreibung: "Stürze im freien Fall von der maximalen Bauhöhe bis zum tiefsten Punkt der Welt und überlebe das Ganze.", punkte: "5G", typ: "UNCOMMON", kategorie: "Expansion Pack 15" },
      { id: 119, name: "Händler unter den Sternen", beschreibung: "Handle auf der maximalen Bauhöhe mit einem Dorfbewohner.", punkte: "5G", typ: "UNCOMMON", kategorie: "Expansion Pack 15" },
      { id: 120, name: "Lauschet nur der Musik!", beschreibung: "Verbreite mit den Klängen eines Plattenspielers Frohsinn auf der Wiese.", punkte: "5G", typ: "UNCOMMON", kategorie: "Expansion Pack 15" },
      { id: 121, name: "Fast wie daheim", beschreibung: "Mach mit deinem Schreiter einen Ausritt über einen Lavasee auf der Oberwelt und lege dabei eine Entfernung von 50 m zurück.", punkte: "5G", typ: "UNCOMMON", kategorie: "Expansion Pack 15" },

      // EXPANSION PACK 16
      { id: 122, name: "Es verbreitet sich", beschreibung: "Töte einen Mob neben einem Katalysator.", punkte: "10G", typ: "COMMON", kategorie: "Expansion Pack 16" },
      { id: 123, name: "Geburtstagslied", beschreibung: "Lassen Sie einen Hilfsgeist einen Kuchen auf einen Notenblock fallen.", punkte: "5G", typ: "UNCOMMON", kategorie: "Expansion Pack 16" },
      { id: 124, name: "Mit vereinten Kräften!", beschreibung: "Habe alle 3 Froschlichter in deinem Inventar.", punkte: "5G", typ: "UNCOMMON", kategorie: "Expansion Pack 16" },
      { id: 125, name: "Sneak 100", beschreibung: "Schleichen Sie sich neben einen Sculk Sensor, ohne ihn auszulösen.", punkte: "15G", typ: "RARE", kategorie: "Expansion Pack 16" },

      // EXPANSION PACK 17
      { id: 126, name: "Die Vergangenheit pflanzen", beschreibung: "Pflanze einen beliebigen Schnüffler-Samen.", punkte: "5G", typ: "UNCOMMON", kategorie: "Expansion Pack 17" },
      { id: 127, name: "Sorgfältige Instandsetzung", beschreibung: "Stelle einen dekorierten Topf aus 4 Keramikscherben her.", punkte: "5G", typ: "UNCOMMON", kategorie: "Expansion Pack 17" },
      { id: 128, name: "Schmieden mit Stil", beschreibung: "Nutze Schmiedevorlage Turm, Schnauze, Rippe, Schutz, Stille, Plagegeist, Gezeiten, Wegweiser min. 1x.", punkte: "5G", typ: "UNCOMMON", kategorie: "Expansion Pack 17" },

      // EXPANSION PACK 18
      { id: 129, name: "Aufwieglerisch", beschreibung: "Schalte einen Tresor mit einem ominösen Prüfungsschlüssel frei.", punkte: "10G", typ: "RARE", kategorie: "Expansion Pack 18" },
      { id: 130, name: "Werker fertigen Werker", beschreibung: "Sei in der Nähe eines Werkers, wenn er einen Werker anfertigt.", punkte: "5G", typ: "UNCOMMON", kategorie: "Expansion Pack 18" },
      { id: 131, name: "Wer braucht schon Raketen?", beschreibung: "Benutze eine Windkugel, um dich 8 Blöcke nach oben zu katapultieren.", punkte: "7G", typ: "UNCOMMON", kategorie: "Expansion Pack 18" },
      { id: 132, name: "Over-Overkill", beschreibung: "Verursache 50 Herzen Schaden mit einem einzigen Treffer mit dem Streitkolben.", punkte: "5G", typ: "UNCOMMON", kategorie: "Expansion Pack 18" },

      // EXPANSION PACK 19
      { id: 133, name: "Herztransplanteur", beschreibung: "Platziere ein Knarzherz mit der richtigen Ausrichtung zwischen zwei Blasseichenstamm-Blöcken.", punkte: "5G", typ: "UNCOMMON", kategorie: "Expansion Pack 19" },

      // EXPANSION PACK 20
      { id: 134, name: "Immer genug trinken!", beschreibung: "Platzier einen getrockneten Ghast-Block im Wasser.", punkte: "5G", typ: "UNCOMMON", kategorie: "Expansion Pack 20" },
    ];

  // ------------------------------------------------------------
  // 3. UI Grundstruktur
  // ------------------------------------------------------------
  app.innerHTML = `
      <div id="header-wrapper" class="mb-6 p-4 rounded-lg">
        <div id="header" class="mb-6">
          <div class="flex justify-between items-center mb-3 flex-wrap gap-2">
            <h1 class="hero-title text-xl sm:text-2xl">⛏️ ${accountName}'s Erfolge ⛏️</h1>
            <button id="logoutBtn" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-xs sm:text-sm">Abmelden</button>
          </div>

          <div id="mobileFilters" class="hidden sm:hidden flex-wrap gap-2 justify-center text-center">
            <button id="filterAll" class="bg-yellow-500/80 text-black px-3 py-1 rounded text-xs font-semibold w-20">Alle</button>
            <button id="filterOpen" class="bg-yellow-500/80 text-black px-3 py-1 rounded text-xs font-semibold w-20">Offen</button>
            <button id="filterDone" class="bg-yellow-500/80 text-black px-3 py-1 rounded text-xs font-semibold w-20">Fertig</button>
          </div>
        </div>

        <div id="dashboard" class="mb-6 grid grid-cols-4 gap-2 text-center">
          <div id="dash-done-wrapper" class="bg-yellow-500/80 text-black rounded p-2 cursor-pointer">
            <div id="dash-done" class="text-xl font-bold">0</div>
            <div class="text-[0.65rem] uppercase">Fertig</div>
          </div>
          <div id="dash-open-wrapper" class="bg-yellow-500/80 text-black rounded p-2 cursor-pointer">
            <div id="dash-open" class="text-xl font-bold">0</div>
            <div class="text-[0.65rem] uppercase">Offen</div>
          </div>
          <div class="bg-yellow-500/80 text-black rounded p-2">
            <div id="dash-progress" class="text-xl font-bold">0%</div>
            <div class="text-[0.65rem] uppercase">Progress</div>
          </div>
          <div class="bg-yellow-500/80 text-black rounded p-2">
            <div id="dash-total" class="text-xl font-bold">${erfolge.length}</div>
            <div class="text-[0.65rem] uppercase">Gesamt</div>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <input id="searchInput" class="w-full px-4 py-2 text-black rounded text-sm" placeholder="🔍 Erfolg suchen...">
      </div>

      <div id="categories"></div>
    `;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("currentAccount");
    location.reload();
  });

  const container = document.getElementById("categories");

  // ------------------------------------------------------------
  // 4. Nach Kategorien gruppieren
  // ------------------------------------------------------------
  const kategorien = {};
  erfolge.forEach(e => {
    if (!kategorien[e.kategorie]) kategorien[e.kategorie] = [];
    kategorien[e.kategorie].push(e);
  });

  // ============================================================
  // FIX: Speichere Scroll-Positionen vor dem Render
  // ============================================================
  function getScrollPositions() {
    const scrollMap = {};
    document.querySelectorAll(".category-content.open").forEach(content => {
      const header = content.previousElementSibling;
      const katName = header.querySelector(".title").textContent;
      scrollMap[katName] = content.scrollTop;
    });
    return scrollMap;
  }

  function restoreScrollPositions(scrollMap) {
    document.querySelectorAll(".category-content.open").forEach(content => {
      const header = content.previousElementSibling;
      const katName = header.querySelector(".title").textContent;
      if (scrollMap[katName] !== undefined) {
        content.scrollTop = scrollMap[katName];
      }
    });
  }

  // ============================================================
  // FIX: Dashboard aktualisieren
  // ============================================================
  function updateDashboard() {
    const doneCount = erfolge.filter(e => erfolgStatus[e.id]).length;
    const openCount = erfolge.length - doneCount;
    const progressPercent = ((doneCount / erfolge.length) * 100).toFixed(1);

    document.getElementById("dash-done").textContent = doneCount;
    document.getElementById("dash-open").textContent = openCount;
    document.getElementById("dash-progress").textContent = `${progressPercent}%`;
  }

  // ------------------------------------------------------------
  // 5. Render-Funktion (VOLLSTÄNDIGER Neubau)
  // ------------------------------------------------------------
  function render() {
    // Scroll-Positionen speichern
    const scrollPositions = getScrollPositions();

    container.innerHTML = "";

    updateDashboard();

    const doneW = document.getElementById("dash-done-wrapper");
    const openW = document.getElementById("dash-open-wrapper");

    doneW.classList.toggle("ring-4", showCompletedOnly);
    doneW.classList.toggle("ring-yellow-300", showCompletedOnly);
    openW.classList.toggle("ring-4", showOpenOnly);
    openW.classList.toggle("ring-yellow-300", showOpenOnly);

    Object.keys(kategorien).forEach(kat => {
      const erfolgsListe = kategorien[kat];
      const doneInCat = erfolgsListe.filter(e => erfolgStatus[e.id]).length;
      const totalInCat = erfolgsListe.length;

      const visibleItems = erfolgsListe.filter(e => {
        const nameMatch = !currentSearchTerm || e.name.toLowerCase().includes(currentSearchTerm);
        const doneState = erfolgStatus[e.id] || false;
        if (showCompletedOnly) return nameMatch && doneState;
        if (showOpenOnly) return nameMatch && !doneState;
        return nameMatch;
      });

      if (visibleItems.length === 0) return;

      const wrapper = document.createElement("div");
      wrapper.className = "category mb-3";

      const percentInCat = ((doneInCat / totalInCat) * 100).toFixed(0);

      wrapper.innerHTML = `
        <div class="category-header flex justify-between items-center cursor-pointer">
          <div class="left flex items-center gap-2">
            <span class="text-[0.7rem] text-yellow-300">${doneInCat}/${totalInCat} erledigt</span>
            <span class="title">${kat}</span>
          </div>
          <div class="right flex items-center gap-3">
            <div class="text-[0.7rem] text-yellow-300">${percentInCat}%</div>
            <span class="toggle text-white">+</span>
          </div>
        </div>
        <div class="category-content">
          <div class="cards-grid"></div>
        </div>
      `;

      const header = wrapper.querySelector(".category-header");
      const toggleSpan = wrapper.querySelector(".toggle");
      const content = wrapper.querySelector(".category-content");
      const grid = wrapper.querySelector(".cards-grid");

      if (offeneKategorien.has(kat)) {
        content.classList.add("open");
        toggleSpan.textContent = "−";
      }

      header.addEventListener("click", () => {
        const open = content.classList.toggle("open");
        toggleSpan.textContent = open ? "−" : "+";
        if (open) offeneKategorien.add(kat);
        else offeneKategorien.delete(kat);
      });

      visibleItems.forEach(erfolg => {
        const checked = erfolgStatus[erfolg.id] || false;

        const bildPfad = getBildPfad(erfolg.id);

        const card = document.createElement("div");
        card.className = `card ${checked ? "success-card" : ""}`;

        card.innerHTML = `
          <div class="flex justify-between items-center w-full">
            <img src="${bildPfad}" alt="${erfolg.name}" class="w-15 h-15 object-contain mr-2 mt-1 select-none" loading="lazy">
            <div class="flex flex-col">
              <div class="text-xs mb-1">${erfolg.name}</div>
              <div class="beschreibung mt-1 opacity-80">${erfolg.beschreibung}</div>
            </div>

            <div class="flex items-center gap-2">
              <div class="flex flex-col items-end justify-center leading-none text-right">
                <div class="erfolg-punkte">${erfolg.punkte}</div>
                <div class="erfolg-typ">${erfolg.typ}</div>
              </div>
              <div class="checkbox ${checked ? "checked" : ""} w-5 h-5 flex items-center justify-center border border-yellow-400 rounded-sm">
                ${checked ? "✓" : ""}
              </div>
            </div>
          </div>
        `;

        card.addEventListener("click", (e) => {
          if (e.target.classList.contains("checkbox") || e.target.closest(".checkbox")) return;
          
          const wasExpanded = card.classList.contains("expanded");
          card.classList.toggle("expanded");
          
          // Auto-Scroll wenn aufgeklappt wird
          if (!wasExpanded) {
            setTimeout(() => {
              const cardRect = card.getBoundingClientRect();
              const beschreibung = card.querySelector('.beschreibung');
              const beschreibungRect = beschreibung.getBoundingClientRect();
              const beschreibungBottom = beschreibungRect.bottom;
              const categoryContent = card.closest('.category-content');
              
              if (categoryContent) {
                const containerRect = categoryContent.getBoundingClientRect();
                const containerBottom = containerRect.bottom;
                
                // Prüfen ob Beschreibung außerhalb des sichtbaren Bereichs ist
                if (beschreibungBottom > containerBottom) {
                  const scrollAmount = beschreibungBottom - containerBottom + 20; // +20px Puffer
                  categoryContent.scrollBy({ top: scrollAmount, behavior: 'smooth' });
                }
              }
            }, 150); // Warten bis die Expand-Animation fertig ist
          }
        });

        card.querySelector(".checkbox").addEventListener("click", e => {
          e.stopPropagation();
          erfolgStatus[erfolg.id] = !erfolgStatus[erfolg.id];
          localStorage.setItem(storageKey, JSON.stringify(erfolgStatus));

          render();
        });

        grid.appendChild(card);
      });

      container.appendChild(wrapper);
    });

    // Scroll-Positionen wiederherstellen
    setTimeout(() => restoreScrollPositions(scrollPositions), 0);
  }

  // ------------------------------------------------------------
  // 6. Suchfunktion
  // ------------------------------------------------------------
  document.getElementById("searchInput").addEventListener("input", e => {
    currentSearchTerm = e.target.value.toLowerCase();
    render();
  });

  // ------------------------------------------------------------
  // 7. Dashboard Filter (Fertig & Offen)
  // ------------------------------------------------------------
  document.getElementById("dash-done-wrapper").addEventListener("click", () => {
    showCompletedOnly = !showCompletedOnly;
    showOpenOnly = false;
    render();
  });

  document.getElementById("dash-open-wrapper").addEventListener("click", () => {
    showOpenOnly = !showOpenOnly;
    showCompletedOnly = false;
    render();
  });

  // ------------------------------------------------------------
  // 8. Mobile Filter Buttons
  // ------------------------------------------------------------
  const btnAll = document.getElementById("filterAll");
  const btnOpen = document.getElementById("filterOpen");
  const btnDone = document.getElementById("filterDone");

  if (btnAll && btnOpen && btnDone) {
    btnAll.addEventListener("click", () => {
      showCompletedOnly = false;
      showOpenOnly = false;
      render();
    });

    btnOpen.addEventListener("click", () => {
      showOpenOnly = !showOpenOnly;
      showCompletedOnly = false;
      render();
    });

    btnDone.addEventListener("click", () => {
      showCompletedOnly = !showCompletedOnly;
      showOpenOnly = false;
      render();
    });
  }

  render();
});
