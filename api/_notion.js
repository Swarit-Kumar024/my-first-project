const API = "https://api.notion.com/v1";
const VERSION = "2025-09-03";
function config() {
  const token = process.env.NOTION_TOKEN;
  const quests = process.env.NOTION_QUESTS_DATA_SOURCE_ID || "769316a2-5dc2-4eb0-9a4e-9c7c66aecdeb";
  const habits = process.env.NOTION_HABITS_DATA_SOURCE_ID || "a4045c8b-2b5a-4597-828d-ed9cb2b14591";
  const profile = process.env.NOTION_PROFILE_PAGE_ID || "41559d34-792d-81a1-be69-cd4fdafadd48";
  if (!token) throw new Error("NOTION_TOKEN is not configured in Vercel.");
  return { token, quests, habits, profile };
}
async function notion(path, options = {}) {
  const { token } = config();
  const response = await fetch(API + path, {
    ...options,
    headers: {
      Authorization: "Bearer " + token,
      "Notion-Version": VERSION,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.message || "Notion API request failed");
    error.status = response.status;
    error.code = body.code;
    throw error;
  }
  return body;
}
function send(res, status, data) {
  res.status(status).setHeader("Cache-Control", "no-store").json(data);
}
function errorResponse(res, error) {
  console.error("Player System API:", error);
  send(res, error.status || 500, { error: error.message || "Unexpected server error" });
}
function plainTitle(prop) {
  return (prop?.title || []).map(x => x.plain_text || x.text?.content || "").join("");
}
function propValue(p) {
  if (!p) return null;
  if (p.type === "title") return plainTitle(p);
  if (p.type === "rich_text") return (p.rich_text || []).map(x => x.plain_text || "").join("");
  if (p.type === "number") return p.number ?? 0;
  if (p.type === "checkbox") return !!p.checkbox;
  if (p.type === "select") return p.select?.name || null;
  if (p.type === "date") return p.date?.start || null;
  if (p.type === "formula") return p.formula?.number ?? p.formula?.string ?? p.formula?.boolean ?? null;
  if (p.type === "rollup") return p.rollup?.number ?? p.rollup?.array ?? null;
  return null;
}
module.exports = { config, notion, send, errorResponse, propValue, plainTitle };