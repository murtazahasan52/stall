import { isAuthed, body } from "./_lib.js";
import { backend, listDesigns, getDesign, saveDesign, removeDesign } from "./_store.js";

const idOk = id => /^[a-z0-9-]{4,40}$/.test(String(id || ""));
const newId = () => "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export default async function handler(req, res){
  if (!backend()){
    return res.status(503).json({
      ok: false,
      error: "No database is connected to this project. In Vercel open Storage, create a Neon Postgres database, then redeploy."
    });
  }

  try {
    if (req.method === "GET"){
      const id = req.query.id;
      if (!id) return res.status(200).json({ ok: true, designs: await listDesigns() });
      if (!idOk(id)) return res.status(400).json({ ok: false, error: "Bad id" });
      const design = await getDesign(id);
      if (!design) return res.status(404).json({ ok: false, error: "No design with that id" });
      return res.status(200).json({ ok: true, design });
    }

    if (req.method === "POST" || req.method === "PUT"){
      if (!isAuthed(req)) return res.status(401).json({ ok: false, error: "Unlock with the password first" });
      const { id, name, data } = await body(req);
      if (!data || typeof data !== "object")
        return res.status(400).json({ ok: false, error: "Nothing to save" });

      const saved = await saveDesign({
        id: idOk(id) ? id : newId(),
        name: String(name || data.title || "Untitled layout").slice(0, 80),
        data
      });
      return res.status(200).json({ ok: true, ...saved });
    }

    if (req.method === "DELETE"){
      if (!isAuthed(req)) return res.status(401).json({ ok: false, error: "Unlock with the password first" });
      const id = req.query.id;
      if (!idOk(id)) return res.status(400).json({ ok: false, error: "Bad id" });
      await removeDesign(id);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  } catch (err){
    return res.status(500).json({ ok: false, error: "Storage error: " + ((err && err.message) || "unknown") });
  }
}
