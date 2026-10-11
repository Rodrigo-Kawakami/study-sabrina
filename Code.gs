// SHEET_NAME: aba do cronograma | TOKEN:senha
const SHEET_NAME = "Assuntos R1";
const TOKEN = "senha";
const STAGES = 7;
const STAGE_WIDTH = 4;
const FIRST_STAGE_INDEX = 6;
const NAME_INDEX = 1;
const AREA_INDEX = 2;
const INCIDENCE_INDEX = 3;
const PRIORITY_INDEX = 5;

function doGet(e) {
  if (e.parameter.token !== TOKEN) return reply({ error: "token" });
  const tz = timezone();
  const today = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");
  const values = getSheet().getDataRange().getValues();
  return reply({ today, items: collectItems(values, today, tz) });
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  if (body.token !== TOKEN) return reply({ error: "token" });
  const { row, stage, questions, hits } = body;
  const valid =
    Number.isInteger(row) && row > 1 &&
    Number.isInteger(stage) && stage >= 0 && stage < STAGES &&
    Number.isInteger(questions) && questions > 0 &&
    Number.isInteger(hits) && hits >= 0 && hits <= questions;
  if (!valid) return reply({ error: "invalid" });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet();
    const dateColumn = FIRST_STAGE_INDEX + stage * STAGE_WIDTH + 1;
    if (!sheet.getRange(row, dateColumn).getValue()) return reply({ error: "invalid" });
    sheet.getRange(row, dateColumn + 1, 1, 2).setValues([[questions, hits]]);
    SpreadsheetApp.flush();
    const next = stage + 1 < STAGES ? sheet.getRange(row, dateColumn + STAGE_WIDTH).getValue() : "";
    return reply({ ok: true, next: dayKey(next, timezone()) });
  } finally {
    lock.releaseLock();
  }
}

function collectItems(values, today, tz) {
  const headerIndex = values.findIndex(row => row[NAME_INDEX] === "Assunto");
  const items = [];
  for (let r = headerIndex + 1; r < values.length; r++) {
    const row = values[r];
    if (!row[NAME_INDEX] || !row[AREA_INDEX]) continue;
    const base = {
      row: r + 1,
      subject: String(row[NAME_INDEX]).trim(),
      area: String(row[AREA_INDEX]),
      incidence: Number(row[INCIDENCE_INDEX]) || 0,
      priority: Number(row[PRIORITY_INDEX]) || 0
    };
    let pendingSeen = false;
    for (let stage = 0; stage < STAGES; stage++) {
      const cells = stageCells(row, stage);
      const date = dayKey(cells.date, tz);
      if (!date) continue;
      const answered = !isBlank(cells.questions);
      if (answered && date === today) {
        items.push({ ...base, stage, date, kind: "today", state: "done", questions: Number(cells.questions), hits: Number(cells.hits) || 0 });
      }
      if (!answered && !pendingSeen) {
        pendingSeen = true;
        if (date <= today) items.push({ ...base, stage, date, kind: date === today ? "today" : "late", state: "pending" });
      }
    }
  }
  return items;
}

function stageCells(row, stage) {
  const start = FIRST_STAGE_INDEX + stage * STAGE_WIDTH;
  return { date: row[start], questions: row[start + 1], hits: row[start + 2] };
}

function dayKey(value, tz) {
  if (value instanceof Date) return Utilities.formatDate(value, tz, "yyyy-MM-dd");
  if (typeof value === "number") return new Date((Math.floor(value) - 25569) * 86400000).toISOString().slice(0, 10);
  return "";
}

function isBlank(value) {
  return value === "" || value === null || value === undefined;
}

function timezone() {
  return SpreadsheetApp.getActive().getSpreadsheetTimeZone();
}

function getSheet() {
  return SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
}

function reply(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
