---
name: update-portfolio-from-resume
description: Update data.json (and refresh the portfolio site) from a Resume PDF. Use when the user provides a resume PDF and asks to sync, update, refresh, or import their resume into the portfolio. Rewrites resume[], meta.name/designation, about.content, and interactively reconciles projects[] against the PDF.
---

# update-portfolio-from-resume

Takes a Resume PDF and rewrites the content fields of `data.json` so the portfolio at `index.html` reflects the new resume. No separate driver script — Claude Code's `Read` tool ingests PDFs natively, and the executable harness pieces (copy PDF, validate JSON, launch local server) are short PowerShell snippets inline below.

All paths in this file are **relative to the repo root** (`D:\Productivity\Projects\Portfolio\` on this machine).

## Prerequisites

- Python 3 on PATH (used for `http.server` and `json.tool`). Verified: `python --version` → `Python 3.13.13`.
- The repo at the working directory. Nothing else: no `npm install`, no Sass recompile (`css/style.css` is committed and the skill never touches Sass).

## Inputs

- **Optional argument:** absolute or repo-relative path to a Resume PDF.
- **Default:** if no argument is given, parse `Resume.pdf` at the repo root in place.
- If an argument is given, it is first copied over `Resume.pdf` at the repo root (this preserves the Resume card's download link, which is hardcoded to `meta.resumePdf = "Resume.pdf"`).

## Workflow

### 1. Locate / stage the PDF

If the user passed a path:
```powershell
Copy-Item -Path "<USER_PROVIDED_PATH>" -Destination "Resume.pdf" -Force
```
If no path was given and `Resume.pdf` already exists, use it in place. If neither — abort with: `"No PDF found. Pass a path or place one at Resume.pdf."`

### 2. Read inputs

Use the `Read` tool on **both** files. Claude Code parses PDFs natively — no `pdftotext` needed.
- `Read("Resume.pdf")` → text + visual rendering of every page.
- `Read("data.json")` → current schema + the source-of-truth icon map for step 3.

### 3. Build the Skills-icon preservation map

Before producing any new JSON, scan the current `data.json` for the `Skills` section (the one with `heading: "Skills"`) and walk `list[].ul[]`. For every entry that is a string containing `<i class="...">...</i>` HTML, capture a mapping:

```
strip_html_and_lowercase(text)  →  the trailing icon HTML fragment (with its leading space)
```

Example from the current `data.json`:
```
"html"          → " <i class=\"fab fa-html5\"></i> "
"css"           → " <i class=\"fab fa-css3-alt\"></i> and <i class=\"fab fa-sass\"></i> "
"bootstrap"     → " <i class=\"fab fa-bootstrap\"></i>"
"javascript and jquery" → " <i class=\"fab fa-js-square\"></i>"
```

When emitting the new Skills section in step 4, look each new skill name up (case-insensitive). If matched → append the saved icon fragment. If unmatched → emit the plain string.

**Why this matters:** `js/script.js:157` writes Skills strings via `innerHTML` (not `escapeHtml`). The icon HTML works because of this. The same path would also execute any HTML you put there — so the *only* HTML that ever ends up in Skills strings is the preserved-icon fragments from this map. Plain text only otherwise. See the Gotchas section.

### 4. Map PDF → schema, in memory

Build the new `data` object as a deep clone of the current one with these fields rewritten:

- **`meta.name`** — the name line from the PDF header (e.g. `"Subikesh P S"`). Only one whitespace-separated value per word; no line breaks. `renderMeta` (`js/script.js:39-44`) splits on whitespace and wraps everything after the first token in a `non-overflow` span.
- **`meta.designation`** — the current role/title (e.g. `"Software Engineer 2 - Android"`). One line.
- **`about.content`** — array of paragraph strings. If the PDF has an explicit Summary/Objective section, use that. If not, write 1–2 paragraphs synthesized from the current role + key skill areas + a sentence about interests (preserve the user's voice — read the existing `about.content` for tone). Confirm with the user before rewriting if no explicit summary exists in the PDF.
- **`resume[]`** — fully rebuilt array. See **Schema reference** below for the three supported section shapes. Order: typically `Languages` (if applicable), `Experience`, `Skills`, plus `Education` as a flat-list section if the PDF has one.

### 5. Reconcile `projects[]` interactively

`projects[]` is NEVER rewritten silently. For every project mentioned in the PDF's Projects section:

- **Fuzzy-match** its title against existing `projects[].title` (case-insensitive, ignore punctuation).
- **No match** → call `AskUserQuestion`:
  > "Add new project '<TITLE>' from the resume to projects[]?" with options "Yes, add it", "No, skip".
  > If yes, collect `title`, `description`, `points` (bullet list from PDF), `tags` (optional; ask user), and `buttons[].url` for source code (ask user — usually github.com/<user>/<repo>).
- **Match found, but PDF description/bullets differ from existing** → `AskUserQuestion`:
  > "Project '<TITLE>' exists but the resume has different details. Update it?" with options "Update with resume content", "Keep existing", "Show me the diff first".
- **Match identical** → leave as-is.

Never delete projects that aren't in the PDF — resumes typically only list a subset.

### 6. Write `data.json`

Single `Write` call. Match the existing 2-space indent. Preserve the field order at the top level: `meta`, `about`, `projects`, `resume`.

### 7. Validate

```powershell
python -m json.tool data.json > $null
if (-not $?) { Write-Error "data.json is invalid JSON" }
```

### 8. Launch local server + browser

```powershell
$proc = Start-Process -PassThru -WindowStyle Hidden -FilePath python `
  -ArgumentList '-m','http.server','8000' `
  -WorkingDirectory (Resolve-Path '.').Path
Start-Process 'http://localhost:8000/'
"Server PID: $($proc.Id)  -- stop with: Stop-Process -Id $($proc.Id)"
```

Tell the user: "Click the **Resume** card to verify the rendered output. The **Download** button must still point at `/Resume.pdf` — if it 404s, the PDF copy in step 1 failed." Also tell them the PID so they can stop the server.

## Schema reference

`resume[]` is an array of section objects. There are **three supported shapes** — pick the right one per section based on what the renderer expects (`js/script.js:111-186`):

### A. Flat list section — used for Languages, Education, Certifications

```json
{ "heading": "Languages", "ul": ["Kotlin", "Java", "Python"] }
```

Renderer: `<h3>Languages</h3><hr><ul><li>Kotlin</li>...</ul>`. Strings are HTML-escaped.

### B. Experience section — Work Experience, Internships

```json
{
  "heading": "Experience",
  "list": [
    {
      "heading": "Software Engineer 2 - Android, Intuit Inc",
      "period": "March 2025 - Present",
      "content": "Optional short intro paragraph.",
      "ol": [
        {
          "title": "Virtual Expert Platform",
          "ul": [
            "Improved user experience for TurboTax and QuickBooks customers...",
            "Collaborated with the team under a tight deadline..."
          ]
        }
      ],
      "ul": ["Optional flat bullets that aren't grouped under a sub-project"]
    }
  ]
}
```

Renderer: each `list` entry becomes `<b>{heading}</b><br><span class="small">{period}</span><p>{content}</p>` followed by an `<ol>` of `{title}` headings each with a nested `<ul>`. All strings HTML-escaped.

### C. Skills section — **special-cased**

```json
{
  "heading": "Skills",
  "list": [
    {
      "heading": "Android Development",
      "ul": [
        "Kotlin Multiplatform (KMP)",
        "Kotlin Coroutines and Flows",
        { "title": "Android Jetpack components", "ul": ["Room DB", "Navigation"] },
        { "title": "Git version control" }
      ]
    },
    {
      "heading": "Web Development",
      "ul": [
        "HTML <i class=\"fab fa-html5\"></i>",
        "Bootstrap <i class=\"fab fa-bootstrap\"></i>"
      ]
    }
  ]
}
```

Renderer (`js/script.js:151-169`): each `list` entry becomes `<h4>{heading}</h4><ul>...</ul>`. Strings in `ul` go through **`innerHTML`** (not escaped) so the inline `<i>` icon tags render. Objects with `{title, ul}` become a nested sub-list; objects with just `{title}` become a single `<li>`.

**The Skills section MUST use shape C — not shape A.** A flat `{heading: "Skills", ul: [...]}` won't get the special h4/innerHTML treatment.

## Project reconciliation prompt shapes

Use `AskUserQuestion` with these exact shapes:

**New project:**
```
question: "Add new project '<TITLE>' from the resume?"
options:
  - "Yes, add it"           → collect title/description/points/tags/github
  - "Skip"                   → don't touch projects[]
```

**Existing project, differing content:**
```
question: "Project '<TITLE>' already exists but the PDF has updated content. What to do?"
options:
  - "Update with resume content"
  - "Keep existing"
  - "Show diff first"        → after showing, re-ask
```

## Verification (what success looks like)

After step 8 the browser opens at `http://localhost:8000/`:
- Page loads (no JS console errors about `data.json` parse failures).
- **Resume card** click reveals: updated experience entries with the new periods, new skill groups with icons preserved where names matched, new Education section if applicable.
- **About card** shows the rewritten paragraphs.
- **Download button** in the Resume card opens `/Resume.pdf` and is the file the user just imported.
- **Projects card** is unchanged unless the user approved a reconciliation.

## Gotchas

- **`Skills.list[].ul[]` strings go through `innerHTML`** (`js/script.js:157`). The only HTML allowed here is the FontAwesome `<i>` fragments from the icon-preservation map (step 3). Never include PDF-extracted text containing raw `<`/`>` — the renderer will execute it.
- **The site only works under `http://`, never `file://`.** `js/script.js:10` fetches `data.json` via XHR; `file://` triggers CORS and the page renders empty. Always launch via `python -m http.server`.
- **`meta.name` whitespace matters** — `renderMeta` (`js/script.js:39-44`) splits on whitespace; first token renders plain, rest wraps in a `non-overflow` span. No newlines, no double-spaces.
- **Don't rename top-level `data.json` keys** — `CARDS = ["about", "project", "resume", "contact"]` (`js/script.js:3`) and the `[data-render="..."]` attributes in `index.html` are hardcoded to `meta`, `about`, `projects`, `resume-left`, `resume-right`.
- **`Skills` section is split left/right** — `renderResume` (`js/script.js:119-125`) routes only `heading === "Skills"` to the right column; everything else goes left. If you name the section `"Technical Skills"` it'll render on the wrong side.
- **`package-lock.json` is inert** (no `package.json`). Don't `npm install` anything.
- **PDF copy precedes JSON write** — if step 1's `Copy-Item` fails, abort *before* step 6 so `data.json`'s implicit reference to `Resume.pdf` stays valid.
- **Sass is out of scope** — `css/style.css` is committed; the skill never touches `css/style.sass`.

## Troubleshooting

- **`data.json` is invalid JSON** (step 7 fails) → re-read the file, look for a trailing comma or an unescaped `"` in a string copied from the PDF. The PDF text often contains smart quotes (`’` instead of `'`) — these are valid JSON but check that you didn't paste a curly double-quote into a string boundary.
- **`Address already in use` / port 8000 busy** (step 8) → easiest: change the port (`-ArgumentList '-m','http.server','8001'` and `Start-Process 'http://localhost:8001/'`). If you must reclaim 8000, run `Get-NetTCPConnection -LocalPort 8000 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }`. This works but **prints harmless "Access is denied" errors for PIDs 0 (Idle) and 4 (System)** — Windows lists them as port owners and they can't (and don't need to) be killed; the actual python process gets killed anyway. Always prefer killing by the PID you saved from `Start-Process -PassThru` in step 8 — it's clean.
- **Browser opens but page is blank / preloader never fades** → open devtools, check the console. If "Failed to load portfolio data" → you opened via `file://` (see Gotchas). If JSON parse error → step 7 should have caught it; re-run validation.
- **Resume card's Download button 404s** → step 1's PDF copy didn't land. Re-check the source path; `Resume.pdf` must exist at the repo root.
- **Skills icons disappeared after update** → the icon-preservation map (step 3) was built *after* the rewrite, or the lowercased keys didn't match. Re-read the previous `data.json` from git (`git show HEAD:data.json`), rebuild the map from there, and re-emit.
