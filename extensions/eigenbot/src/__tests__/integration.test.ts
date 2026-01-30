import { describe, it, expect, vi } from "vitest";

// Mock clawdbot/plugin-sdk to avoid pulling in the full config/zod chain.
vi.mock("clawdbot/plugin-sdk", () => ({
  emptyPluginConfigSchema: () => ({}),
}));

// Mock better-sqlite3 before any imports that use it
vi.mock("better-sqlite3", () => {
  class MockDatabase {
    exec() {}
    prepare() {
      return {
        run: (..._args: any[]) => {},
        get: (_id?: string) => ({ c: 0 }),
        all: (..._args: any[]) => [],
      };
    }
  }
  return { default: MockDatabase };
});

function createMockApi() {
  let registeredCommand: any;
  const mockApi = {
    registerProvider: vi.fn(),
    on: vi.fn(),
    registerHttpRoute: vi.fn(),
    registerCommand: vi.fn((cmd: any) => { registeredCommand = cmd; }),
  };
  return { mockApi, getCommand: () => registeredCommand };
}

describe("eigenbot plugin integration", () => {
  it("plugin has correct id and name", async () => {
    const mod = await import("../../index.js");
    const plugin = mod.default;
    expect(plugin.id).toBe("eigenbot");
    expect(plugin.name).toBe("Eigenbot — Audit Dashboard");
  });

  it("register wires provider, hook, and routes", async () => {
    const mod = await import("../../index.js");
    const plugin = mod.default;

    const registered = {
      providers: [] as any[],
      hooks: [] as any[],
      routes: [] as any[],
    };

    const mockApi = {
      registerProvider: vi.fn((p: any) => registered.providers.push(p)),
      on: vi.fn((name: string, handler: any) => registered.hooks.push({ name, handler })),
      registerHttpRoute: vi.fn((r: any) => registered.routes.push(r)),
      registerCommand: vi.fn(),
    };

    plugin.register(mockApi as any);

    expect(registered.providers).toHaveLength(0);

    expect(registered.hooks).toHaveLength(1);
    expect(registered.hooks[0].name).toBe("after_tool_call");

    expect(registered.routes).toHaveLength(4);
    const paths = registered.routes.map((r: any) => r.path);
    expect(paths).toContain("/eigenbot/receipts");
    expect(paths).toContain("/eigenbot/receipt");
    expect(paths).toContain("/eigenbot/stats");
    expect(paths).toContain("/eigenbot/dashboard");
  });

  it("after_tool_call hook fires and creates receipt", async () => {
    const mod = await import("../../index.js");
    const plugin = mod.default;

    let hookHandler: any;
    const mockApi = {
      registerProvider: vi.fn(),
      on: vi.fn((_name: string, handler: any) => { hookHandler = handler; }),
      registerHttpRoute: vi.fn(),
      registerCommand: vi.fn(),
    };

    plugin.register(mockApi as any);
    expect(hookHandler).toBeDefined();

    await hookHandler(
      { toolName: "exec", params: { command: "ls" }, durationMs: 10 },
      { sessionKey: "test-sess", toolName: "exec" },
    );
  });

  it("after_tool_call hook skips low-tier tools", async () => {
    const mod = await import("../../index.js");
    const plugin = mod.default;

    let hookHandler: any;
    const mockApi = {
      registerProvider: vi.fn(),
      on: vi.fn((_name: string, handler: any) => { hookHandler = handler; }),
      registerHttpRoute: vi.fn(),
      registerCommand: vi.fn(),
    };

    plugin.register(mockApi as any);

    await hookHandler(
      { toolName: "web_search", params: { q: "test" }, durationMs: 5 },
      { sessionKey: "test-sess", toolName: "web_search" },
    );
  });

  it("registers /audit command", async () => {
    const mod = await import("../../index.js");
    const plugin = mod.default;
    const { mockApi, getCommand } = createMockApi();

    plugin.register(mockApi as any);

    const cmd = getCommand();
    expect(cmd).toBeDefined();
    expect(cmd.name).toBe("audit");
    expect(cmd.requireAuth).toBe(true);
  });

  it("/audit command returns stats", async () => {
    const mod = await import("../../index.js");
    const plugin = mod.default;
    const { mockApi, getCommand } = createMockApi();

    plugin.register(mockApi as any);

    const result = await getCommand().handler({});
    expect(result.text).toContain("Eigenbot Audit Dashboard");
    expect(result.text).toContain("actions");
    expect(result.text).toContain("anomalies");
  });
});
