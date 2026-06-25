import { calculateSettlements, calculateSplits } from "@/lib/utils/splitCalculator";

describe("splitCalculator", () => {
  it("splits equally across members", () => {
    expect(calculateSplits(500, "u1", ["u1", "u2", "u3"], "equal")).toEqual([
      { userId: "u1", amount: 166.67 },
      { userId: "u2", amount: 166.67 },
      { userId: "u3", amount: 166.66 }
    ]);
  });

  it("supports custom split amounts", () => {
    expect(
      calculateSplits(500, "u1", ["u1", "u2", "u3"], "custom", {
        u1: 100,
        u2: 150,
        u3: 250
      })
    ).toEqual([
      { userId: "u1", amount: 100 },
      { userId: "u2", amount: 150 },
      { userId: "u3", amount: 250 }
    ]);
  });

  it("optimizes settlements across multiple expenses", () => {
    expect(
      calculateSettlements([
        {
          id: "exp-1",
          amount: 600,
          paid_by: "u1",
          split_among: ["u1", "u2", "u3"],
          split_type: "equal",
          date: "2026-06-20"
        },
        {
          id: "exp-2",
          amount: 300,
          paid_by: "u2",
          split_among: ["u1", "u2", "u3"],
          split_type: "equal",
          date: "2026-06-21"
        }
      ])
    ).toEqual([
      { fromUserId: "u3", toUserId: "u1", amount: 300 }
    ]);
  });
});
