export type Split = {
  userId: string;
  amount: number;
};

export type SquadExpenseForCalculation = {
  id: string;
  amount: number;
  paid_by: string;
  split_among: string[];
  split_type: "equal" | "custom";
  custom_split?: Record<string, number> | null;
  description?: string;
  date: string;
};

export type Settlement = {
  fromUserId: string;
  toUserId: string;
  amount: number;
};

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

export function calculateSplits(
  amount: number,
  paidBy: string,
  members: string[],
  splitType: "equal" | "custom",
  customAmounts?: Record<string, number>
): Split[] {
  if (splitType === "custom" && customAmounts) {
    const totalCustom = Object.values(customAmounts).reduce((sum, entry) => sum + Number(entry), 0);

    if (Math.abs(totalCustom - amount) > 0.5) {
      throw new Error("Custom split must add up to the full expense amount.");
    }

    return members.map((memberId) => ({
      userId: memberId,
      amount: roundCurrency(Number(customAmounts[memberId] || 0))
    }));
  }

  const splitCount = Math.max(members.length, 1);
  const evenShare = roundCurrency(amount / splitCount);

  return members.map((memberId, index) => {
    if (index === members.length - 1) {
      const allocated = evenShare * (splitCount - 1);
      return {
        userId: memberId,
        amount: roundCurrency(amount - allocated)
      };
    }

    return {
      userId: memberId,
      amount: evenShare
    };
  });
}

export function calculateSettlements(expenses: SquadExpenseForCalculation[]): Settlement[] {
  const balances = expenses.reduce<Record<string, number>>((accumulator, expense) => {
    const splits = calculateSplits(
      expense.amount,
      expense.paid_by,
      expense.split_among,
      expense.split_type,
      expense.custom_split || undefined
    );

    accumulator[expense.paid_by] = (accumulator[expense.paid_by] || 0) + expense.amount;

    for (const split of splits) {
      accumulator[split.userId] = (accumulator[split.userId] || 0) - split.amount;
    }

    return accumulator;
  }, {});

  const creditors = Object.entries(balances)
    .filter(([, balance]) => balance > 0.01)
    .map(([userId, balance]) => ({ userId, balance: roundCurrency(balance) }))
    .sort((left, right) => right.balance - left.balance);

  const debtors = Object.entries(balances)
    .filter(([, balance]) => balance < -0.01)
    .map(([userId, balance]) => ({ userId, balance: roundCurrency(Math.abs(balance)) }))
    .sort((left, right) => right.balance - left.balance);

  const settlements: Settlement[] = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const settledAmount = roundCurrency(Math.min(creditor.balance, debtor.balance));

    settlements.push({
      fromUserId: debtor.userId,
      toUserId: creditor.userId,
      amount: settledAmount
    });

    creditor.balance = roundCurrency(creditor.balance - settledAmount);
    debtor.balance = roundCurrency(debtor.balance - settledAmount);

    if (creditor.balance <= 0.01) creditorIndex += 1;
    if (debtor.balance <= 0.01) debtorIndex += 1;
  }

  return settlements;
}
