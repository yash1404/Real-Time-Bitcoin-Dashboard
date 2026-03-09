import './StatCard.css';

function StatCard({ title, value, subtitle, trend }) {
  const trendClass =
    trend === 'up' ? 'stat-card--up' : trend === 'down' ? 'stat-card--down' : '';

  return (
    <article className={`stat-card ${trendClass}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {trend && trend !== 'none' && (
          <span className="stat-card-trend" aria-hidden="true">
            {trend === 'up' ? '▲' : '▼'}
          </span>
        )}
      </div>
      <div className="stat-card-value">{value ?? '-'}</div>
      {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
    </article>
  );
}

export default StatCard;

