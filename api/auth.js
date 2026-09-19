import { samePassword, makeToken, setSession, isAuthed, storageReady, body, COOKIE } from "./_lib.js";

export default async function handler(req, res){
  if (req.method === "GET"){
    return res.status(200).json({ ok: true, authed: isAuthed(req), storage: storageReady() });
  }

  if (req.method === "POST"){
    const { password } = await body(req);
    if (!samePassword(password)){
      // slow down guessing a little
      await new Promise(r => setTimeout(r, 600));
      return res.status(401).json({ ok: false, error: "Wrong password" });
    }
    setSession(res, makeToken(30), 30 * 86400);
    return res.status(200).json({ ok: true, authed: true, storage: storageReady() });
  }

  if (req.method === "DELETE"){
    setSession(res, "", 0);
    return res.status(200).json({ ok: true, authed: false });
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
