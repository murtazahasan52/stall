// Shared helpers for the design API. Files starting with _ are not routed.
import crypto from "node:crypto";
import { put, list, del } from "@vercel/blob";

export const PASSWORD = process.env.DESIGN_PASSWORD || "roar5253";
const SECRET = process.env.SESSION_SECRET || "roar-layout-" + PASSWORD;
export const COOKIE = "roar_session";
export const PREFIX = "designs/";
export const INDEX = PREFIX + "_index.json";

export function storageReady(){ return !!process.env.BLOB_READ_WRITE_TOKEN; }

/* ---------- session ---------- */
function sign(value){
  return crypto.createHmac("sha256", SECRET).update(String(value)).digest("hex").slice(0, 32);
}
export function makeToken(days = 30){
  const exp = Date.now() + days * 86400000;
  return exp + "." + sign(exp);
}
export function validToken(token){
  try {
    const [exp, sig] = String(token || "").split(".");
    if (!exp || !sig || Number(exp) < Date.now()) return false;
    const good = sign(exp);
    if (sig.length !== good.length) return false;
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good));
  } catch { return false; }
}
export function samePassword(input){
  const a = Buffer.from(String(input || ""));
  const b = Buffer.from(PASSWORD);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
export function readCookie(req, name){
  const raw = req.headers.cookie || "";
  for (const part of raw.split(";")){
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return "";
}
export function isAuthed(req){ return validToken(readCookie(req, COOKIE)); }
export function setSession(res, token, maxAge){
  const bits = [
    COOKIE + "=" + encodeURIComponent(token),
    "Path=/", "HttpOnly", "SameSite=Lax",
    "Max-Age=" + maxAge
  ];
  if (process.env.VERCEL) bits.push("Secure");
  res.setHeader("Set-Cookie", bits.join("; "));
}

/* ---------- blob storage ---------- */
export async function readJson(pathname){
  const { blobs } = await list({ prefix: pathname, limit: 1 });
  const hit = blobs.find(b => b.pathname === pathname);
  if (!hit) return null;
  const r = await fetch(hit.url + "?ts=" + Date.now(), { cache: "no-store" });
  if (!r.ok) return null;
  return r.json();
}
export async function writeJson(pathname, value){
  await put(pathname, JSON.stringify(value), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0
  });
}
export async function removeBlob(pathname){
  const { blobs } = await list({ prefix: pathname, limit: 1 });
  const hit = blobs.find(b => b.pathname === pathname);
  if (hit) await del(hit.url);
}
export async function readIndex(){
  const idx = await readJson(INDEX);
  return Array.isArray(idx) ? idx : [];
}
export async function writeIndex(rows){
  rows.sort((a, b) => String(b.updated).localeCompare(String(a.updated)));
  await writeJson(INDEX, rows);
}
export async function body(req){
  if (req.body && typeof req.body === "object") return req.body;
  let raw = "";
  for await (const chunk of req) raw += chunk;
  try { return JSON.parse(raw || "{}"); } catch { return {}; }
}
