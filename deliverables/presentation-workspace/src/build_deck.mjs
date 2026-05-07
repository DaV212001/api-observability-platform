import fs from "node:fs";
import path from "node:path";
import {
  Presentation,
  PresentationFile,
  column,
  row,
  grid,
  layers,
  panel,
  text,
  chart,
  rule,
  fill,
  hug,
  fixed,
  wrap,
  grow,
  fr,
  auto,
} from "@oai/artifact-tool";

const W = 1920;
const H = 1080;
const root = path.resolve("../../");
const outDir = path.resolve("output");
const scratchDir = path.resolve("scratch");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(scratchDir, { recursive: true });

const C = {
  navy: "#FFFFFF",
  ink: "#0F172A",
  panel: "#F8FAFC",
  panel2: "#E0F2FE",
  line: "#CBD5E1",
  white: "#0F172A",
  muted: "#475569",
  blue: "#0284C7",
  green: "#059669",
  amber: "#D97706",
  red: "#E11D48",
  slate: "#64748B",
};

const titleStyle = { fontSize: 62, bold: true, color: C.white, fontFace: "Aptos Display" };
const subStyle = { fontSize: 25, color: C.muted, fontFace: "Aptos" };
const smallStyle = { fontSize: 16, color: C.muted, fontFace: "Aptos" };

function rootFrame(node) {
  return [node, { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 }];
}

function slideShell(slide, title, subtitle, body, footer = "API Observability Platform") {
  const [node, opts] = rootFrame(
    column(
      { name: "slide-root", width: fill, height: fill, padding: { x: 88, y: 64 }, gap: 28, background: C.navy },
      [
        column(
          { name: "title-stack", width: fill, height: hug, gap: 12 },
          [
            text(title, { name: "slide-title", width: wrap(1400), height: hug, style: titleStyle }),
            text(subtitle, { name: "slide-subtitle", width: wrap(1320), height: hug, style: subStyle }),
          ],
        ),
        body,
        row(
          { name: "footer-row", width: fill, height: hug, align: "center", gap: 22 },
          [
            rule({ name: "footer-rule", width: fixed(128), stroke: C.blue, weight: 3 }),
            text(footer, { name: "footer", width: fill, height: hug, style: smallStyle }),
          ],
        ),
      ],
    ),
  );
  slide.compose(node, opts);
}

function metric(label, value, accent, note, height = fill) {
  return panel(
    {
      name: `metric-${label}`,
      width: fill,
      height,
      padding: { x: 28, y: 24 },
      background: C.panel,
      border: { color: C.line, width: 1 },
      borderRadius: 18,
    },
    column(
      { width: fill, height: fill, gap: 14 },
      [
        text(label.toUpperCase(), { width: fill, height: hug, style: { fontSize: 15, bold: true, color: accent, fontFace: "Aptos" } }),
        text(value, { width: fill, height: hug, style: { fontSize: 48, bold: true, color: C.white, fontFace: "Aptos Display" } }),
        text(note, { width: fill, height: hug, style: { fontSize: 18, color: C.muted, fontFace: "Aptos" } }),
      ],
    ),
  );
}

function pill(label, color = C.blue) {
  return panel(
    { width: fixed(160), height: hug, padding: { x: 12, y: 10 }, background: `${color}22`, border: { color, width: 1 }, borderRadius: 100 },
    text(label, { width: fixed(136), height: hug, style: { fontSize: 15, bold: true, color, fontFace: "Aptos" } }),
  );
}

const presentation = Presentation.create({ slideSize: { width: W, height: H } });

{
  const slide = presentation.slides.add();
  slide.compose(
    grid(
      { name: "cover-root", width: fill, height: fill, columns: [fr(1.35), fr(0.85)], rows: [fr(1), auto], padding: { x: 88, y: 72 }, columnGap: 64, rowGap: 36 },
      [
        column(
          { name: "cover-copy", width: fill, height: fill, gap: 28 },
          [
            row({ width: fill, height: hug, gap: 12 }, [pill("Express"), pill("Prometheus", C.green), pill("Grafana", C.amber)]),
            text("API Observability Platform", { name: "cover-title", width: wrap(1120), height: hug, style: { fontSize: 80, bold: true, color: C.white, fontFace: "Aptos Display" } }),
            text("A miniature production monitoring environment for automated API checks, SLA metrics, and DevOps-style dashboards.", { name: "cover-subtitle", width: wrap(980), height: hug, style: { fontSize: 30, color: C.muted, fontFace: "Aptos" } }),
          ],
        ),
        column(
          { name: "cover-system-map", width: fill, height: fill, gap: 20 },
          [
            metric("Synthetic checks", "16", C.green, "Postman assertions"),
            metric("SLA target", "300ms", C.blue, "Response-time threshold"),
            metric("Local stack", "3", C.amber, "API, Prometheus, Grafana"),
          ],
        ),
        text("Project report presentation | 2026", { name: "cover-footer", columnSpan: 2, width: fill, height: hug, style: smallStyle }),
      ],
    ),
    { frame: { left: 0, top: 0, width: W, height: H }, baseUnit: 8 },
  );
}

{
  const slide = presentation.slides.add();
  slideShell(
    slide,
    "The project behaves like a small SRE platform",
    "It tests APIs, captures runtime telemetry, stores metrics, and visualizes operational health in a provisioned dashboard.",
    grid(
      { name: "platform-grid", width: fill, height: grow(1), columns: [fr(1), fr(1), fr(1), fr(1)], rows: [fr(1)], gap: 20 },
      [
        metric("Test", "Postman + Jest", C.green, "Contract, content, and SLA assertions"),
        metric("Collect", "/metrics", C.blue, "Counters, gauges, and latency histograms"),
        metric("Observe", "Prometheus", C.amber, "5-second scrape interval and alert rules"),
        metric("Visualize", "Grafana", C.red, "Health, performance, and reliability rows"),
      ],
    ),
  );
}

{
  const slide = presentation.slides.add();
  slideShell(
    slide,
    "Architecture: synthetic traffic becomes observability data",
    "The stack keeps every layer small enough to run locally while preserving production monitoring concepts.",
    grid(
      { name: "architecture", width: fill, height: grow(1), columns: [fr(1), auto, fr(1), auto, fr(1), auto, fr(1)], rows: [fr(1)], columnGap: 18, align: "center" },
      [
        metric("Clients", "Newman, Jest, k6", C.green, "Synthetic and load traffic"),
        text("->", { width: hug, height: hug, style: { fontSize: 48, bold: true, color: C.blue } }),
        metric("API", "Express", C.blue, "/users, /posts, /health, /metrics"),
        text("->", { width: hug, height: hug, style: { fontSize: 48, bold: true, color: C.blue } }),
        metric("Metrics", "Prometheus", C.amber, "Scrapes service telemetry"),
        text("->", { width: hug, height: hug, style: { fontSize: 48, bold: true, color: C.blue } }),
        metric("Dashboard", "Grafana", C.red, "Command-center view"),
      ],
    ),
  );
}

{
  const slide = presentation.slides.add();
  slideShell(
    slide,
    "Synthetic tests act as operational checks",
    "The Postman collection is not just a request list; it validates status, schema, content, and response-time SLA.",
    grid(
      { name: "test-grid", width: fill, height: grow(1), columns: [fr(1.05), fr(0.95)], rows: [fr(1)], columnGap: 48 },
      [
        column(
          { width: fill, height: fill, gap: 18 },
          [
            metric("Coverage", "4 endpoints", C.green, "GET /health, GET /users, GET /posts, POST /posts"),
            metric("Assertions", "16 passed", C.blue, "Status codes, schemas, content, SLA"),
            metric("Artifacts", "JSON metrics", C.amber, "Endpoint, method, status, latency, timestamp"),
          ],
        ),
        chart({
          name: "newman-latency-chart",
          chartType: "bar",
          width: fill,
          height: fill,
          config: {
            title: "Latest Newman response time by endpoint",
            categories: ["/health", "/users", "/posts GET", "/posts POST"],
            series: [{ name: "ms", values: [35, 66, 120, 197] }],
          },
        }),
      ],
    ),
  );
}

{
  const slide = presentation.slides.add();
  slideShell(
    slide,
    "Prometheus instrumentation makes API behavior measurable",
    "Express middleware turns each request into counters, latency buckets, error counts, endpoint gauges, and uptime.",
    grid(
      { name: "metrics-grid", width: fill, height: grow(1), columns: [fr(1), fr(1)], rows: [fr(1), fr(1)], gap: 22 },
      [
        metric("api_request_count", "volume", C.blue, "Total requests by method, route, and status code"),
        metric("api_response_time_seconds", "latency", C.green, "Histogram used for p95 and SLA compliance"),
        metric("api_error_count", "reliability", C.red, "Error-rate source for failed request panels"),
        metric("api_endpoint_latency_ms", "freshness", C.amber, "Last observed endpoint latency comparison"),
      ],
    ),
  );
}

{
  const slide = presentation.slides.add();
  slideShell(
    slide,
    "Grafana dashboard is organized by SRE questions",
    "Three rows separate the live read: health first, performance next, reliability last.",
    grid(
      { name: "dashboard-rows", width: fill, height: grow(1), columns: [fr(1), fr(1), fr(1)], rows: [fr(1)], gap: 24 },
      [
        metric("Row 1", "System Health", C.green, "Uptime, average latency, total requests, SLA compliance"),
        metric("Row 2", "Performance", C.blue, "Response trend, endpoint comparison, requests/sec"),
        metric("Row 3", "Reliability", C.red, "Error rate, failed requests, recent failures table"),
      ],
    ),
  );
}

{
  const slide = presentation.slides.add();
  slideShell(
    slide,
    "Docker Compose turns the repo into a local observability lab",
    "One command starts the API, Prometheus, and Grafana with provisioned dashboards and persistent volumes.",
    grid(
      { name: "ops-grid", width: fill, height: grow(1), columns: [fr(1), fr(1)], rows: [fr(1)], columnGap: 42 },
      [
        column(
          { width: fill, height: fill, gap: 18 },
          [
            metric("Startup", "docker compose up --build", C.green, "Single-command local stack"),
            metric("CI", "GitHub Actions", C.blue, "Jest checks and Docker smoke test"),
            metric("Load", "k6 stress + spike", C.amber, "Traffic patterns visible in Grafana"),
          ],
        ),
        chart({
          name: "stack-chart",
          chartType: "bar",
          width: fill,
          height: fill,
          config: {
            title: "Operational coverage areas",
            categories: ["API", "Tests", "Metrics", "Dashboard", "Load", "CI"],
            series: [{ name: "implemented", values: [100, 100, 100, 100, 85, 90] }],
          },
        }),
      ],
    ),
  );
}

{
  const slide = presentation.slides.add();
  slideShell(
    slide,
    "What this project proves",
    "A compact codebase can still demonstrate realistic reliability engineering: instrumentation, automated checks, observability, dashboards, and operational readiness.",
    column(
      { name: "closing", width: fill, height: grow(1), gap: 24 },
      [
        row({ width: fill, height: fill, gap: 24 }, [
          metric("Validated", "7 Jest tests", C.green, "API contracts and metrics output"),
          metric("Synthetic", "0 failures", C.blue, "Newman SLA run with JSON summary"),
          metric("Ready", "Portfolio-quality", C.amber, "Readable architecture and polished docs"),
        ]),
        panel(
          { width: fill, height: hug, padding: { x: 34, y: 26 }, background: C.panel2, border: { color: C.line, width: 1 }, borderRadius: 20 },
          text("Recommended next step: run k6 traffic while Grafana is open, then capture dashboard screenshots for the README placeholders.", {
            width: fill,
            height: hug,
            style: { fontSize: 28, bold: true, color: C.white, fontFace: "Aptos" },
          }),
        ),
      ],
    ),
  );
}

const pptx = await PresentationFile.exportPptx(presentation);
await pptx.save(path.join(outDir, "API_Observability_Platform_Presentation.pptx"));

for (let i = 0; i < presentation.slides.count; i += 1) {
  const slide = presentation.slides.getItem(i);
  const png = await presentation.export({ slide, format: "png" });
  const buffer = Buffer.from(await png.arrayBuffer());
  fs.writeFileSync(path.join(scratchDir, `slide-${String(i + 1).padStart(2, "0")}.png`), buffer);
}

const layoutReport = [];
for (let i = 0; i < presentation.slides.count; i += 1) {
  const slide = presentation.slides.getItem(i);
  const layout = await presentation.export({ slide, format: "layout" });
  layoutReport.push(JSON.parse(await layout.text()));
}
fs.writeFileSync(path.join(scratchDir, "layout.json"), JSON.stringify(layoutReport, null, 2));

console.log(path.join(outDir, "API_Observability_Platform_Presentation.pptx"));
