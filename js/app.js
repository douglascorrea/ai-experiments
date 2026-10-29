// ai-experiments dashboard — vanilla JS, no dependencies
(() => {
  const $ = s => document.querySelector(s);
  const DATA = window.EXPERIMENTS;
  const TODAY = new Date().toISOString().slice(0, 10);
  const SVGNS = "http://www.w3.org/2000/svg";

  let query = "";

  const fmt = n => (n == null ? "—" : Math.round(n).toLocaleString("en-US"));
  const tps = n => (n == null ? "—" : fmt(n) + " tok/s");
  const trunc = (s, n) => (s == null ? "—" : String(s).length > n ? String(s).slice(0, n - 1) + "…" : String(s));
  const slug = s => String(s ?? "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
  const esc = s =>
    String(s ?? "").replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function rows() {
    const q = query.toLowerCase();
    return DATA
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      .filter(r => !q || Object.values(r).join(" ").toLowerCase().includes(q));
  }

  function kpis() {
    const r = rows();
    const p = r.map(x => x.prefill_tps).filter(v => v != null).sort((a, b) => b - a);
    const d = r.map(x => x.decode_tps).filter(v => v != null);
    return {
      count: r.length,
      bestPrefill: p[0] ?? null,
      avgDecode: d.length ? d.reduce((a, b) => a + b, 0) / d.length : null,
      last: r[0]?.date ?? null,
    };
  }

  function renderKpis() {
    const k = kpis();
    $("#kpi-count").textContent = k.count;
    $("#kpi-last").textContent = k.last ? k.last.slice(5) : "—";
    $("#kpi-best").textContent =
      k.bestPrefill != null ? `<span>${fmt(k.bestPrefill)}</span><small>tok/s</small>` : "—";
    $("#kpi-avg").textContent =
      k.avgDecode != null ? `<span>${fmt(Math.round(k.avgDecode))}</span><small>tok/s</small>` : "—";
  }

  function renderChart() {
    const svg = $("#chart");
    const w = Math.max(svg.parentElement.clientWidth - 44, 620);

    const byModel = {};
    for (const r of rows()) {
      const m = r.model || "unknown";
      if (!byModel[m]) byModel[m] = { model: m, prefill: 0, decode: 0 };
      if (r.prefill_tps != null) byModel[m].prefill = Math.max(byModel[m].prefill, r.prefill_tps);
      if (r.decode_tps != null) byModel[m].decode = Math.max(byModel[m].decode, r.decode_tps);
    }
    const list = Object.values(byModel)
      .map(o => ({ ...o, total: o.prefill + o.decode }))
      .sort((a, b) => b.total - a.total);

    const el = (tag, attrs, text) => {
      const e = document.createElementNS(SVGNS, tag);
      for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
      if (text != null) e.textContent = text;
      svg.appendChild(e);
      return e;
    };
    svg.innerHTML = "";

    if (!list.length) {
      el("text", { x: 0, y: 30, fill: "var(--muted)" }, "No experiments yet — add one to see the chart.");
      svg.setAttribute("height", "70");
      return;
    }

    const barH = 20, gap = 18, pad = 8, labelW = Math.min(340, Math.max(240, w * 0.4));
    const maxVal = list[0].total;
    const n = list.length;
    const h = pad * 2 + n * barH + (n - 1) * gap;
    const maxBarW = w - labelW - 120;
    const scale = maxVal > 0 ? maxBarW / maxVal : 1;

    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);

    list.forEach((o, i) => {
      const y = pad + i * (barH + gap);
      const x = labelW;
      const wp = (o.prefill / maxVal) * maxBarW;
      const wd = (o.decode / maxVal) * maxBarW;
      el("rect", { x, y, width: Math.max(wp, 2), height: barH, rx: 3, fill: "var(--prefill)" });
      el("rect", { x: x + wp, y, width: Math.max(wd, 2), height: barH, rx: 3, fill: "var(--decode)" });
      el("text", { x: 0, y: y + 13.5, fill: "var(--text)", "font-size": "14", "font-weight": "600" }, trunc(o.model, 34));
      el("text", { x: x - 6, y: y + 12.5, fill: "var(--dim)", "font-size": "12" }, "·");
      el("text", { x: x + wp + wd + 10, y: y + 12.5, fill: "var(--muted)", "font-size": "12.5" }, `${fmt(o.total)}`);
    });
  }

  function renderTable() {
    const tbody = $("#tbody");
    const r = rows();
    tbody.innerHTML = r.map(x => `
      <tr>
        <td class="dim">${esc(x.date)}</td>
        <td class="model">${esc(x.model)}</td>
        <td><span class="badge">${esc(x.provider || "—")}</span></td>
        <td class="dim">${esc(x.hardware || "—")}</td>
        <td class="num">${tps(x.prefill_tps)}</td>
        <td class="num">${tps(x.decode_tps)}</td>
        <td class="num dim">${x.prompt_tokens != null ? fmt(x.prompt_tokens) : "—"}</td>
        <td class="num dim">${x.batch != null ? x.batch : "—"}</td>
        <td class="notes" title="${esc(x.notes || "")}">${esc(x.notes)}</td>
      </tr>`).join("");
    $("#empty").style.display = r.length ? "none" : "";
  }

  function renderAll() {
    renderKpis();
    renderChart();
    renderTable();
  }

  // resize re-measure for the chart
  let rt;
  addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(renderChart, 120);
  });

  // search filter
  $("#filter").addEventListener("input", () => {
    query = $("#filter").value;
    renderAll();
  });

  // add-run dialog
  const dialog = $("#modal");
  $("#add-run").addEventListener("click", () => {
    $("#run-date").value = TODAY;
    dialog.showModal();
  });
  $("#cancel-run").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", e => {
    if (e.target === dialog || e.target.closest(".modal-body") !== dialog.querySelector(".modal-body")) dialog.close();
  });

  $("#run-form").addEventListener("submit", e => {
    e.preventDefault();
    const f = n => Number(n);
    const g = id => f($("#" + id).value);
    DATA.push({
      id: `${$("#run-date").value}-${slug($("#run-model").value)}`,
      date: $("#run-date").value || TODAY,
      model: $("#run-model").value || null,
      provider: $("#run-provider").value || null,
      hardware: $("#run-hw").value || null,
      prefill_tps: g("run-prefill") || null,
      decode_tps: g("run-decode") || null,
      prompt_tokens: g("run-prompt") || null,
      batch: g("run-batch") || null,
      notes: $("#run-notes").value || null,
    });
    renderAll();
    dialog.close();
    e.target.reset();
    toast(`Run saved in the page — hit “Export JSON” and commit data/data.js to persist it.`);
  });

  // export current in-memory data as JSON
  $("#export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "experiments.json";
    a.click();
    URL.revokeObjectURL(a.href);
    toast(`Downloaded ${DATA.length} run(s) as experiments.json`);
  });

  let toastT;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("show"), 4500);
  }

  renderAll();
})();
