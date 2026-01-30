import type { MoltbotPluginApi } from "clawdbot/plugin-sdk";
import { emptyPluginConfigSchema } from "clawdbot/plugin-sdk";
import { createActionLogger } from "./src/action-logger.js";
import { createReceiptStore } from "./src/receipt-store.js";
import { registerBoltbotApi } from "./src/api.js";
import { registerDashboardRoutes } from "./src/dashboard-serve.js";

const STATS_TIMEOUT_MS = 5000;

export default {
  id: "boltbot",
  name: "Boltbot — Audit Dashboard",
  description: "Tool-call audit trail and verification dashboard for Moltbot",
  configSchema: emptyPluginConfigSchema(),

  register(api: MoltbotPluginApi) {
    const store = createReceiptStore(process.env.BOLTBOT_RECEIPT_BACKEND);
    const logger = createActionLogger(store);
    api.on("after_tool_call", logger);

    registerBoltbotApi(api, store);
    registerDashboardRoutes(api);

    const dashboardUrl = process.env.BOLTBOT_DASHBOARD_URL || "/boltbot/dashboard/";

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
            text: `Boltbot Audit Dashboard\n${stats.total} actions · ${stats.anomalyCount} anomalies\n${dashboardUrl}`,
          };
        } catch {
          return {
            text: `Boltbot Audit Dashboard\nStats unavailable — check gateway logs\n${dashboardUrl}`,
          };
        }
      },
    });
  },
};
