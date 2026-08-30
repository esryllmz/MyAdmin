import { describe, it, expect, vi, beforeEach } from "vitest";

// The refresh coordinator's whole job is to prevent N concurrent 401s from firing N refresh
// requests. react-toastify touches the DOM/event bus as a side effect of error paths exercised
// here — mocked out so these tests assert on the coordinator's behavior, not toast plumbing.
vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

const jsonResponse = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("apiClient refresh coordinator (single-flight)", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    localStorage.setItem("accessToken", "expired-access-token");

    // Replace window.location wholesale so handleLogout's `location.href = "/login"` never
    // triggers jsdom's "not implemented: navigation" path.
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });
  });

  it("coalesces 10 simultaneous 401s into exactly one refresh request, then retries all with the new token", async () => {
    const { apiClient } = await import("./apiClient");

    let refreshCallCount = 0;

    const fetchMock = vi.fn(async (input: string | URL, init?: RequestInit) => {
      const url = input.toString();

      if (url.includes("/authentication/refresh-token")) {
        refreshCallCount += 1;

        return jsonResponse(
          {
            success: true,
            statusCode: 200,
            message: "",
            data: {
              accessToken: "fresh-access-token",
              expiration: new Date(Date.now() + 60_000).toISOString(),
              user: { id: "u1", username: "demo", email: "demo@example.com", isActive: true, createdDate: "", roles: [] },
            },
          },
          200
        );
      }

      const authHeader = (init?.headers as Headers)?.get?.("Authorization");

      if (authHeader === "Bearer fresh-access-token") {
        return jsonResponse({ success: true, statusCode: 200, message: "", data: { ok: true } }, 200);
      }

      return jsonResponse({ success: false, statusCode: 401, message: "Oturum süresi doldu." }, 401);
    });

    vi.stubGlobal("fetch", fetchMock);

    const results = await Promise.all(
      Array.from({ length: 10 }, () => apiClient<{ ok: boolean }>("/some/protected/endpoint"))
    );

    expect(refreshCallCount).toBe(1);

    for (const result of results) {
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ ok: true });
    }

    expect(localStorage.getItem("accessToken")).toBe("fresh-access-token");

    vi.unstubAllGlobals();
  });

  it("rejects every waiter exactly once and clears auth state when the refresh itself fails", async () => {
    const { apiClient } = await import("./apiClient");

    let refreshCallCount = 0;

    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = input.toString();

      if (url.includes("/authentication/refresh-token")) {
        refreshCallCount += 1;

        return jsonResponse({ success: false, statusCode: 401, message: "Oturum süresi doldu." }, 401);
      }

      return jsonResponse({ success: false, statusCode: 401, message: "Oturum süresi doldu." }, 401);
    });

    vi.stubGlobal("fetch", fetchMock);

    const outcomes = await Promise.allSettled(
      Array.from({ length: 5 }, () => apiClient("/some/protected/endpoint"))
    );

    expect(refreshCallCount).toBe(1);

    for (const outcome of outcomes) {
      expect(outcome.status).toBe("rejected");
    }

    // handleLogout runs once per failed waiter, but it's idempotent — the net effect is the
    // same cleared state regardless of how many callers triggered it.
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(window.location.href).toBe("/login");

    vi.unstubAllGlobals();
  });
});
