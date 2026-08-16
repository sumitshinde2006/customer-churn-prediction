export default function ChartCard({
  title,
  subtitle,
  children,
  loading = false,
  error = "",
  onRetry,
  action,
  className = "",
}) {
  return (
    <section className={`chart-card ${className}`.trim()}>
      <div className="chart-card__header">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {action}
      </div>

      {loading ? (
        <div className="chart-card__loader" aria-label={`${title} loading`}>
          <div className="skeleton skeleton--panel" />
        </div>
      ) : error ? (
        <div className="empty-state empty-state--compact" role="alert">
          <p>{error}</p>
          {onRetry ? (
            <button type="button" className="button button--secondary" onClick={onRetry}>
              Try again
            </button>
          ) : null}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
