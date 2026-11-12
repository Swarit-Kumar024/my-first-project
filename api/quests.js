const { config, notion, send, errorResponse, propValue } = require("./_notion");
const XP = { Easy: 10, Medium: 25, Hard: 50, Boss: 100 };
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
function mapQuest(page) {
  const p = page.properties || {};
  return { id: page.id, title: propValue(p.Quest), difficulty: propValue(p.Difficulty) || "Medium",
    type: propValue(p["Quest Type"]) || "Daily", date: propValue(p.Date),
    done: !!propValue(p.Completed), xp: propValue(p["Earned XP"]) ?? (propValue(p.Completed) ? XP[propValue(p.Difficulty)] : 0),
    xpValue: propValue(p["XP Value"]) ?? XP[propValue(p.Difficulty)] ?? 25 };
}
module.exports = async function handler(req, res) {
  try {
    const c = config();
    if (req.method === "GET") {
      const data = await notion("/data_sources/" + c.quests + "/query", { method: "POST", body: JSON.stringify({ page_size: 100, sorts: [{ property: "Date", direction: "descending" }] }) });
      const date = today();
      const results = (data.results || []).map(mapQuest).filter(q => !q.date || q.date.slice(0,10) === date);
      return send(res, 200, { quests: results, date });
    }
    if (req.method === "POST") {
      const { title, difficulty = "Medium", type = "Daily", attribute = "Intelligence", shadowId = null } = req.body || {};
      if (typeof title !== "string" || !title.trim()) return send(res, 400, { error: "Quest title is required." });
      if (!XP[difficulty]) return send(res, 400, { error: "Invalid difficulty." });
      if (!["Daily", "Dungeon", "Boss"].includes(type)) return send(res, 400, { error: "Invalid quest type." });
      if (!["Intelligence", "Wealth", "Vitality", "Charisma", "Serenity"].includes(attribute)) return send(res, 400, { error: "Invalid attribute." });
      const properties = {
        "Quest": { title: [{ text: { content: title.trim().slice(0, 200) } }] },
        "Difficulty": { select: { name: difficulty } },
        "Quest Type": { select: { name: type } },
        "Attribute": { select: { name: attribute } },
        "XP Value": { number: XP[difficulty] },
        "Completed": { checkbox: false },
        "Date": { date: { start: today() } },
        "Related to PLAYER PROFILE — SYSTEM CORE (Quests)": { relation: [{ id: c.profile }] }
      };
      if (shadowId) properties.Shadow = { relation: [{ id: shadowId }] };
      const page = await notion("/pages", { method: "POST", body: JSON.stringify({ parent: { type: "data_source_id", data_source_id: c.quests }, properties }) });
      return send(res, 201, { quest: mapQuest(page) });
    }
    if (req.method === "PATCH") {
      const { id, completed } = req.body || {};
      if (!id || typeof completed !== "boolean") return send(res, 400, { error: "Quest id and completed boolean are required." });
      const current = await notion("/pages/" + encodeURIComponent(id));
      if (completed && current.properties?.Completed?.checkbox) return send(res, 200, { quest: mapQuest(current), unchanged: true });
      const updated = await notion("/pages/" + encodeURIComponent(id), { method: "PATCH", body: JSON.stringify({ properties: { Completed: { checkbox: completed } } }) });
      return send(res, 200, { quest: mapQuest(updated) });
    }
    res.setHeader("Allow", "GET, POST, PATCH");
    return send(res, 405, { error: "Method not allowed." });
  } catch (error) { return errorResponse(res, error); }
};