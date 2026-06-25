import { renderWithProviders } from "@/lib/test-utils";
import { DailyBudgetCard } from "@/components/dashboard/DailyBudgetCard";

describe("DailyBudgetCard", () => {
  it("renders the remaining amount correctly", () => {
    const { getByText } = renderWithProviders(<DailyBudgetCard dailyBudget={1000} spentToday={350} />);

    expect(getByText(/650/)).toBeInTheDocument();
  });

  it("shows a green tone when more than 70 percent remains", () => {
    const { getByTestId } = renderWithProviders(<DailyBudgetCard dailyBudget={1000} spentToday={200} />);

    expect(getByTestId("daily-budget-progress")).toHaveClass("bg-emerald-500");
  });

  it("shows a yellow tone for mid-range remaining budget", () => {
    const { getByTestId } = renderWithProviders(<DailyBudgetCard dailyBudget={1000} spentToday={500} />);

    expect(getByTestId("daily-budget-progress")).toHaveClass("bg-amber-400");
  });

  it("shows a red tone when the budget is nearly exhausted", () => {
    const { getByTestId } = renderWithProviders(<DailyBudgetCard dailyBudget={1000} spentToday={850} />);

    expect(getByTestId("daily-budget-progress")).toHaveClass("bg-rose-500");
  });

  it("updates when props change", () => {
    const { rerender, getByText } = renderWithProviders(<DailyBudgetCard dailyBudget={1000} spentToday={300} />);

    expect(getByText(/700/)).toBeInTheDocument();

    rerender(<DailyBudgetCard dailyBudget={1000} spentToday={900} />);

    expect(getByText(/100/)).toBeInTheDocument();
  });
});
