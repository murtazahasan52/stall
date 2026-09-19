# Stall Layout Designer

A single-page tool for drawing an expo floor plan on a grid — stalls, areas,
pathways and barricades — and saving it as PNG, PDF or JSON.

## What you can draw

Pick a type in the left panel, then drag on the grid.

- **Stalls** — numbered and counted. Each new stall takes the next free number in
  its series (T1, T2, T3…). Types included: Regular (Y) 3 x 3, Ruby (L) 3 x 3,
  Premium (T) 6 x 6, Food stall (F) 3 x 3.
  A stall appears the instant you press the mouse down — no waiting for the
  release. Keep dragging from there and the row extends live, stall by stall,
  and pulling back removes the ones you passed.
  A type carries its own sizes, one row per sub type — Premium ships with a 6 x 4
  and an 8 x 3. When a type has more than one, its sizes appear as chips under
  the type; click one to draw with it. One click on the grid then drops that
  exact size, and dragging across an empty run fills it with a whole row of them.
  Each sub type can hold its own rate. Remove every size row to go back to
  dragging each stall by hand. Add or edit a type with the buttons under the
  list — name, what it is, prefix, colour, facing and sizes are all there.
- **Areas** — Food Court, Play Zone, Stage. Block out the whole area first, then
  switch to a stall type and draw stalls inside it. Stalls sit on top of an area;
  areas cannot overlap each other.
- **Pathways** — aisles and walkways, drawn as a hatched strip.
- **Barricades** — a striped line rather than a box. Drag sideways for a
  horizontal barricade, downward for a vertical one.

**Select & edit mode** — clicking the empty space around the board, pressing
Escape, or the "Select & edit" button at the top of the type list drops out of
drawing. The cursor goes back to a normal arrow and clicks only pick things up:
nothing new is created until you choose a type again.

Click anything to select it. Then:

- **Several at once** — shift-click adds items to the selection, shift-drag on
  empty grid draws a box around a block of them, Ctrl/Cmd+A takes everything.
  Then drag any one of them and the whole group moves together, refusing a drop
  where it would not fit. Type, facing, colour, layer, duplicate and delete all
  apply to the whole selection, and arrow keys nudge it.
- **Move** — drag any item to move it; it does not have to be selected first.
- **Colour** — every stall in a category carries that category's colour, so the
  map reads by type at a glance. Recolour a category in its type dialog and all
  of its stalls follow. "One colour per category" under Layout snaps everything
  back if single stalls were recoloured by hand. Adding a new type starts on a
  fresh bright colour rather than the same orange every time.
  Ticking "Give every new stall its own colour instead" switches to a different
  mode, where each new stall gets its own bright colour off the colour wheel.
- **Facing** — each stall shows which side it opens onto as a thick bar along
  that edge, with an arrow on the larger stalls. Change it in the panel
  (Up / Down / Left / Right) or press R to turn the selected stall. Doing either
  also sets the facing for the stalls you draw next, so set one stall in a row to
  Down and the whole rest of that run comes out Down until you change it again.
  The JSON export records it as `"facing": "up" | "down" | "left" | "right"`.
- **Selecting** — clicking a stall always selects it. Clicking an area or pathway
  selects it while that kind is the active type; with a stall type active the
  click places a stall inside the area instead.
- **Resize** — drag the square handles on its edges and corners. A barricade has
  a handle at each end to change its length.
- **Number** — a stall you just placed has its number selected, so typing
  replaces it straight away. Clicking an *existing* stall puts the caret at the
  end instead of selecting, so a stray keystroke can never wipe a number that is
  already set. The number is edited on the stall itself. Place a stall or click
  an existing one and the number is selected ready to overtype; what you type
  appears on the stall as you go. Enter keeps it, Escape puts the old one back.
  The panel field stays in sync either way, and the box never blocks dragging.
- **Size** — a dropdown in the panel switches the selected stall between its
  type's sub types. Position comes from dragging, not typed numbers.
- **Layer** — Back / – / + / Front control the stacking order, so you can put a
  stall above its area, drop a pathway behind everything, or lift a barricade
  over a zone. The current layer number is shown above the buttons.
- **Rename, retype, duplicate or delete** — all in the same panel. Arrow keys
  nudge the selection, Delete removes it.

Numbering happens once, when a stall is created: it takes the lowest free number
in its series. Deleting or adding never renumbers the stalls already on the board,
so a number you have given to an exhibitor stays put. Delete Y7 and the next
Regular stall you place becomes Y7.

**Renumber by layout** is a button under Layout: a one-off pass that renumbers
everything top to bottom, left to right when you do want the numbers to follow
the plan.

Typing your own number on a stall switches that off automatically, so the number
you typed stays. With it off, numbering just fills gaps: delete Y7 and the next
Regular stall takes Y7.

"Renumber by layout" renumbers every stall top to bottom, left to right within
each series — use it when the numbers should follow the plan rather than the
order you drew them in.

**Undo** (button, or Ctrl/Cmd+Z) steps back through the last 40 changes — placing,
deleting, renumbering, clearing, opening a file.

The Columns and Rows boxes never delete anything. Ask for fewer than the layout
needs and they stop at the smallest size that still holds every item, and say so.

Set "1 box =" to the real metre value and every item shows its true size.
Work is kept in the browser, so a refresh does not lose the layout.

## PNG and PDF output

Both exports crop to what you have actually drawn — the empty part of a 140 x 100
board is not included — and then scale the plan up to about 3600 px wide, so the
stalls fill the sheet instead of sitting tiny in a corner.

The printed version drops the working grid and draws every stall as a rounded
colour tile with a large bold number, the way a published floor plan looks.
Areas, pathways and barricades keep their own styling, and a legend underneath
lists each type with its count and rate.

The PDF page is shaped like the plan itself, long side 420 mm (A3), so a wide
layout fills a wide page rather than sitting in a band across A4.

## Saving designs on the server

The app keeps a working copy in the browser, and can also store named designs on
the server so they open from any machine.

- **Save design** in the header names the layout and stores it. That name is how
  it appears on any other computer — open the site there, unlock, and pick it
  from the list.
- After the first save, changes keep saving themselves a few seconds after you
  stop working, and once more if you close the tab. The header shows the state:
  saving…, saved 18:22, unsaved changes, or "on this computer only" when the
  server is not reachable. Turn it off with the checkbox in the panel if you
  prefer saving by hand.
- If you draw before naming anything, the first automatic save files it as
  "Draft 20 Sep 18:22" — rename it any time with Save design.
- **Designs** button in the header opens the panel.
- Reading the list and opening a design is open to anyone with the link.
- Creating, saving, renaming and deleting need the password.
- The password is checked on the server and the browser only ever holds a signed,
  http-only session cookie that lasts 30 days. "Lock" clears it.

### Set it up on Vercel (one time)

1. **Database** — open the project in Vercel, go to the **Storage** tab and
   create a **Neon Postgres** database (Create Database, pick Neon, Free plan is
   enough). Vercel injects `DATABASE_URL` into the project. The app creates its
   own `designs` table on first use — no migration to run.
   A Vercel **Blob** store works too; the app uses whichever it finds, Postgres
   first.
2. **Password** — under Settings, Environment Variables add:

   | Name | Value |
   |---|---|
   | `DESIGN_PASSWORD` | `roar5253` (or anything you prefer) |
   | `SESSION_SECRET` | any long random string |

   If `DESIGN_PASSWORD` is not set the app falls back to `roar5253`, which is in
   the source code — set the variable so the real password is not in the repo.
3. **Redeploy.** A deployment built before the database existed has none of
   these variables, which is what "no database is connected" means.

Until a database is connected the Designs panel says so and everything else
keeps working. Running the folder locally without `vercel dev` also works — the
panel just reports that the server is not available.

### Table

```sql
designs (
  id      text primary key,
  name    text not null,
  updated timestamptz not null default now(),
  stalls  integer, areas integer,
  data    jsonb          -- the same shape as the JSON export
)
```

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
api/_store.js    Neon Postgres storage (Vercel Blob as fallback)
api/_lib.js      password session helpers
package.json     dependencies
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
