import { subDays } from "date-fns";
import type { Json } from "@/types/database.types";
import type { Settlement, SquadExpenseForCalculation } from "@/lib/utils/splitCalculator";

export type SquadMemberProfile = {
  id: string;
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
};

export type SquadRecord = {
  id: string;
  name: string;
  created_by: string;
  members: string[];
  created_at: string;
};

export type SquadExpenseRecord = {
  id: string;
  squad_id: string;
  amount: number;
  description: string;
  paid_by: string;
  split_among: string[];
  split_type: "equal" | "custom";
  custom_split: Record<string, number> | null;
  date: string;
  created_at: string;
};

export type SquadSettlementRecord = {
  id: string;
  squad_id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  note: string | null;
  status: "pending" | "paid";
  created_at: string;
  settled_at: string | null;
};

export type SquadCardSummary = {
  squad: SquadRecord;
  members: SquadMemberProfile[];
  pendingSettlements: Settlement[];
  lastActivity: string | null;
};

export type SquadDetailsPayload = {
  squad: SquadRecord;
  members: SquadMemberProfile[];
  expenses: SquadExpenseRecord[];
  settlements: Settlement[];
  settlementHistory: SquadSettlementRecord[];
  currentUserId: string | null;
};

export function parseCustomSplit(value: Json | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const normalized = Object.entries(value).reduce<Record<string, number>>((accumulator, [key, amount]) => {
    accumulator[key] = Number(amount);
    return accumulator;
  }, {});

  return normalized;
}

export function normalizeSquadExpense(expense: Record<string, unknown>): SquadExpenseRecord {
  return {
    id: String(expense.id),
    squad_id: String(expense.squad_id),
    amount: Number(expense.amount),
    description: String(expense.description || ""),
    paid_by: String(expense.paid_by),
    split_among: Array.isArray(expense.split_among)
      ? expense.split_among.map((item) => String(item))
      : [],
    split_type: (expense.split_type as "equal" | "custom") || "equal",
    custom_split: parseCustomSplit((expense.custom_split as Json) || null),
    date: String(expense.date),
    created_at: String(expense.created_at)
  };
}

export function normalizeSquadSettlement(settlement: Record<string, unknown>): SquadSettlementRecord {
  return {
    id: String(settlement.id),
    squad_id: String(settlement.squad_id),
    from_user_id: String(settlement.from_user_id),
    to_user_id: String(settlement.to_user_id),
    amount: Number(settlement.amount),
    note: typeof settlement.note === "string" ? settlement.note : null,
    status: (settlement.status as "pending" | "paid") || "paid",
    created_at: String(settlement.created_at),
    settled_at: settlement.settled_at ? String(settlement.settled_at) : null
  };
}

export function normalizeSquad(row: Record<string, unknown>): SquadRecord {
  return {
    id: String(row.id),
    name: String(row.name),
    created_by: String(row.created_by),
    members: Array.isArray(row.members) ? row.members.map((member) => String(member)) : [],
    created_at: String(row.created_at)
  };
}

export function mapExpensesForSettlementCalculation(
  expenses: SquadExpenseRecord[]
): SquadExpenseForCalculation[] {
  return expenses.map((expense) => ({
    id: expense.id,
    amount: expense.amount,
    paid_by: expense.paid_by,
    split_among: expense.split_among,
    split_type: expense.split_type,
    custom_split: expense.custom_split,
    description: expense.description,
    date: expense.date
  }));
}

export function applySettlementHistory(
  settlements: Settlement[],
  history: SquadSettlementRecord[]
): Settlement[] {
  return settlements
    .map((settlement) => {
      const paidAmount = history
        .filter(
          (item) =>
            item.from_user_id === settlement.fromUserId &&
            item.to_user_id === settlement.toUserId &&
            item.status === "paid"
        )
        .reduce((sum, item) => sum + item.amount, 0);

      return {
        ...settlement,
        amount: Number(Math.max(settlement.amount - paidAmount, 0).toFixed(2))
      };
    })
    .filter((settlement) => settlement.amount > 0);
}

const sampleUsers: SquadMemberProfile[] = [
  { id: "user-demo-1", name: "Sabbir", phone: "01711000001", avatar_url: null },
  { id: "user-demo-2", name: "Nabila", phone: "01711000002", avatar_url: null },
  { id: "user-demo-3", name: "Arafat", phone: "01711000003", avatar_url: null }
];

export function getFallbackSquadMembers() {
  return sampleUsers;
}

export function getFallbackSquads(currentUserId = "user-demo-1"): SquadRecord[] {
  return [
    {
      id: "squad-demo-1",
      name: "Hall Foodies",
      created_by: currentUserId,
      members: sampleUsers.map((member) => member.id),
      created_at: new Date().toISOString()
    },
    {
      id: "squad-demo-2",
      name: "CSE Batch Hangout",
      created_by: currentUserId,
      members: [sampleUsers[0].id, sampleUsers[1].id],
      created_at: subDays(new Date(), 5).toISOString()
    }
  ];
}

export function getFallbackSquadExpenses(): SquadExpenseRecord[] {
  const today = new Date();
  return [
    {
      id: "squad-exp-1",
      squad_id: "squad-demo-1",
      amount: 720,
      description: "Late night biryani",
      paid_by: "user-demo-1",
      split_among: ["user-demo-1", "user-demo-2", "user-demo-3"],
      split_type: "equal",
      custom_split: null,
      date: subDays(today, 1).toISOString().slice(0, 10),
      created_at: subDays(today, 1).toISOString()
    },
    {
      id: "squad-exp-2",
      squad_id: "squad-demo-1",
      amount: 300,
      description: "Tea and snacks",
      paid_by: "user-demo-2",
      split_among: ["user-demo-1", "user-demo-2"],
      split_type: "equal",
      custom_split: null,
      date: subDays(today, 3).toISOString().slice(0, 10),
      created_at: subDays(today, 3).toISOString()
    }
  ];
}

export function getFallbackSettlementHistory(): SquadSettlementRecord[] {
  return [
    {
      id: "settle-demo-1",
      squad_id: "squad-demo-1",
      from_user_id: "user-demo-3",
      to_user_id: "user-demo-1",
      amount: 120,
      note: "bKash sent",
      status: "paid",
      created_at: subDays(new Date(), 2).toISOString(),
      settled_at: subDays(new Date(), 2).toISOString()
    }
  ];
}

