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

  // ------------------------------------------------------------
  // 2. Erfolgsdaten (Beispiel)
  // ------------------------------------------------------------
  const erfolge = [
      // BASE GAME
      { id: 1, name: "Inventur", beschreibung: "Öffne dein Inventar.", punkte: "10G", typ: "COMMON", kategorie: "Base Game" },
      { id: 2, name: "Holzfällerei", beschreibung: "Schlage auf einen Baum ein, bis ein Block Holz herausfällt.", punkte: "10G", typ: "COMMON", kategorie: "Base Game" },
      { id: 3, name: "Die lange Bank", beschreibung: "Stell aus vier Blöcken Holz eine Werkbank her.", punkte: "10G", typ: "COMMON", kategorie: "Base Game" },
      { id: 4, name: "Ab in die Mine", beschreibung: "Stell aus Holz und Stöcken eine Spitzhacke her.", punkte: "10G", typ: "COMMON", kategorie: "Base Game" },
      { id: 5, name: "Heißes Thema", beschreibung: "Stell aus 8 Pflasterstein-Blöcken einen Ofen her.", punkte: "15G", typ: "COMMON", kategorie: "Base Game" },
      { id: 6, name: "Werkzeugherstellung", beschreibung: "Schmilz einen Eisenbarren.", punkte: "15G", typ: "COMMON", kategorie: "Base Game" },
      { id: 7, name: "Zeit für Ackerbau!", beschreibung: "Stell aus Holz und Stöcken eine Hacke her.", punkte: "10G", typ: "COMMON", kategorie: "Base Game" },
      { id: 8, name: "Brot backen", beschreibung: "Stell Brot aus Weizen her.", punkte: "15G", typ: "COMMON", kategorie: "Base Game" },
      { id: 9, name: "Die Lüge", beschreibung: "Backe aus Weizen, Zucker, Milch und Eiern einen Kuchen!", punkte: "30G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 10, name: "Es geht immer noch besser", beschreibung: "Stell eine bessere Spitzhacke her.", punkte: "15G", typ: "COMMON", kategorie: "Base Game" },
      { id: 11, name: "Köstlicher Fisch", beschreibung: "Fange einen Fisch und koche ihn!", punkte: "15G", typ: "COMMON", kategorie: "Base Game" },
      { id: 12, name: "Per Schiene", beschreibung: "Reise mit einer Lore mindestens 500 Meter in eine Richtung.", punkte: "40G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 13, name: "Zeit zum Zuschlagen!", beschreibung: "Stell aus Holz und Stöcken ein Schwert her.", punkte: "10G", typ: "COMMON", kategorie: "Base Game" },
      { id: 14, name: "Monsterjäger", beschreibung: "Greif ein Monster an und töte es.", punkte: "15G", typ: "COMMON", kategorie: "Base Game" },
      { id: 15, name: "Das Fell über die Ohren ziehen", beschreibung: "Gewinne Leder.", punkte: "15G", typ: "COMMON", kategorie: "Base Game" },
      { id: 16, name: "Wenn Schweine fliegen", beschreibung: "Reite ein Schwein mit einem Sattel, und füg ihm dann während des Reitens Schaden durch Fallen zu.", punkte: "40G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 17, name: "Alphawolf", beschreibung: "Freunde dich mit fünf Wölfen an.", punkte: "20G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 18, name: "Bestens ausgerüstet", beschreibung: "Stell ein Exemplar von jedem Werkzeug her (1 Spitzhacke, 1 Spaten, 1 Axt und 1 Hacke).", punkte: "15G", typ: "COMMON", kategorie: "Base Game" },
      { id: 19, name: "Feuer frei", beschreibung: "Stell einen Dispenser her.", punkte: "20G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 20, name: "Auf in den Nether", beschreibung: "Stell ein Netherportal her.", punkte: "30G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 21, name: "Scharfschützenduell", beschreibung: "Töte ein Skelett aus mehr als 50 Metern Entfernung mit einem Pfeil.", punkte: "30G", typ: "RARE", kategorie: "Base Game" },
      { id: 22, name: "DIAMANTEN!", beschreibung: "Sammle mit deinen Eisenwerkzeugen Diamanten.", punkte: "20G", typ: "COMMON", kategorie: "Base Game" },
      { id: 23, name: "Zurück zum Absender", beschreibung: "Vernichte einen Ghast mit einem Feuerball.", punkte: "30G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 24, name: "Ins Feuer!", beschreibung: "Erleichtere eine Lohe um ihre Rute.", punkte: "20G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 25, name: "Selbstgebrautes", beschreibung: "Braue einen Trank.", punkte: "15G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 26, name: "Das Ende?", beschreibung: "Betritt ein Endportal.", punkte: "20G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 27, name: "Das Ende!", beschreibung: "Besiege den Enderdrachen.", punkte: "40G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 28, name: "Bezaubernd", beschreibung: "Baue einen Zaubertisch.", punkte: "20G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 29, name: "Übertriebene Gewalt", beschreibung: "Verursache mit einem einzigen Schlag neun Herzen Schaden.", punkte: "30G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 30, name: "Bibliothekar", beschreibung: "Baue ein paar Bücherregale, um deinen Zaubertisch zu verbessern.", punkte: "20G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 31, name: "Abenteuerzeit", beschreibung: "Entdecke 17 von 40 Biomen.", punkte: "40G", typ: "COMMON", kategorie: "Base Game" },
      { id: 32, name: "Neubesiedelung", beschreibung: "Züchte zwei Kühe mit Weizen.", punkte: "15G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 33, name: "Diamanten für dich!", beschreibung: "Wirf Diamanten auf einen anderen Spieler.", punkte: "15G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 34, name: "Schweinefleisch", beschreibung: "Koche und iss Schweinefleisch.", punkte: "10G", typ: "COMMON", kategorie: "Base Game" },
      { id: 35, name: "Die Zeit vertreiben", beschreibung: "Spiele 100 Tage.", punkte: "20G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 36, name: "Bogenschütze", beschreibung: "Erledige einen Creeper mit Pfeilen.", punkte: "10G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 37, name: "Der Feilscher", beschreibung: "Erwirb 30 Smaragde durch den Handel mit Dorfbewohnern oder durch Abbau.", punkte: "30G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 38, name: "Blumentöpfler", beschreibung: "Stelle einen Blumentopf her und platziere ihn.", punkte: "15G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 39, name: "Ein Schild!", beschreibung: "Stelle ein Schild her und platziere es.", punkte: "15G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 40, name: "Eiserner Magen", beschreibung: "Entgehe dem Hungertod durch verrottetes Fleisch.", punkte: "20G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 41, name: "Schönen Schertag!", beschreibung: "Benutze Scheren, um Wolle von Schafen zu erhalten.", punkte: "15G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 42, name: "Regenbogensammlung", beschreibung: "Sammle alle 16 Wollfarben.", punkte: "30G", typ: "RARE", kategorie: "Base Game" },
      { id: 43, name: "Cool bleiben", beschreibung: "Schwimme in Lava, während du den Feuerwiderstand-Effekt hast.", punkte: "20G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 44, name: "Haufenweise Pflastersteine", beschreibung: "Baue 1.728 Blöcke Pflasterstein ab und platziere sie in einer Truhe.", punkte: "20G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 45, name: "Erneuerbare Energie", beschreibung: "Schmilz Baumstämme mit Holzkohle, um mehr Holzkohle zu erhalten.", punkte: "10G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 46, name: "Musik in meinen Ohren", beschreibung: "Spiele eine Schallplatte in einer Jukebox ab.", punkte: "10G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 47, name: "Bodyguard", beschreibung: "Erschaffe einen Eisengolem.", punkte: "20G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 48, name: "Iron Man", beschreibung: "Trage ein komplettes Set Eisenrüstung.", punkte: "15G", typ: "COMMON", kategorie: "Base Game" },
      { id: 49, name: "Zombie-Doktor", beschreibung: "Heile einen Zombie-Dorfbewohner.", punkte: "40G", typ: "UNCOMMON", kategorie: "Base Game" },
      { id: 50, name: "Löwenjäger", beschreibung: "Gewinne das Vertrauen eines Ozelots.", punkte: "15G", typ: "UNCOMMON", kategorie: "Base Game" },

      // DLC TROPHY PACK 1
      { id: 51, name: "Der Anfang?", beschreibung: "Erschaffe den Wither.", punkte: "20G", typ: "UNCOMMON", kategorie: "DLC Pack 1" },
      { id: 52, name: "Der Anfang.", beschreibung: "Töte den Wither.", punkte: "40G", typ: "UNCOMMON", kategorie: "DLC Pack 1" },
      { id: 53, name: "Leuchtturmwärter", beschreibung: "Erstelle ein Leuchtfeuer mit allen Kräften.", punkte: "60G", typ: "RARE", kategorie: "DLC Pack 1" },
      { id: 54, name: "Übermächtig", beschreibung: "Iss einen Notch-Apfel.", punkte: "30G", typ: "UNCOMMON", kategorie: "DLC Pack 1" },
      { id: 55, name: "Batik-Outfit", beschreibung: "Färbe die vier verschiedenen Teile der Lederrüstung.", punkte: "15G", typ: "UNCOMMON", kategorie: "DLC Pack 1" },
      { id: 56, name: "Trampolin", beschreibung: "Lass dich von einem Schleimblock 30 Blöcke hoch zurückwerfen.", punkte: "15G", typ: "UNCOMMON", kategorie: "DLC Pack 1" },

      // DLC TROPHY PACK 2
      { id: 57, name: "Der Student ...", beschreibung: "Gewinne ein öffentliches Kampf-Minispiel. [Nur Editions]", punkte: "10G", typ: "UNCOMMON", kategorie: "DLC Pack 2" },
      { id: 58, name: "Und der Meister ist ...", beschreibung: "Gewinne 3 öffentliche Kampf-Minispiele in Folge. [Nur Editions]", punkte: "20G", typ: "RARE", kategorie: "DLC Pack 2" },
      { id: 59, name: "Nur ein Kratzer", beschreibung: "Stecke 100 Schadenspunkte in einer Runde eines öffentlichen Kampfspiels ein. [Nur Editions]", punkte: "15G", typ: "VERY RARE", kategorie: "DLC Pack 2" },
      { id: 60, name: "Amor", beschreibung: "Erledige 2 Spieler in einer Runde eines öffentlichen Kampf-Minispiels mit Pfeil und Bogen. [Nur Editions]", punkte: "20G", typ: "RARE", kategorie: "DLC Pack 2" },
      { id: 61, name: "Hungerqualen", beschreibung: "Erledige einen Spieler in einem Kampf-Minispiel, während du ausgehungert bist. [Nur Editions]", punkte: "20G", typ: "RARE", kategorie: "DLC Pack 2" },
      { id: 62, name: "Meins!", beschreibung: "Öffne in einer Runde jede Truhe in einer Kampf-Minispiel-Arena. [Nur Editions]", punkte: "30G", typ: "ULTRA RARE", kategorie: "DLC Pack 2" },

      // DLC TROPHY PACK 3
      { id: 63, name: "Das Ende ... mal wieder ...", beschreibung: "Lass den Enderdrachen erneut erscheinen.", punkte: "30G", typ: "UNCOMMON", kategorie: "DLC Pack 3" },
      { id: 64, name: "Pfefferminz gefällig?", beschreibung: "Sammle Drachenodem in einer Glasflasche.", punkte: "30G", typ: "UNCOMMON", kategorie: "DLC Pack 3" },
      { id: 65, name: "Super Sonic", beschreibung: "Fliege mit Elytren mit mehr als 40 m/s durch einen Spalt, der 1 mal 1 misst.", punkte: "30G", typ: "RARE", kategorie: "DLC Pack 3" },
      { id: 66, name: "Trockenperiode", beschreibung: "Trockne einen Schwamm in einem Ofen.", punkte: "15G", typ: "UNCOMMON", kategorie: "DLC Pack 3" },

      // DLC TROPHY PACK 4
      { id: 67, name: "Freitaucher", beschreibung: "Bleibe 2 Minuten unter Wasser.", punkte: "20G", typ: "UNCOMMON", kategorie: "DLC Pack 4" },
      { id: 68, name: "Superbrennstoff", beschreibung: "Betreibe einen Ofen mit Lava.", punkte: "20G", typ: "UNCOMMON", kategorie: "DLC Pack 4" },
      { id: 69, name: "Aufsatteln", beschreibung: "Zähme ein Pferd.", punkte: "20G", typ: "COMMON", kategorie: "DLC Pack 4" },
      { id: 70, name: "Gegengift", beschreibung: "Vergifte eine Hexe mit einem Wurftrank.", punkte: "20G", typ: "VERY RARE", kategorie: "DLC Pack 4" },
      { id: 71, name: "Beam mich hoch", beschreibung: "Teleportiere dich über mehr als 100 Meter durch einen einzelnen Wurf einer Enderperle.", punkte: "20G", typ: "UNCOMMON", kategorie: "DLC Pack 4" },
      { id: 72, name: "Kartenraum", beschreibung: "Platziere eine vollständig erkundete Karte in einem Gegenstandsrahmen.", punkte: "40G", typ: "VERY RARE", kategorie: "DLC Pack 4" },
      { id: 73, name: "Gut getarnt", beschreibung: "Erledige einen NPC, während du den gleichen NPC-Kopf trägst.", punkte: "30G", typ: "RARE", kategorie: "DLC Pack 4" },

      // DLC TROPHY PACK 5
      { id: 74, name: "Comeback", beschreibung: "Gewinne 3 Runden in Folge, nachdem einer der Gegner 2 Runden gewonnen hat. [Nur Editions]", punkte: "20G", typ: "RARE", kategorie: "DLC Pack 5" },
      { id: 75, name: "Schneeballlos", beschreibung: "Gewinne eine Schneeball-Runde ohne einen einzigen Schneeball einzusetzen! [Nur Editions]", punkte: "20G", typ: "RARE", kategorie: "DLC Pack 5" },
      { id: 76, name: "Schneesturm", beschreibung: "Triff in einer einzigen öffentlichen Runde einen einzelnen Spieler mit 25 Schneebällen. [Nur Editions]", punkte: "20G", typ: "VERY RARE", kategorie: "DLC Pack 5" },
      { id: 77, name: "Heißblütig", beschreibung: "Triff einen Spieler beim Fallen in die Lava mit einem Schneeball. [Nur Editions]", punkte: "15G", typ: "UNCOMMON", kategorie: "DLC Pack 5" },
      { id: 78, name: "Schneepflug", beschreibung: "Schubse in einer einzigen öffentlichen Runde drei Spieler mithilfe von Schneebällen in Lava. [Nur Editions]", punkte: "20G", typ: "RARE", kategorie: "DLC Pack 5" },
      { id: 79, name: "Oberhand", beschreibung: "Bleibe auf der obersten Ebene, während du eine Runde beim Schneeball-Sturz-Minispiel gewinnst. [Nur Editions]", punkte: "15G", typ: "UNCOMMON", kategorie: "DLC Pack 5" },
      { id: 80, name: "Underdog", beschreibung: "Gewinne ein Sturz-Spiel, während du dich auf der untersten Ebene in einem Schneeball-Sturz-Minispiel befindest. [Nur Editions]", punkte: "15G", typ: "UNCOMMON", kategorie: "DLC Pack 5" },

      // DLC TROPHY PACK 6
      { id: 81, name: "Das tiefe Ende", beschreibung: "Besiege einen großen Wächter.", punkte: "30G", typ: "RARE", kategorie: "DLC Pack 6" },
      { id: 82, name: "Tolle Aussicht hier oben", beschreibung: "Schwebe vor den Angriffen eines Shulkers 50 Blöcke nach oben.", punkte: "20G", typ: "VERY RARE", kategorie: "DLC Pack 6" },
      { id: 83, name: "Lakenwechsel", beschreibung: "Färbe dein Bett in einer anderen Farbe.", punkte: "15G", typ: "UNCOMMON", kategorie: "DLC Pack 6" },
      { id: 84, name: "Von der Schippe gesprungen", beschreibung: "Springe dem Tod mit dem Totem der Unsterblichkeit von der Schippe.", punkte: "30G", typ: "UNCOMMON", kategorie: "DLC Pack 6" },
      { id: 85, name: "Läuft gar nicht so schlecht für mich ...", beschreibung: "Führe eine Karawane mit mindestens 5 Lamas an.", punkte: "20G", typ: "VERY RARE", kategorie: "DLC Pack 6" },
      { id: 86, name: "Alles läuft glatt!", beschreibung: "Laufe mit den Frostläufer-Stiefeln auf mindestens einem Block über gefrorenem Wasser in der Tiefsee.", punkte: "20G", typ: "RARE", kategorie: "DLC Pack 6" },
      { id: 87, name: "Unwohlsein", beschreibung: "Besiege einen Magier.", punkte: "20G", typ: "UNCOMMON", kategorie: "DLC Pack 6" },

      // DLC TROPHY PACK 7
      { id: 88, name: "Gurken-Viertel", beschreibung: "Platziere vier Meeresgurken in einem Block.", punkte: "20G", typ: "UNCOMMON", kategorie: "DLC Pack 7" },
      { id: 89, name: "Alternativer Brennstoff", beschreibung: "Verwende einen getrockneten Seetang-Block als Brennstoff in einem Ofen.", punkte: "20G", typ: "UNCOMMON", kategorie: "DLC Pack 7" },
      { id: 90, name: "Mahlstrom", beschreibung: "Aktiviere einen Aquisator.", punkte: "50G", typ: "RARE", kategorie: "DLC Pack 7" },
      { id: 91, name: "Schiffbrüchig", beschreibung: "Iss 3 Tage lang nichts außer Seetang.", punkte: "20G", typ: "RARE", kategorie: "DLC Pack 7" },
      { id: 92, name: "Schwimmhäute", beschreibung: "Bleib einen ganzen Tag lang unter Wasser, ohne Tränke einzusetzen.", punkte: "30G", typ: "RARE", kategorie: "DLC Pack 7" },
      { id: 93, name: "Echolotung", beschreibung: "Füttere einen Delfin mit rohem Kabeljau und lass dich von ihm zum Schatz locken.", punkte: "20G", typ: "UNCOMMON", kategorie: "DLC Pack 7" },

      // DLC TROPHY PACK 8
      { id: 94, name: "Mach eine Fassrolle", beschreibung: "Setze den Sog ein, um dir selbst einen Schub zu verpassen.", punkte: "30G", typ: "RARE", kategorie: "DLC Pack 8" },
      { id: 95, name: "Meeresbiologe", beschreibung: "Sammle einen beliebigen Fisch in einem Eimer.", punkte: "20G", typ: "UNCOMMON", kategorie: "DLC Pack 8" },
      { id: 96, name: "Ahoi!", beschreibung: "Entdecke ein Schiffswrack.", punkte: "20G", typ: "COMMON", kategorie: "DLC Pack 8" },
      { id: 97, name: "Dach der Welt", beschreibung: "Baue einen Turm aus Gerüsten, der die maximale Gebäudehöhe erreicht.", punkte: "20G", typ: "VERY RARE", kategorie: "DLC Pack 8" },
      { id: 98, name: "Wo bist du gewesen?", beschreibung: "Erhalte ein Geschenk am Morgen von einer gezähmten Katze.", punkte: "20G", typ: "RARE", kategorie: "DLC Pack 8" },
      { id: 99, name: "Zoologe", beschreibung: "Bringe zwei Pandas mit Bambus dazu, ein Junges zu zeugen.", punkte: "40G", typ: "RARE", kategorie: "DLC Pack 8" },

      // DLC TROPHY PACK 9
      { id: 100, name: "Atlantis?", beschreibung: "Finde eine Unterwasserruine.", punkte: "20G", typ: "COMMON", kategorie: "DLC Pack 9" },
      { id: 101, name: "Organisationstalent", beschreibung: "Benenne eine Shulkerkiste mit einem Amboss.", punkte: "30G", typ: "RARE", kategorie: "DLC Pack 9" },
      { id: 102, name: "Fahnenfrucht", beschreibung: "Stelle ein Banner mit einem verzauberten Apfel her.", punkte: "20G", typ: "VERY RARE", kategorie: "DLC Pack 9" },
      { id: 103, name: "Katzen in Hülle und Fülle", beschreibung: "Freunde dich mit zwanzig streunenden Katzen an.", punkte: "20G", typ: "VERY RARE", kategorie: "DLC Pack 9" },
      { id: 104, name: "Die 7 Meere befahren", beschreibung: "Befahre alle Ozean-Biome.", punkte: "40G", typ: "UNCOMMON", kategorie: "DLC Pack 9" },

      // DLC TROPHY PACK 10
      { id: 105, name: "Mit Gewinn verkaufen", beschreibung: "Handle für den bestmöglichen Preis.", punkte: "50G", typ: "UNCOMMON", kategorie: "DLC Pack 10" },
      { id: 106, name: "Entzaubert", beschreibung: "Nutze einen Schleifstein, um Erfahrung von einem verzauberten Gegenstand zu erlangen.", punkte: "20G", typ: "UNCOMMON", kategorie: "DLC Pack 10" },
      { id: 107, name: "Ich habe ein mieses Gefühl dabei", beschreibung: "Besiege einen Plünderer-Anführer.", punkte: "20G", typ: "COMMON", kategorie: "DLC Pack 10" },
      { id: 108, name: "Töte die Bestie!", beschreibung: "Besiege einen Verwüster.", punkte: "30G", typ: "UNCOMMON", kategorie: "DLC Pack 10" },
      { id: 109, name: "Läute den Alarm!", beschreibung: "Läute die Glocke mit einem feindlichen Gegner im Dorf.", punkte: "20G", typ: "UNCOMMON", kategorie: "DLC Pack 10" },
      { id: 110, name: "Wir werden angegriffen!", beschreibung: "Löse einen Plünderer-Überfall aus.", punkte: "20G", typ: "UNCOMMON", kategorie: "DLC Pack 10" },

      // DLC TROPHY PACK 11
      { id: 111, name: "Güterbahnhof", beschreibung: "Bewege einen Gegenstand mit einem Trichter von einer Lore mit Truhe in eine Truhe. [Nur Bedrock]", punkte: "15G", typ: "VERY RARE", kategorie: "DLC Pack 11" },
      { id: 112, name: "Alles geschmolzen!", beschreibung: "Verbinde mit drei Trichtern drei Truhen zu einem einzigen Schmelzofen. [Nur Bedrock]", punkte: "15G", typ: "UNCOMMON", kategorie: "DLC Pack 11" },
      { id: 113, name: "Auf Anfang", beschreibung: "Schiebe einen Kolben mit einem Kolben und ziehe dann den ursprünglichen Kolben mit diesem Kolben. [Nur Bedrock]", punkte: "20G", typ: "VERY RARE", kategorie: "DLC Pack 11" },
      { id: 114, name: "Künstliche Selektion", beschreibung: "Züchte ein Maultier aus einem Pferd und einem Esel. [Nur Bedrock]", punkte: "30G", typ: "VERY RARE", kategorie: "DLC Pack 11" },
      { id: 115, name: "Kaninchensaison", beschreibung: "Koche und iss Kaninchenfleisch. [Nur Bedrock]", punkte: "15G", typ: "UNCOMMON", kategorie: "DLC Pack 11" },
      { id: 116, name: "Schatzjäger", beschreibung: "Erwirb eine Karte von einem Kartografen-Dorfbewohner und betritt dann das aufgezeigte Bauwerk. [Nur Bedrock]", punkte: "40G", typ: "VERY RARE", kategorie: "DLC Pack 11" },
      { id: 117, name: "Goldrausch!", beschreibung: "Grabe einen verborgenen Schatz aus. [Nur Bedrock]", punkte: "30G", typ: "UNCOMMON", kategorie: "DLC Pack 11" },
      { id: 118, name: "Meisterhändler", beschreibung: "Tausche für 1.000 Smaragde. [Nur Bedrock]", punkte: "30G", typ: "VERY RARE", kategorie: "DLC Pack 11" },

      // DLC TROPHY PACK 12
      { id: 119, name: "Suppenzeit", beschreibung: "Gib jemandem eine verdächtige Suppe. [Nur Bedrock]", punkte: "20G", typ: "RARE", kategorie: "DLC Pack 12" },
      { id: 120, name: "Bienenfreundschaft", beschreibung: "Nutze ein Lagerfeuer, um mit einer Flasche Honig aus einem Bienenstock zu sammeln, ohne die Bienen zu ärgern. [Nur Bedrock]", punkte: "15G", typ: "UNCOMMON", kategorie: "DLC Pack 12" },
      { id: 121, name: "Bienenumzug", beschreibung: "Bewege mit Behutsamkeit ein Bienennest mit drei Bienen. [Nur Bedrock]", punkte: "30G", typ: "RARE", kategorie: "DLC Pack 12" },
      { id: 122, name: "Klebrige Situation", beschreibung: "Rutsche einen Honigblock hinab, um deinen Fall zu verlangsamen. [Nur Bedrock]", punkte: "30G", typ: "RARE", kategorie: "DLC Pack 12" },

      // DLC TROPHY PACK 13
      { id: 123, name: "Volltreffer", beschreibung: "Triff bei einem Ziel-Block die Zielmitte [Nur Bedrock]", punkte: "15G", typ: "RARE", kategorie: "DLC Pack 13" },
      { id: 124, name: "Trümmermode", beschreibung: "Trage ein komplettes Rüstungsset aus Netherit [Nur Bedrock]", punkte: "50G", typ: "UNCOMMON", kategorie: "DLC Pack 13" },
      { id: 125, name: "Ach, wie goldig!", beschreibung: "Lenke ein Schweini mit Gold ab [Nur Bedrock]", punkte: "30G", typ: "RARE", kategorie: "DLC Pack 13" },
      { id: 126, name: "Touristen-Hotspot", beschreibung: "Besuche alle Nether-Biome [Nur Bedrock]", punkte: "30G", typ: "UNCOMMON", kategorie: "DLC Pack 13" }
  ];

  // ------------------------------------------------------------
  // 3. UI Grundstruktur
  // ------------------------------------------------------------
  app.innerHTML = `
    <div id="header" class="mb-6">
      <div class="flex justify-between items-center mb-3 flex-wrap gap-2">
        <h1 class="hero-title text-xl sm:text-2xl">Erfolge von ${accountName}</h1>
        <button id="logoutBtn" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-xs sm:text-sm">Abmelden</button>
      </div>

      <!-- 📱 Mobile Filter Buttons -->
      <div id="mobileFilters" class="hidden sm:hidden flex-wrap gap-2 justify-center text-center"> <!-- <-- neu -->
        <button id="filterAll" class="bg-yellow-500/80 text-black px-3 py-1 rounded text-xs font-semibold w-20">Alle</button>
        <button id="filterOpen" class="bg-yellow-500/80 text-black px-3 py-1 rounded text-xs font-semibold w-20">Offen</button>
        <button id="filterDone" class="bg-yellow-500/80 text-black px-3 py-1 rounded text-xs font-semibold w-20">Fertig</button>
      </div>
    </div>

    <!-- Dashboard -->
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

  // ------------------------------------------------------------
  // 5. Render-Funktion
  // ------------------------------------------------------------
  function render() {
    container.innerHTML = "";

    const doneCount = erfolge.filter(e => erfolgStatus[e.id]).length;
    const openCount = erfolge.length - doneCount;
    const progressPercent = ((doneCount / erfolge.length) * 100).toFixed(1);

    document.getElementById("dash-done").textContent = doneCount;
    document.getElementById("dash-open").textContent = openCount;
    document.getElementById("dash-progress").textContent = `${progressPercent}%`;

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
            <span class="text-[0.7rem]">${doneInCat}/${totalInCat} erledigt</span>
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

        const card = document.createElement("div");
        card.className = `card ${checked ? "success-card" : ""}`;
        card.dataset.name = erfolg.name.toLowerCase();

        card.innerHTML = `
          <div class="flex justify-between items-start w-full">
            <div class="flex flex-col">
              <div class="text-xs mb-1">${erfolg.name}</div>
              <div class="beschreibung hidden mt-1 text-[0.6rem] opacity-80">${erfolg.beschreibung}</div>
            </div>

            <div class="flex items-center gap-2">
              <div class="flex flex-col items-end leading-none text-right">
                <div class="text-[0.65rem] text-yellow-400">${erfolg.punkte}</div>
                <div class="text-[0.55rem] uppercase text-gray-300">${erfolg.typ}</div>
              </div>
              <div class="checkbox ${checked ? "checked" : ""} w-5 h-5 flex items-center justify-center border border-yellow-400 rounded-sm">
                ${checked ? "✔" : ""}
              </div>
            </div>
          </div>
        `;

        card.addEventListener("click", e => {
          if (e.target.classList.contains("checkbox")) return;
          card.querySelector(".beschreibung").classList.toggle("hidden");
        });

        card.querySelector(".checkbox").addEventListener("click", e => {
          e.stopPropagation();
          erfolgStatus[erfolg.id] = !erfolgStatus[erfolg.id];
          localStorage.setItem(storageKey, JSON.stringify(erfolgStatus));

          if (currentSearchTerm.trim() === "") render();
          else {
            const box = e.target;
            box.classList.toggle("checked");
            card.classList.toggle("success-card");
            box.textContent = box.classList.contains("checked") ? "✔" : "";
          }
        });

        grid.appendChild(card);
      });

      container.appendChild(wrapper);
    });
  }

  // ------------------------------------------------------------
  // 6. Suchfunktion
  // ------------------------------------------------------------
  document.getElementById("searchInput").addEventListener("input", e => {
    currentSearchTerm = e.target.value.toLowerCase();
    render();
  });

  // ------------------------------------------------------------
  // 7. Klick-Logik: Fertig & Offen Filter (Dashboard)
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
  // 8. 📱 Mobile Filter Buttons (neu)
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
