# Stall Layout Designer

A single-page tool for drawing an expo floor plan on a grid — stalls, areas,
pathways and barricades — and saving it as PNG, PDF or JSON.

## What you can draw

Pick a type in the left panel, then drag on the grid.

- **Stalls** — numbered and counted. Each new stall takes the next free number in
  its series (T1, T2, T3…). Types included: Regular (Y) 3 x 3, Ruby (L) 3 x 3,
  Premium (T) 6 x 6, Food stall (F) 3 x 3.
  A type can carry its own stall size. With Regular set to 3 x 3, one click drops
  a 3 x 3 stall, and dragging across an empty run fills it with a whole row or
  block of 3 x 3 stalls at once. Set the size to 0 x 0 in the type to go back to
  dragging each stall's size by hand. Add or edit a type with the buttons under
  the list — name, what it is, prefix, rate, colour and size are all there.
- **Areas** — Food Court, Play Zone, Stage. Block out the whole area first, then
  switch to a stall type and draw stalls inside it. Stalls sit on top of an area;
  areas cannot overlap each other.
- **Pathways** — aisles and walkways, drawn as a hatched strip.
- **Barricades** — a striped line rather than a box. Drag sideways for a
  horizontal barricade, downward for a vertical one.

Click anything to select it. Then:

- **Move** — drag the selected item anywhere it fits.
- **Selecting** — clicking a stall always selects it. Clicking an area or pathway
  selects it while that kind is the active type; with a stall type active the
  click places a stall inside the area instead.
- **Resize** — drag the square handles on its edges and corners. A barricade has
  a handle at each end to change its length.
- **Edit exactly** — X, Y, width and height boxes in the panel take typed values.
- **Layer** — Back / – / + / Front control the stacking order, so you can put a
  stall above its area, drop a pathway behind everything, or lift a barricade
  over a zone. The current layer number is shown above the buttons.
- **Rename, retype, duplicate or delete** — all in the same panel. Arrow keys
  nudge the selection, Delete removes it.

"Renumber stalls" renumbers every stall top to bottom, left to right within each series.

Set "1 box =" to the real metre value and every item shows its true size.
Work is kept in the browser, so a refresh does not lose the layout.

## Saving designs on the server

The app keeps a working copy in the browser, and can also store named designs on
the server so they open from any machine.

- **Designs** button in the header opens the panel.
- Reading the list and opening a design is open to anyone with the link.
- Creating, saving, renaming and deleting need the password.
- The password is checked on the server and the browser only ever holds a signed,
  http-only session cookie that lasts 30 days. "Lock" clears it.

### Set it up on Vercel (one time)

1. **Blob store** — in the Vercel dashboard open the project, go to Storage,
   create a Blob store and connect it to this project. Vercel adds
   `BLOB_READ_WRITE_TOKEN` for you.
2. **Password** — under Settings, Environment Variables add:

   | Name | Value |
   |---|---|
   | `DESIGN_PASSWORD` | `roar5253` (or anything you prefer) |
   | `SESSION_SECRET` | any long random string |

   If `DESIGN_PASSWORD` is not set the app falls back to `roar5253`, which is in
   the source code — set the variable so the real password is not in the repo.
3. Redeploy.

Until a Blob store is connected the Designs panel says so and everything else
keeps working. Running the folder locally without `vercel dev` also works — the
panel just reports that the server is not available.

### API

```
GET    /api/auth               status: { authed, storage }
POST   /api/auth               { password }  -> session cookie
DELETE /api/auth               lock

GET    /api/designs            list of saved designs
GET    /api/designs?id=<id>    one design with its full data
POST   /api/designs            { id?, name, data }   (password needed)
DELETE /api/designs?id=<id>    (password needed)
```

## Deploy on Vercel

Static site — no build step, no server.

**Drag and drop:** go to vercel.com/new and drop this folder on the upload area.

**CLI:**
```bash
npm i -g vercel
cd stall-layout-designer
vercel          # preview
vercel --prod   # production
```

**GitHub:** push the folder, import it on Vercel, framework preset "Other",
no build command, output directory `.`.

## Files

```
index.html       the whole app
api/auth.js      password unlock / lock
api/designs.js   list, open, save, delete designs
api/_lib.js      session + Blob storage helpers
package.json     one dependency, @vercel/blob
vercel.json      caching + clean URLs
README.md        this file
```

jsPDF is loaded from cdnjs for the PDF export; everything else is self-contained.

## JSON export shape

```json
{
  "title": "Business Expo — Nagpur",
  "grid": { "cols": 44, "rows": 30, "meters_per_box": 1 },
  "types": [{ "name": "Regular", "kind": "stall", "prefix": "Y", "color": "#E9A031", "rate": 53000, "count": 71 }],
  "stalls": [{ "stall": "Y1", "category": "Regular", "x": 4, "y": 2, "w": 3, "h": 3, "size_m": "3x3" }],
  "areas": [{ "name": "Food Court", "type": "Food Court", "x": 30, "y": 2, "w": 10, "h": 8 }],
  "paths": [{ "name": "Walkway", "x": 0, "y": 12, "w": 44, "h": 2 }],
  "barricades": [{ "orient": "h", "x": 4, "y": 12, "length": 20 }]
}
```

The same file loads back through "Open JSON", so a layout moves between machines,
and the stall list maps straight onto the website's stall data.
