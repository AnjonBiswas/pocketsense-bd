import { act, fireEvent, waitFor } from "@testing-library/react";
import { AddExpenseModal } from "@/components/modals/AddExpenseModal";
import { renderWithProviders } from "@/lib/test-utils";
import { useExpenseStore } from "@/store/expenseStore";

const addExpenseMock = jest.fn();

jest.mock("@/lib/hooks/useExpenses", () => ({
  useExpenses: () => ({
    addExpense: addExpenseMock
  })
}));

describe("AddExpenseModal", () => {
  beforeEach(() => {
    addExpenseMock.mockReset();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        isActive: false,
        shouldActivate: false,
        severity: "warning",
        remainingBudget: 1000,
        daysRemaining: 10,
        lockedAmount: 0,
        hasLockedFunds: false,
        hasPin: false,
        luxuryWarning: null
      })
    }) as jest.Mock;

    useExpenseStore.setState({
      expenses: [],
      filters: {},
      isAddExpenseOpen: true,
      draftExpense: {},
      toast: null
    });
  });

  afterEach(() => {
    act(() => {
      useExpenseStore.getState().closeAddExpenseModal();
    });
    jest.clearAllMocks();
  });

  it("opens and closes correctly", async () => {
    const { getByText, queryByText } = renderWithProviders(<AddExpenseModal />);

    expect(getByText(/Submit Expense/i)).toBeInTheDocument();

    fireEvent.click(getByText(/Cancel/i));

    await waitFor(() => {
      expect(queryByText(/Submit Expense/i)).not.toBeInTheDocument();
    });
  });

  it("validates required amount input", async () => {
    const { getByText } = renderWithProviders(<AddExpenseModal />);

    fireEvent.click(getByText(/Submit Expense/i));

    await waitFor(() => {
      expect(getByText(/সঠিক|à¦¸à¦ à¦¿à¦•/i)).toBeInTheDocument();
    });
  });

  it("submits expense data through the expense action", async () => {
    addExpenseMock.mockResolvedValue({ expense: { id: "expense-1" } });

    const { getByLabelText, getByText } = renderWithProviders(<AddExpenseModal />);

    fireEvent.change(getByLabelText(/Amount \(BDT\)/i), { target: { value: "250" } });
    fireEvent.change(getByLabelText(/Note/i), { target: { value: "Tea and snacks" } });
    fireEvent.change(getByLabelText(/Date/i), { target: { value: "2026-06-26" } });
    fireEvent.click(getByText(/Submit Expense/i));

    await waitFor(() => {
      expect(addExpenseMock).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 250,
          category: "food",
          note: "Tea and snacks",
          date: "2026-06-26"
        })
      );
    });
  });
});
