import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard from "../components/ChartCard";
import { analysisFilterOptions } from "../data/mockData";
import { getChurnAnalysis } from "../services/api";

const initialFilters = {
  contract: "All Contracts",
  internetService: "All Services",
  tenureRange: "All Tenure",
  paymentMethod: "All Methods",
};

const chartColors = ["#2563EB", "#0F766E", "#B45309", "#DC2626"];

const renderBars = (dataKey, data) => (
  <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} maxBarSize={48}>
    {data.map((entry, index) => (
      <Cell key={`${entry.category}-${index}`} fill={chartColors[index % chartColors.length]} />
    ))}
  </Bar>
);

export default function ChurnAnalysis() {
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAnalysis() {
      try {
        setLoading(true);
        setError("");
        const response = await getChurnAnalysis(filters);
        if (active) {
          setData(response);
        }
      } catch {
        if (active) {
          setError("Unable to load churn analysis.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAnalysis();

    return () => {
      active = false;
    };
  }, [filters]);

  const filterSummary = useMemo(() => {
    if (!data) {
      return "Loading dataset slice";
    }

    return `${data.activeCount} records in current view${data.usedFallback ? " • showing full demo baseline" : ""}`;
  }, [data]);

  const barProps = {
    margin: { top: 12, right: 8, left: -18, bottom: 0 },
  };

  return (
    <div className="page-stack">
      <section className="filter-card">
        <div className="filter-card__header">
          <span>Filters</span>
          <span className="muted-text">{filterSummary}</span>
        </div>
        <div className="filter-grid">
          <label className="field">
            <span>Contract</span>
            <select
              value={filters.contract}
              onChange={(event) => setFilters((current) => ({ ...current, contract: event.target.value }))}
            >
              {analysisFilterOptions.contract.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Internet Service</span>
            <select
              value={filters.internetService}
              onChange={(event) =>
                setFilters((current) => ({ ...current, internetService: event.target.value }))
              }
            >
              {analysisFilterOptions.internetService.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Tenure Range</span>
            <select
              value={filters.tenureRange}
              onChange={(event) => setFilters((current) => ({ ...current, tenureRange: event.target.value }))}
            >
              {analysisFilterOptions.tenureRange.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Payment Method</span>
            <select
              value={filters.paymentMethod}
              onChange={(event) =>
                setFilters((current) => ({ ...current, paymentMethod: event.target.value }))
              }
            >
              {analysisFilterOptions.paymentMethod.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {error ? (
        <section className="panel" role="alert">
          <div className="empty-state">
            <p>{error}</p>
          </div>
        </section>
      ) : null}

      <section className="chart-grid chart-grid--two">
        <ChartCard title="Churn Rate by Contract" loading={loading}>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={data?.contractChart ?? []} {...barProps}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="category" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => `${value}%`} />
                {renderBars("rate", data?.contractChart ?? [])}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Churn Rate by Tenure" loading={loading}>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={data?.tenureChart ?? []} {...barProps}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="category" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => `${value}%`} />
                {renderBars("rate", data?.tenureChart ?? [])}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Churn Rate by Internet Service" loading={loading}>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={data?.internetChart ?? []} {...barProps}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="category" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => `${value}%`} />
                {renderBars("rate", data?.internetChart ?? [])}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Churn Rate by Payment Method" loading={loading}>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart
                data={data?.paymentChart ?? []}
                layout="vertical"
                margin={{ top: 12, right: 8, left: 20, bottom: 0 }}
              >
                <CartesianGrid horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="category" tickLine={false} axisLine={false} width={120} />
                <Tooltip formatter={(value) => `${value}%`} />
                {renderBars("rate", data?.paymentChart ?? [])}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Monthly Charges vs Churn" subtitle="Churn rate by charge band" loading={loading}>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={data?.chargeChart ?? []} {...barProps}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="category" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value, name) => (name === "averageCharge" ? `$${value}` : `${value}%`)} />
                <Bar dataKey="rate" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={54} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Tech Support vs Churn" loading={loading}>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={data?.techSupportChart ?? []} {...barProps}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="category" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => `${value}%`} />
                {renderBars("rate", data?.techSupportChart ?? [])}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>
    </div>
  );
}
