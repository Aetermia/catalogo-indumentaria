import './CategoryFilter.css';

export default function CategoryFilter({ categories, active, onChange, sort, onSortChange, disabled }) {
  return (
    <div className="filter">
      <div className="filter__cats" role="group" aria-label="Filtrar por categoría">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className="filter__cat"
            aria-pressed={cat === active}
            onClick={() => onChange(cat)}
            disabled={disabled}
          >
            {cat}
          </button>
        ))}
      </div>
      <label className="filter__sort">
        <span className="filter__sort-label">Ordenar</span>
        <select className="input filter__select" value={sort} onChange={(e) => onSortChange(e.target.value)} disabled={disabled}>
          <option value="destacados">Destacados</option>
          <option value="menor">Menor precio</option>
          <option value="mayor">Mayor precio</option>
        </select>
      </label>
    </div>
  );
}
