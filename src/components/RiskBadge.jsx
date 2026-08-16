export default function RiskBadge({ risk }) {
  const label = risk ?? "Medium";
  const tone = label.toLowerCase().split(" ")[0];

  return (
    <span className={`risk-badge risk-badge--${tone}`}>
      <span className="risk-badge__dot" aria-hidden="true" />
      <span>{label.toUpperCase()}</span>
    </span>
  );
}
