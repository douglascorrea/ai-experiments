# ai-experiments 📈

Dashboard for tracking AI inference experiments — prefill / decode tok/s, prompt size, batch, hardware. One row per run, every run is a commit.

**Live in the repo:** open `index.html` (or serve it — see below) to get the full UI: KPIs, stacked **prefill + decode tok/s per model** chart, filterable run table, and an "Add run" form with one-click JSON export.

## Quick start

```sh
# clone
git clone git@github.com:douglascorrea/ai-experiments.git ~/Sites/ai-experiments
cd ~/Sites/ai-experiments

# view — serves the whole tree, site lives at /ai-experiments
python3 -m http.server 8000        # -> http://localhost:8000/ai-experiments
```

## Adding a run

**Option A — from the dashboard (no build needed):**

1. Click **+ Add run**, fill in the fields.
2. Click **Export JSON** → you get `experiments.json`.
3. Replace the array in `data/data.js` with that JSON (or merge by hand) and commit.

**Option B — edit directly:**

Edit `data/data.js` and push:

```sh
git add . && git commit -m "exp: <model> prefill 11.8k tok/s @ 4090" && gh repo push
```

## Data schema

One object per run in `data/data.js`:

| field | type | required | notes |
|---|---|---|---|
| `id` | string | yes | unique slug, e.g. `2026-10-22-llama31-8b-r4090-vllm` |
| `date` | string | yes | ISO date `YYYY-MM-DD` |
| `model` | string | yes | model / endpoint name |
| `provider` | string | yes | `local`, `cloud-api`, anything |
| `hardware` | string | no | GPU, machine, or endpoint (e.g. `RTX 4090`) |
| `prefill_tps` | number | no | tokens/sec on the prompt prefill |
| `decode_tps` | number | no | tokens/sec on generation |
| `prompt_tokens` | number | no | prompt length in tokens |
| `batch` | number | no | concurrency |
| `notes` | string | no | freeform: software, flags, quirks |

## The stack

| layer | what |
|---|---|
| Versioning / hosting | **GitHub** repo + **gh** CLI (`git commit` + `gh repo push`) |
| Data | single `data/data.js` — plain JS object, zero schema tooling |
| UI | static **HTML / CSS / vanilla JS** — no framework, no build step, no deps |
| Chart | hand-rolled SVG stacked bars (prefill + decode per model, best observed) |
| Serving | `python3 -m http.server` (local LAN / `~/Sites`) or GitHub Pages |

## Repo layout

```
ai-experiments/
├── index.html          # the dashboard
├── css/style.css       # theme (dark, gradient accents)
├── js/app.js           # rendering: KPIs, SVG chart, table, add-run, export
├── data/data.js        # the experiment data (source of truth)
└── README.md
```

## Ideas to grow it

- `prefill_tokens / prefill_tps` → prefill latency per prompt size
- decode `TTFT` / `it/s` at fixed batch
- CSV export / import for pasting benchmark output (vLLM, llama.cpp, `llm-perf`)
- GitHub Actions → GitHub Pages (just add `.github/workflows/deploy.yml`)
