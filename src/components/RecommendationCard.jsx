import { Lightbulb } from "lucide-react";

export default function RecommendationCard({ action }) {
  return (
    <section className="recommendation-card">
      <div className="recommendation-card__icon" aria-hidden="true">
        <Lightbulb size={16} />
      </div>
      <div>
        <div className="recommendation-card__label">Recommended action</div>
        <p>{action}</p>
      </div>
    </section>
  );
}
