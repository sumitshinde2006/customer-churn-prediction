export default function KpiCard({ label, value, supportingText, loading = false }) {
  if (loading) {
    return (
      <article className="kpi-card">
        <div className="skeleton skeleton--text skeleton--label" />
        <div className="skeleton skeleton--text skeleton--value" />
        <div className="skeleton skeleton--text skeleton--meta" />
      </article>
    );
  }

  return (
    <article className="kpi-card">
      <span className="kpi-card__label">{label}</span>
      <strong className="kpi-card__value">{value}</strong>
      <span className="kpi-card__supporting">{supportingText}</span>
    </article>
  );
}
