import "./StatCard.css";

function StatCard({ label, value, color, variant }) {
    return (
        <div className={`stat-card${variant ? ` stat-card--${variant}` : ""}`}>
            <span className="stat-card__value" style={color ? { color } : {}}>
                {value ?? 0}
            </span>
            <span className="stat-card__label">{label}</span>
        </div>
    );
}

export default StatCard;
