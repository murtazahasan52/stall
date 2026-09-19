// Where designs live. Neon Postgres if the project has a database,
// Vercel Blob if it has a blob store instead.

const PG_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  "";

const HAS_BLOB = !!(
  process.env.BLOB_READ_WRITE_TOKEN ||
  (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN) ||
  process.env.BLOB_STORE_ID
);

export function backend(){
  if (PG_URL) return "postgres";
  if (HAS_BLOB) return "blob";
  return null;
}

/* ------------------------------------------------------------------ */
/* Postgres                                                            */
/* ------------------------------------------------------------------ */
let _sql = null;
async function sql(){
  if (!_sql){
    const { neon } = await import("@neondatabase/serverless");
    _sql = neon(PG_URL);
  }
  return _sql;
}
let ready = false;
async function ensureTable(){
  if (ready) return;
  const q = await sql();
  await q`
    create table if not exists designs (
      id      text primary key,
      name    text not null,
      updated timestamptz not null default now(),
      stalls  integer not null default 0,
      areas   integer not null default 0,
      data    jsonb not null
    )`;
  ready = true;
}

/* ------------------------------------------------------------------ */
/* Blob                                                                */
/* ------------------------------------------------------------------ */
const PREFIX = "designs/";
const INDEX = PREFIX + "_index.json";

async function blobApi(){ return import("@vercel/blob"); }

async function blobReadJson(pathname){
  const { list } = await blobApi();
  const { blobs } = await list({ prefix: pathname, limit: 1 });
  const hit = blobs.find(b => b.pathname === pathname);
  if (!hit) return null;
  const r = await fetch(hit.url + "?ts=" + Date.now(), { cache: "no-store" });
  return r.ok ? r.json() : null;
}
async function blobWriteJson(pathname, value){
  const { put } = await blobApi();
  await put(pathname, JSON.stringify(value), {
    access: "public", contentType: "application/json",
    addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 0
  });
}
async function blobIndex(){
  const idx = await blobReadJson(INDEX);
  return Array.isArray(idx) ? idx : [];
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */
export async function health(){
  const kind = backend();
  if (!kind){
    return { ok:false, error:"No database is connected to this project. In Vercel open Storage and create a Neon Postgres database (or a Blob store), then redeploy." };
  }
  try {
    if (kind === "postgres"){
      await ensureTable();
      const q = await sql();
      await q`select 1`;
    } else {
      const { list } = await blobApi();
      await list({ limit: 1 });
    }
    return { ok:true, backend: kind };
  } catch (err){
    return { ok:false, backend: kind,
             error: (kind === "postgres" ? "Postgres error: " : "Blob error: ") +
                    ((err && err.message) || "unknown") };
  }
}

export async function listDesigns(){
  if (backend() === "postgres"){
    await ensureTable();
    const q = await sql();
    const rows = await q`
      select id, name, updated, stalls, areas
      from designs order by updated desc limit 200`;
    return rows.map(r => ({
      id: r.id, name: r.name, stalls: r.stalls, areas: r.areas,
      updated: new Date(r.updated).toISOString()
    }));
  }
  return blobIndex();
}

export async function getDesign(id){
  if (backend() === "postgres"){
    await ensureTable();
    const q = await sql();
    const rows = await q`select id, name, updated, data from designs where id = ${id}`;
    if (!rows.length) return null;
    const r = rows[0];
    return { id: r.id, name: r.name, updated: new Date(r.updated).toISOString(), data: r.data };
  }
  return blobReadJson(PREFIX + id + ".json");
}

export async function saveDesign({ id, name, data }){
  const updated = new Date().toISOString();
  const stalls = Array.isArray(data.stalls) ? data.stalls.length : 0;
  const areas = Array.isArray(data.areas) ? data.areas.length : 0;

  if (backend() === "postgres"){
    await ensureTable();
    const q = await sql();
    await q`
      insert into designs (id, name, updated, stalls, areas, data)
      values (${id}, ${name}, ${updated}, ${stalls}, ${areas}, ${JSON.stringify(data)}::jsonb)
      on conflict (id) do update set
        name = excluded.name, updated = excluded.updated,
        stalls = excluded.stalls, areas = excluded.areas, data = excluded.data`;
    return { id, name, updated };
  }

  await blobWriteJson(PREFIX + id + ".json", { id, name, updated, data });
  const rows = (await blobIndex()).filter(r => r.id !== id);
  rows.push({ id, name, updated, stalls, areas });
  rows.sort((a, b) => String(b.updated).localeCompare(String(a.updated)));
  await blobWriteJson(INDEX, rows);
  return { id, name, updated };
}

export async function removeDesign(id){
  if (backend() === "postgres"){
    await ensureTable();
    const q = await sql();
    await q`delete from designs where id = ${id}`;
    return;
  }
  const { list, del } = await blobApi();
  const path = PREFIX + id + ".json";
  const { blobs } = await list({ prefix: path, limit: 1 });
  const hit = blobs.find(b => b.pathname === path);
  if (hit) await del(hit.url);
  await blobWriteJson(INDEX, (await blobIndex()).filter(r => r.id !== id));
}
