import { samePassword, makeToken, setSession, isAuthed, body } from "./_lib.js";
import { health } from "./_store.js";

export default async function handler(req, res){
  if (req.method === "GET"){
    const store = await health();
    return res.status(200).json({
      ok: true, authed: isAuthed(req),
      storage: store.ok, backend: store.backend || null, storageError: store.error || null
    });
  }

  if (req.method === "POST"){
    const { password } = await body(req);
    if (!samePassword(password)){
      await new Promise(r => setTimeout(r, 600));
      return res.status(401).json({ ok: false, error: "Wrong password" });
    }
    setSession(res, makeToken(30), 30 * 86400);
    const store = await health();
    return res.status(200).json({
      ok: true, authed: true,
      storage: store.ok, backend: store.backend || null, storageError: store.error || null
    });
  }

  if (req.method === "DELETE"){
    setSession(res, "", 0);
    return res.status(200).json({ ok: true, authed: false });
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
