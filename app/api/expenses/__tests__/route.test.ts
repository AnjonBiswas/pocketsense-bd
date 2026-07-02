/** @jest-environment node */

import { NextRequest } from "next/server";
import { DELETE, GET, POST } from "@/app/api/expenses/route";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { getSOSState } from "@/lib/sos/get-sos-state";

jest.mock("@/lib/supabase/server", () => ({
  createRouteHandlerClient: jest.fn()
}));

jest.mock("@/lib/sos/get-sos-state", () => ({
  getSOSState: jest.fn(),
  hashPIN: jest.fn((value: string) => `hashed-${value}`)
}));

type BuilderResult = {
  data?: unknown;
  count?: number | null;
  error?: { message: string } | null;
};

function createBuilder(result: BuilderResult = {}) {
  const builder: Record<string, jest.Mock> = {};
  const resolvedValue = {
    data: result.data ?? [],
    count: result.count ?? 0,
    error: result.error ?? null
  };

  builder.select = jest.fn(() => builder);
  builder.eq = jest.fn(() => builder);
  builder.gte = jest.fn(() => builder);
  builder.lte = jest.fn(() => builder);
  builder.in = jest.fn(() => builder);
  builder.ilike = jest.fn(() => builder);
  builder.order = jest.fn(() => builder);
  builder.insert = jest.fn(() => builder);
  builder.update = jest.fn(() => builder);
  builder.delete = jest.fn(() => builder);
  builder.range = jest.fn(async () => resolvedValue);
  builder.single = jest.fn(async () => ({
    data: result.data ?? null,
    error: result.error ?? null
  }));
  builder.maybeSingle = jest.fn(async () => ({
    data: result.data ?? null,
    error: result.error ?? null
  }));
  builder.then = (onFulfilled: (value: typeof resolvedValue) => unknown) =>
    Promise.resolve(resolvedValue).then(onFulfilled);

  return builder;
}

function createSupabaseMock({
  user,
  fromMap
}: {
  user: { id: string } | null;
  fromMap?: Record<string, unknown[]>;
}) {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user
        }
      })
    },
    from: jest.fn((table: string) => {
      const queue = fromMap?.[table] || [];
      const next = queue.shift() as BuilderResult | undefined;
      return createBuilder(next);
    })
  };
}

describe("/api/expenses route", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("rejects invalid POST payloads", async () => {
    const request = new NextRequest("http://localhost:3000/api/expenses", {
      method: "POST",
      body: JSON.stringify({ amount: 0, category: "food", date: "2026-06-26" })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toMatch(/Amount/i);
  });

  it("creates an expense and returns updated stats for an authenticated user", async () => {
    const supabase = createSupabaseMock({
      user: { id: "user-1" },
      fromMap: {
        expenses: [
          {
            data: {
              id: "expense-1",
              amount: 250,
              category: "food",
              note: "Lunch",
              date: "2026-06-26",
              created_at: "2026-06-26T12:00:00.000Z"
            }
          },
          { data: [{ amount: 250 }] },
          { data: [{ amount: 250 }] }
        ],
        incomes: [{ data: [{ amount: 10000 }] }],
        budgets: [{ data: { monthly_limit: 12000, savings_goal: 2000, emergency_reserve: 1000 } }]
      }
    });

    (createRouteHandlerClient as jest.Mock).mockReturnValue(supabase);
    (getSOSState as jest.Mock).mockResolvedValue({
      isActive: false,
      hasPin: false
    });

    const request = new NextRequest("http://localhost:3000/api/expenses", {
      method: "POST",
      body: JSON.stringify({
        amount: 250,
        category: "food",
        note: "Lunch",
        date: "2026-06-26"
      })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.expense).toEqual(
      expect.objectContaining({
        amount: 250,
        category: "food"
      })
    );
    expect(payload.stats).toEqual(
      expect.objectContaining({
        totalExpenses: 250
      })
    );
  });

  it("requires authentication to list expenses", async () => {
    (createRouteHandlerClient as jest.Mock).mockReturnValue(
      createSupabaseMock({
        user: null
      })
    );

    const request = new NextRequest("http://localhost:3000/api/expenses?category=food&page=1&limit=5");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toMatch(/Authentication required/i);
  });

  it("deletes expenses for an authenticated user", async () => {
    const supabase = createSupabaseMock({
      user: { id: "user-1" },
      fromMap: {
        expenses: [
          { error: null },
          { data: [{ amount: 150 }] }
        ],
        incomes: [{ data: [{ amount: 8000 }] }],
        budgets: [{ data: { monthly_limit: 12000, savings_goal: 2000, emergency_reserve: 1000 } }]
      }
    });

    (createRouteHandlerClient as jest.Mock).mockReturnValue(supabase);

    const request = new NextRequest("http://localhost:3000/api/expenses?id=expense-1", {
      method: "DELETE"
    });

    const response = await DELETE(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.deletedIds).toEqual(["expense-1"]);
  });

  it("returns a safe server error when session verification fails", async () => {
    (createRouteHandlerClient as jest.Mock).mockImplementation(() => {
      throw new Error("Supabase unavailable");
    });

    const request = new NextRequest("http://localhost:3000/api/expenses");
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toMatch(/Unable to verify your session right now/i);
  });
});
