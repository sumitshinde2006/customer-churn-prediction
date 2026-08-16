import { CalendarDays, CircleDot } from "lucide-react";

export default function Header({ title, description }) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <section className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <div className="page-header__meta">
        <div className="page-header__date">
          <CalendarDays size={15} />
          <span>{formattedDate}</span>
        </div>
        <div className="page-header__model">Model: XGBoost</div>
        <div className="status-pill status-pill--success">
          <CircleDot size={12} />
          <span>Model active</span>
        </div>
      </div>
    </section>
  );
}
