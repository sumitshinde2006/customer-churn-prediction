import RiskBadge from "./RiskBadge";

export default function PredictionResult({ result, loading, error }) {
  if (loading) {
    return (
      <section className="panel panel--prediction">
        <div className="skeleton skeleton--text skeleton--label" />
        <div className="skeleton skeleton--text skeleton--hero" />
        <div className="skeleton skeleton--bar" />
        <div className="skeleton skeleton--text skeleton--meta" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel panel--prediction" role="alert">
        <div className="empty-state empty-state--compact">
          <p>{error}</p>
          <p className="muted-text">Try again with a complete customer profile.</p>
        </div>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="panel panel--prediction">
        <div className="empty-state empty-state--compact">
          <p>Enter customer details to estimate churn probability.</p>
        </div>
      </section>
    );
  }

  const probabilityPercent = Math.round(result.probability * 1000) / 10;

  return (
    <section className="panel panel--prediction">
      <div className="panel__eyebrow">Churn Probability</div>
      <div className="prediction-result__value">{probabilityPercent}%</div>
      <div className="prediction-result__status">
        <RiskBadge risk={`${result.risk} Risk`} />
      </div>
      <div className="probability-meter" aria-label={`Churn probability ${probabilityPercent}%`}>
        <div className="probability-meter__track">
          <div className="probability-meter__fill" style={{ width: `${probabilityPercent}%` }} />
        </div>
        <div className="probability-meter__labels">
          <span>0%</span>
          <span>{probabilityPercent}%</span>
          <span>100%</span>
        </div>
      </div>
      <div className="prediction-result__threshold">
        Prediction threshold: {Math.round(result.threshold * 100)}%
      </div>
    </section>
  );
}
