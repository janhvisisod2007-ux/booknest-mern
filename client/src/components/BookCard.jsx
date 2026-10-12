import { Link } from "react-router-dom";
import StarRating from "./StarRating";

export default function BookCard({ book }) {
  return (
    <Link
      to={`/books/${book._id}`}
      className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden flex flex-col"
    >
      {book.coverImage ? (
        <img
          src={book.coverImage}
          alt={book.title}
          className="h-48 w-full object-cover"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      ) : (
        <div className="h-48 bg-indigo-100 flex items-center justify-center text-5xl">📖</div>
      )}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg leading-tight">{book.title}</h3>
        <p className="text-sm text-gray-600">{book.author}</p>
        {book.genre && (
          <span className="mt-2 self-start text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
            {book.genre}
          </span>
        )}
        <div className="mt-auto pt-3 flex items-center gap-2 text-sm">
          <StarRating value={book.avgRating} />
          <span className="text-gray-500">
            {book.avgRating || "No ratings"} ({book.numReviews})
          </span>
        </div>
      </div>
    </Link>
  );
}