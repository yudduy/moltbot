import type { MoltbotPluginApi } from "clawdbot/plugin-sdk";
import { emptyPluginConfigSchema } from "clawdbot/plugin-sdk";
import { createActionLogger } from "./src/action-logger.js";
import { createReceiptStore } from "./src/receipt-store.js";
import { registerEigenbotApi } from "./src/api.js";
import { registerDashboardRoutes } from "./src/dashboard-serve.js";

const STATS_TIMEOUT_MS = 5000;

export default {
  id: "eigenbot",
  name: "Eigenbot — Audit Dashboard",
  description: "Tool-call audit trail and verification dashboard for Moltbot",
  configSchema: emptyPluginConfigSchema(),

  register(api: MoltbotPluginApi) {
    const store = createReceiptStore(process.env.EIGENBOT_RECEIPT_BACKEND);
    const logger = createActionLogger(store);
    api.on("after_tool_call", logger);

    registerEigenbotApi(api, store);
    registerDashboardRoutes(api);

    const dashboardUrl = process.env.EIGENBOT_DASHBOARD_URL || "/eigenbot/dashboard/";

    api.registerCommand({
      name: "audit",
      description: "Show audit dashboard stats",
      requireAuth: true,
      acceptsArgs: false,
      handler: async () => {
        try {
          const stats = await Promise.race([
            store.stats(),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("timeout")), STATS_TIMEOUT_MS),
            ),
          ]);
          return {
            text: `Eigenbot Audit Dashboard\n${stats.total} actions · ${stats.anomalyCount} anomalies\n${dashboardUrl}`,
          };
        } catch {
          return {
            text: `Eigenbot Audit Dashboard\nStats unavailable — check gateway logs\n${dashboardUrl}`,
          };
        }
      },
    });
  },
};
