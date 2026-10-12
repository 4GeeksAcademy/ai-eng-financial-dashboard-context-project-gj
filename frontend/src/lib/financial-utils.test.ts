import { describe, expect, it } from "vitest";

import {
  computeKPIs,
  computeMonthlyData,
  formatCurrency,
  formatMovementPeriod,
  formatPercent,
} from "./financial-utils";
import type { FinancialMovement } from "./financial-types";

const sampleMovements: FinancialMovement[] = [
  {
    create_date: "2024-01-10",
    amount: 1000,
    operation_type: "income",
    category: "sales",
    business_type: "B2B",
  },
  {
    create_date: "2024-01-15",
    amount: 250,
    operation_type: "outcome",
    category: "suppliers",
    business_type: "B2B",
  },
  {
    create_date: "2024-02-01",
    amount: 500,
    operation_type: "income",
    category: "sales",
    business_type: "B2C",
  },
];

describe("computeKPIs", () => {
  it("calculates totals and profit values", () => {
    const metrics = computeKPIs(sampleMovements);

    expect(metrics).toEqual({
      totalIncome: 1500,
      totalOutcome: 250,
      profit: 1250,
      profitPercent: (1250 / 1500) * 100,
    });
  });

  it("returns 0 profitPercent when there is no income", () => {
    const onlyOutcomes: FinancialMovement[] = [
      {
        create_date: "2024-03-05",
        amount: 350,
        operation_type: "outcome",
        category: "operational",
        business_type: "B2B",
      },
    ];

    const metrics = computeKPIs(onlyOutcomes);
    expect(metrics.profitPercent).toBe(0);
  });

  it("reports a loss when outcomes exceed income", () => {
    const lossMovements: FinancialMovement[] = [
      { ...sampleMovements[0], amount: 100 },
      { ...sampleMovements[1], amount: 150 },
    ];

    expect(computeKPIs(lossMovements)).toEqual({
      totalIncome: 100,
      totalOutcome: 150,
      profit: -50,
      profitPercent: -50,
    });
  });
});

describe("computeMonthlyData", () => {
  it("keeps first-of-month dates in their ISO calendar month", () => {
    const firstDayMovement: FinancialMovement = {
      ...sampleMovements[0],
      create_date: "2025-12-01",
    };

    expect(computeMonthlyData([firstDayMovement])[0]?.month).toBe("Dec 2025");
  });

  it("returns chronological year-month points with aggregated totals", () => {
    const unsortedCrossYearMovements: FinancialMovement[] = [
      {
        create_date: "2026-01-08",
        amount: 300,
        operation_type: "income",
        category: "sales",
        business_type: "B2C",
      },
      {
        create_date: "2025-12-05",
        amount: 200,
        operation_type: "outcome",
        category: "operational",
        business_type: "B2B",
      },
      {
        create_date: "2025-12-03",
        amount: 1000,
        operation_type: "income",
        category: "sales",
        business_type: "B2B",
      },
    ];
    const monthlyData = computeMonthlyData(unsortedCrossYearMovements);

    expect(monthlyData).toHaveLength(2);
    expect(monthlyData[0]).toEqual({
      month: "Dec 2025",
      income: 1000,
      outcome: 200,
      profitPercent: 80,
    });
    expect(monthlyData[1]).toEqual({
      month: "Jan 2026",
      income: 300,
      outcome: 0,
      profitPercent: 100,
    });
    expect(formatMovementPeriod(unsortedCrossYearMovements)).toBe(
      "Dec 2025 - Jan 2026",
    );
  });

  it("returns a zero profit margin for a month with no income", () => {
    const onlyOutcome: FinancialMovement = {
      ...sampleMovements[1],
      create_date: "2024-03-05",
    };

    expect(computeMonthlyData([onlyOutcome])).toEqual([
      {
        month: "Mar 2024",
        income: 0,
        outcome: 250,
        profitPercent: 0,
      },
    ]);
  });
});

describe("formatMovementPeriod", () => {
  it("returns one label when all movements share a month", () => {
    expect(formatMovementPeriod(sampleMovements.slice(0, 2))).toBe("Jan 2024");
  });

  it("reports an empty period when there are no movements", () => {
    expect(formatMovementPeriod([])).toBe("No data");
  });
});

describe("formatters", () => {
  it("formats currency without decimals", () => {
    expect(formatCurrency(1234.56)).toContain("USD");
    expect(formatCurrency(1234.56)).toContain("1,235");
  });

  it("formats percent with one decimal", () => {
    expect(formatPercent(15.555)).toBe("15.6%");
  });
});
