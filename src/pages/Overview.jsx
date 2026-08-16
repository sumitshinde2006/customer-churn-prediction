import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import KpiCard from "../components/KpiCard";
import ChartCard from "../components/ChartCard";
import { getOverview } from "../services/api";

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOverview() {
      try {
        setLoading(true);
        setError("");
        const response = await getOverview();
        if (active) {
          setData(response);
        }
      } catch {
        if (active) {
          setError("Unable to load overview metrics.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page-stack">
      <section className="kpi-grid">
        {(data?.metrics ?? Array.from({ length: 4 }, () => null)).map((metric, index) => (
          <KpiCard
            key={metric?.id ?? `metric-${index}`}
            label={metric?.label}
            value={metric?.value}
            supportingText={metric?.supportingText}
            loading={loading}
          />
        ))}
      </section>

      {error ? (
        <section className="panel" role="alert">
          <div className="empty-state">
            <p>{error}</p>
          </div>
        </section>
      ) : null}

      <section className="chart-grid chart-grid--two">
        <ChartCard title="Churn Distribution" subtitle="Overall customer composition" loading={loading}>
          <div className="chart-wrap chart-wrap--donut">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data?.churnDistribution ?? []}
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={102}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {(data?.churnDistribution ?? []).map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value.toLocaleString()} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Churn Rate by Contract" subtitle="Observed churn rate by contract type" loading={loading}>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.churnByContract ?? []} margin={{ top: 12, right: 10, left: -12, bottom: 0 }}>
                <XAxis dataKey="category" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="rate" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={52} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Key observations</h2>
        </div>
        <div className="observation-list">
          {(data?.observations ?? []).map((observation) => (
            <article key={observation} className="observation-item">
              {observation}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
