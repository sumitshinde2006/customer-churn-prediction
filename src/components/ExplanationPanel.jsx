export default function ExplanationPanel({ title = "Why this customer may churn", result }) {
  if (!result) {
    return (
      <section className="panel">
        <div className="panel__header">
          <h2>{title}</h2>
        </div>
        <div className="empty-state empty-state--compact">
          <p>Factors influencing the prediction will appear after a churn estimate is available.</p>
        </div>
      </section>
    );
  }

  const probabilityPercent = Math.round(result.probability * 1000) / 10;

  return (
    <section className="panel">
      <div className="panel__header panel__header--space">
        <div>
          <h2>{title}</h2>
          <p>Factors influencing the prediction</p>
        </div>
        <div className="panel__summary">
          <span>{probabilityPercent}% probability</span>
          <span>{result.risk} risk</span>
        </div>
      </div>

      <div className="factor-list">
        {result.factors.map((factor) => {
          const width = `${Math.max(factor.impact * 100, 12)}%`;
          return (
            <div key={`${factor.feature}-${factor.value}`} className="factor-row">
              <div className="factor-row__content">
                <div className="factor-row__title">
                  <strong>{factor.feature}</strong>
                  <span>{factor.value}</span>
                </div>
                <div className="factor-row__label">{factor.label}</div>
              </div>
              <div className="factor-row__bar">
                <div
                  className={`factor-row__fill factor-row__fill--${factor.direction}`}
                  style={{ width }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
