import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { RotateCw } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import {
  type FinancialMovement,
  type KPIMetrics,
  type MonthlyDataPoint,
} from "@/lib/financial-types";
import {
  computeKPIs,
  computeMonthlyData,
  formatMovementPeriod,
} from "@/lib/financial-utils";

const IncomeOutcomeChart = lazy(() =>
  import("@/components/dashboard/income-outcome-chart").then((module) => ({
    default: module.IncomeOutcomeChart,
  })),
);
const ProfitPercentChart = lazy(() =>
  import("@/components/dashboard/profit-percent-chart").then((module) => ({
    default: module.ProfitPercentChart,
  })),
);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function fetchFinancialData(signal: AbortSignal): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json();
}

function App() {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("Loading period...");
  const [retryCount, setRetryCount] = useState(0);
  const [chartsInView, setChartsInView] = useState(false);
  const chartSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchFinancialData(controller.signal)
      .then((movements) => {
        setMetrics(computeKPIs(movements));
        setMonthlyData(computeMonthlyData(movements));
        setPeriod(formatMovementPeriod(movements));
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setError(
          "No se pudo cargar la informacion financiera. Revisa la API de backend.",
        );
        setPeriod("Unavailable");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [retryCount]);

  useEffect(() => {
    if (chartsInView || !chartSectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setChartsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(chartSectionRef.current);
    return () => observer.disconnect();
  }, [chartsInView]);

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader period={period} />

          {error ? (
            <div
              role="alert"
              className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground sm:flex-row sm:items-center sm:justify-between"
            >
              <span>{error}</span>
              <button
                type="button"
                className="inline-flex min-h-9 items-center justify-center gap-2 self-start rounded-md border border-destructive/40 px-3 py-1.5 font-medium hover:bg-destructive/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-auto"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  setRetryCount((count) => count + 1);
                }}
              >
                <RotateCw size={16} aria-hidden="true" />
                Retry
              </button>
            </div>
          ) : null}

          <section aria-label="Key performance indicators">
            <KPIRow metrics={metrics} loading={loading} />
          </section>

          <section
            ref={chartSectionRef}
            aria-label="Financial charts"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            {chartsInView ? (
              <>
                <Suspense fallback={<ChartPlaceholder />}>
                  <IncomeOutcomeChart data={monthlyData} loading={loading} />
                </Suspense>
                <Suspense fallback={<ChartPlaceholder />}>
                  <ProfitPercentChart data={monthlyData} loading={loading} />
                </Suspense>
              </>
            ) : (
              <>
                <ChartPlaceholder />
                <ChartPlaceholder />
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function ChartPlaceholder() {
  return (
    <div
      role="status"
      aria-label="Loading chart"
      className="min-h-[420px] animate-pulse rounded-lg border border-border/60 bg-card"
    />
  );
}

export default App;
