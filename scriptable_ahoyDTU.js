async function fetchData() {
  try {
    const url = args.widgetParameter + "/api/record/live";
    const request = new Request(url);
    const response = await request.loadJSON();
    const inverterData = response.inverter[0]; // Zugriff auf das erste Array innerhalb von "inverter"
    
    // Hier werden die letzten Vorkommen von YieldDay und YieldTotal gesucht
    let lastYieldDayIndex = -1;
    let lastYieldTotalIndex = -1;
    for (let i = 0; i < inverterData.length; i++) {
      if (inverterData[i].fld === "YieldDay") {
        lastYieldDayIndex = i;
      }
      if (inverterData[i].fld === "YieldTotal") {
        lastYieldTotalIndex = i;
      }
    }
    
    // Rückgabe der Werte für YieldDay, YieldTotal und P_AC
    return {
      yieldDay: lastYieldDayIndex !== -1 ? inverterData[lastYieldDayIndex] : null,
      yieldTotal: lastYieldTotalIndex !== -1 ? inverterData[lastYieldTotalIndex] : null,
      pAC: inverterData.find(item => item.fld === "P_AC") || null
    };
  } catch (error) {
    console.log("Fehler beim Abrufen der Daten:", error);
    return null;
  }
}

async function createWidget() {
  const data = await fetchData();

  const widget = new ListWidget();
  widget.backgroundColor = new Color("#1E1E1E");

  // Füge Überschrift hinzu
  const header = widget.addText("Solaranlage");
  header.textSize = 16;
  header.textColor = Color.blue();
  header.font = Font.boldSystemFont(16);
  header.leftAlignText();
  header.lineLimit = 1;

  // Prüfen, ob die Daten erfolgreich abgerufen wurden
  if (data === null) {
    const errorText = widget.addText("Fehler beim Abrufen der Daten.");
    errorText.textColor = new Color("#FF3B30");
    errorText.textSize = 16;
    errorText.leftAlignText();
    widget.addSpacer(8);
    Script.setWidget(widget);
    Script.complete();
    return;
  }

  // Anzeigen der Werte
  if (data.yieldDay) {
    widget.addSpacer(4);
    const yieldDayText = widget.addText("Ausbeute Tag:");
    formatText(yieldDayText, Color.gray(), 14);
    const yieldDayValue = widget.addText(data.yieldDay.val + " " + data.yieldDay.unit);
    formatText(yieldDayValue, Color.orange(), 14);
  }

  if (data.yieldTotal) {
    widget.addSpacer(4);
    const yieldTotalText = widget.addText("Ausbeute Total:");
    formatText(yieldTotalText, Color.gray(), 14);
    const yieldTotalValue = widget.addText(data.yieldTotal.val + " " + data.yieldTotal.unit);
    formatText(yieldTotalValue, Color.orange(), 14);
  }

  if (data.pAC) {
    widget.addSpacer(4);
    const pACTitle = widget.addText("AC Leistung:");
    formatText(pACTitle, Color.gray(), 14);
    const pACValue = widget.addText(data.pAC.val + " " + data.pAC.unit);
    pACValue.font = Font.boldSystemFont(18);
    pACValue.textColor = Color.orange();
    pACValue.leftAlignText();
    pACValue.lineLimit = 1;
    pACValue.minimumScaleFactor = 0.5;
  }

  Script.setWidget(widget);
  Script.complete();
}

function formatText(textItem, color, size) {
  textItem.textColor = color;
  textItem.font = Font.mediumSystemFont(size);
  textItem.leftAlignText();
  textItem.lineLimit = 1;
  textItem.minimumScaleFactor = 0.5;
  textItem.padding = 8;
}

await createWidget();
