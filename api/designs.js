import {
  isAuthed, storageReady, body, readJson, writeJson, removeBlob,
  readIndex, writeIndex, PREFIX
} from "./_lib.js";

const idOk = id => /^[a-z0-9-]{4,40}$/.test(String(id || ""));
const newId = () =>
  "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export default async function handler(req, res){
  if (!storageReady()){
    return res.status(503).json({
      ok: false,
      error: "Blob storage is not connected. Create a Blob store in the Vercel dashboard and redeploy."
    });
  }

  try {
    if (req.method === "GET"){
      const id = req.query.id;
      if (!id) return res.status(200).json({ ok: true, designs: await readIndex() });
      if (!idOk(id)) return res.status(400).json({ ok: false, error: "Bad id" });
      const design = await readJson(PREFIX + id + ".json");
      if (!design) return res.status(404).json({ ok: false, error: "No design with that id" });
      return res.status(200).json({ ok: true, design });
    }

    if (req.method === "POST" || req.method === "PUT"){
      if (!isAuthed(req)) return res.status(401).json({ ok: false, error: "Unlock with the password first" });
      const { id, name, data } = await body(req);
      if (!data || typeof data !== "object")
        return res.status(400).json({ ok: false, error: "Nothing to save" });

      const useId = idOk(id) ? id : newId();
      const title = String(name || data.title || "Untitled layout").slice(0, 80);
      const updated = new Date().toISOString();
      const record = { id: useId, name: title, updated, data };

      await writeJson(PREFIX + useId + ".json", record);

      const rows = (await readIndex()).filter(r => r.id !== useId);
      rows.push({
        id: useId, name: title, updated,
        stalls: Array.isArray(data.stalls) ? data.stalls.length : 0,
        areas: Array.isArray(data.areas) ? data.areas.length : 0
      });
      await writeIndex(rows);

      return res.status(200).json({ ok: true, id: useId, name: title, updated });
    }

    if (req.method === "DELETE"){
      if (!isAuthed(req)) return res.status(401).json({ ok: false, error: "Unlock with the password first" });
      const id = req.query.id;
      if (!idOk(id)) return res.status(400).json({ ok: false, error: "Bad id" });
      await removeBlob(PREFIX + id + ".json");
      await writeIndex((await readIndex()).filter(r => r.id !== id));
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (err){
    return res.status(500).json({ ok: false, error: "Storage error: " + (err && err.message || "unknown") });
  }
}
