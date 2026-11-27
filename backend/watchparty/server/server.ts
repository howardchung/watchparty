import { initializeMonitoring } from "./watchparty/observability.ts";
initializeMonitoring();
const { start } = await import("./watchparty/main.ts");
await start();
