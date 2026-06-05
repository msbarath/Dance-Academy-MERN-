import './PageHero.css';

function PageHero({ title, highlight, subtitle }) {
  return (
    <div className="page-hero">
      <h1>
        {title} {highlight && <span>{highlight}</span>}
      </h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

export default PageHero;
