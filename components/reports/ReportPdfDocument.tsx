import React from "react";
import { format, parseISO } from "date-fns";
import { Document, Page, StyleSheet, Svg, Text, View, Line, Rect, Polyline } from "@react-pdf/renderer";

type ReportPayload = {
  startDate: string;
  endDate: string;
  metrics: {
    totalIncome: number;
    totalExpenses: number;
    savings: number;
    savingsRate: number;
  };
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
    label: string;
  }>;
  dailySpending: Array<{
    date: string;
    amount: number;
    cumulative: number;
    budgetCumulative: number;
    overBudget: boolean;
  }>;
  monthlyComparison: Array<{
    month: string;
    income: number;
    expenses: number;
    savings: number;
  }>;
  insights: Array<{
    title: string;
    message: string;
  }>;
};

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 11,
    color: "#0f172a"
  },
  section: {
    marginBottom: 18
  },
  title: {
    fontSize: 18,
    marginBottom: 8
  },
  row: {
    flexDirection: "row",
    gap: 10
  },
  metricCard: {
    flexGrow: 1,
    border: "1 solid #dbeafe",
    borderRadius: 10,
    padding: 10
  },
  label: {
    fontSize: 10,
    color: "#475569",
    marginBottom: 4
  },
  value: {
    fontSize: 16,
    fontWeight: 700
  },
  insight: {
    border: "1 solid #e2e8f0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8
  }
});

function buildPolylinePoints(values: number[], width: number, height: number) {
  const max = Math.max(...values, 1);
  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export function ReportPdfDocument({ report }: { report: ReportPayload }) {
  const trendValues = report.dailySpending.map((item) => item.cumulative);
  const comparisonMax = Math.max(
    ...report.monthlyComparison.flatMap((item) => [item.income, item.expenses, item.savings]),
    1
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>PocketSense Report</Text>
          <Text>
            {report.startDate} to {report.endDate}
          </Text>
        </View>

        <View style={[styles.section, styles.row]}>
          <View style={styles.metricCard}>
            <Text style={styles.label}>Total Income</Text>
            <Text style={styles.value}>৳{report.metrics.totalIncome.toFixed(0)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.label}>Total Expenses</Text>
            <Text style={styles.value}>৳{report.metrics.totalExpenses.toFixed(0)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.label}>Savings Rate</Text>
            <Text style={styles.value}>{report.metrics.savingsRate.toFixed(0)}%</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ marginBottom: 8, fontWeight: 700 }}>Spending Trend</Text>
          <Svg width="520" height="120">
            <Line x1="0" y1="120" x2="520" y2="120" stroke="#cbd5e1" strokeWidth="1" />
            <Polyline points={buildPolylinePoints(trendValues, 520, 100)} fill="none" stroke="#ef4444" strokeWidth="3" />
          </Svg>
        </View>

        <View style={styles.section}>
          <Text style={{ marginBottom: 8, fontWeight: 700 }}>Category Breakdown</Text>
          {report.categoryBreakdown.map((item) => (
            <View key={item.category} style={{ marginBottom: 6 }}>
              <Text>
                {item.label}: ৳{item.amount.toFixed(0)} ({item.percentage.toFixed(0)}%)
              </Text>
              <Svg width="520" height="10">
                <Rect x="0" y="0" width={String((item.percentage / 100) * 520)} height="10" fill={item.color} />
              </Svg>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={{ marginBottom: 8, fontWeight: 700 }}>Income vs Expense</Text>
          <Svg width="520" height="150">
            {report.monthlyComparison.map((item, index) => {
              const x = 30 + index * 160;
              const incomeHeight = (item.income / comparisonMax) * 100;
              const expenseHeight = (item.expenses / comparisonMax) * 100;

              return (
                <React.Fragment key={item.month}>
                  <Rect x={String(x)} y={String(120 - incomeHeight)} width="28" height={String(incomeHeight)} fill="#16a34a" />
                  <Rect x={String(x + 38)} y={String(120 - expenseHeight)} width="28" height={String(expenseHeight)} fill="#ef4444" />
                  <Text x={String(x)} y="142">{item.month}</Text>
                </React.Fragment>
              );
            })}
          </Svg>
        </View>

        <View style={styles.section}>
          <Text style={{ marginBottom: 8, fontWeight: 700 }}>Insights</Text>
          {report.insights.map((insight, index) => (
            <View key={`${insight.title}-${index}`} style={styles.insight}>
              <Text style={{ fontWeight: 700, marginBottom: 4 }}>{insight.title}</Text>
              <Text>{insight.message}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

export function getReportPdfFileName(endDate: string) {
  return `pocketsense-report-${format(parseISO(endDate), "yyyy-MM-dd")}.pdf`;
}

