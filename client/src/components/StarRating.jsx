// Display mode: <StarRating value={4.5} />
// Input mode:   <StarRating value={rating} onChange={setRating} />
export default function StarRating({ value = 0, onChange }) {
  return (
    <span className="inline-flex">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const star = (
          <span className={filled ? "text-yellow-400" : "text-gray-300"}>★</span>
        );
        return onChange ? (
          <button
            type="button"
            key={n}
            onClick={() => onChange(n)}
            className="text-2xl leading-none"
            aria-label={`${n} star`}
          >
            {star}
          </button>
        ) : (
          <span key={n} className="text-lg leading-none">
            {star}
          </span>
        );
      })}
    </span>
  );
}