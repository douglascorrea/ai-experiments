// ============================================================================
// EXPERIMENTS DATA — single source of truth for the dashboard
// ============================================================================
// One object per experiment run. Keep it in this order; unknown extra keys
// are fine and show up in the "Notes" search.
//
// Schema:
//   id            string   unique slug, e.g. "2026-10-22-llama31-8b-r4090"
//   date          string   ISO date "YYYY-MM-DD"
//   model         string   model / endpoint name
//   provider      string   "local" | "cloud-api" | anything
//   hardware      string   GPU, machine, or endpoint (e.g. "RTX 4090")
//   prefill_tps   number   tokens/sec during prompt prefill
//   decode_tps    number   tokens/sec during generation (optional)
//   prompt_tokens number   prompt length in tokens (optional)
//   batch         number   concurrency (optional)
//   notes         string   freeform notes (optional)
//
// Edit this file and `git commit && gh repo push` — or use the
// "+ Add run" button on the dashboard, then "Export JSON" to regenerate.
// ============================================================================

window.EXPERIMENTS = [
  {
    id: "2026-10-22-llama31-8b-r4090-vllm",
    date: "2026-10-22",
    model: "Llama-3.1-8B-Instruct",
    provider: "local",
    hardware: "RTX 4090",
    prefill_tps: 11800,
    decode_tps: 1950,
    prompt_tokens: 4096,
    batch: 1,
    notes: "baseline, vLLM 0.6, FP16"
  },
  {
    id: "2026-10-22-llama31-8b-r4090-batch8",
    date: "2026-10-22",
    model: "Llama-3.1-8B-Instruct",
    provider: "local",
    hardware: "RTX 4090",
    prefill_tps: 4800,
    decode_tps: 1420,
    prompt_tokens: 4096,
    batch: 8,
    notes: "8x8k batch — prefill collapses, decode holds"
  },
  {
    id: "2026-10-23-mistral-7b-r4090-tg",
    date: "2026-10-23",
    model: "Mistral-7B-Instruct-v0.3",
    provider: "local",
    hardware: "RTX 4090",
    prefill_tps: 16500,
    decode_tps: 2450,
    prompt_tokens: 2048,
    batch: 1,
    notes: "GGUF Q4_K_M, llama.cpp — small batch wins on prefill"
  },
  {
    id: "2026-10-24-deepseek-coder-14b-api",
    date: "2026-10-24",
    model: "deepseek-ai/DeepSeek-Coder-14B",
    provider: "cloud-api",
    hardware: "cloud",
    prefill_tps: 5100,
    decode_tps: 1210,
    prompt_tokens: 8192,
    notes: "measured end-to-end; API hides split"
  },
  {
    id: "2026-10-25-llama31-8b-a100-vllm",
    date: "2026-10-25",
    model: "Llama-3.1-8B-Instruct",
    provider: "cloud-api",
    hardware: "A100-80GB",
    prefill_tps: 9400,
    decode_tps: 2600,
    prompt_tokens: 8192,
    batch: 2,
    notes: "8k prompt, 2 batch — A100 memory headroom shows"
  }
];
