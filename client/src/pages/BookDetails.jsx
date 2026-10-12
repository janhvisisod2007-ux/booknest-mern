import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import StarRating from "../components/StarRating";

export default function BookDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadBook = async () => {
    try {
      const { data } = await api.get(`/books/${id}`);
      setBook(data);
      const mine = user && data.reviews.find((r) => r.user?._id === user._id);
      if (mine) {
        setRating(mine.rating);
        setComment(mine.comment || "");
      }
    } catch (err) {
      setError(err.response?.status === 404 ? "Book not found" : "Could not load book");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="bg-red-100 text-red-700 p-3 rounded">{error}</p>;

  const isOwner = user && book.addedBy?._id === user._id;
  const myReview = user && book.reviews.find((r) => r.user?._id === user._id);

  const handleDeleteBook = async () => {
    if (!window.confirm("Delete this book and all its reviews?")) return;
    try {
      await api.delete(`/books/${id}`);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      if (myReview) {
        await api.put(`/reviews/${myReview._id}`, { rating, comment });
      } else {
        await api.post(`/books/${id}/reviews`, { rating, comment });
      }
      await loadBook();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not save review");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm("Delete your review?")) return;
    try {
      await api.delete(`/reviews/${myReview._id}`);
      setRating(5);
      setComment("");
      await loadBook();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-8">
      {/* Book info */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-6">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full md:w-56 h-72 object-cover rounded"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <div className="w-full md:w-56 h-72 bg-indigo-100 rounded flex items-center justify-center text-6xl">
            📖
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{book.title}</h1>
          <p className="text-gray-600 mt-1">by {book.author}</p>
          {book.genre && (
            <span className="inline-block mt-2 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
              {book.genre}
            </span>
          )}
          <div className="flex items-center gap-2 mt-3">
            <StarRating value={book.avgRating} />
            <span className="text-sm text-gray-600">
              {book.avgRating || "No ratings"} ({book.numReviews}{" "}
              {book.numReviews === 1 ? "review" : "reviews"})
            </span>
          </div>
          {book.description && <p className="mt-4 text-gray-700">{book.description}</p>}
          {book.addedBy?.name && (
            <p className="mt-4 text-sm text-gray-500">Added by {book.addedBy.name}</p>
          )}
          {isOwner && (
            <div className="mt-4 flex gap-3">
              <Link
                to={`/books/${book._id}/edit`}
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Edit
              </Link>
              <button
                onClick={handleDeleteBook}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review form */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {myReview ? "Your review" : "Write a review"}
        </h2>
        {user ? (
          <form onSubmit={handleSubmitReview} className="space-y-3">
            {formError && (
              <p className="bg-red-100 text-red-700 p-3 rounded text-sm">{formError}</p>
            )}
            <StarRating value={rating} onChange={setRating} />
            <textarea
              rows={3}
              placeholder="Share your thoughts (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <div className="flex gap-3">
              <button
                disabled={saving}
                className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : myReview ? "Update review" : "Submit review"}
              </button>
              {myReview && (
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  className="px-5 py-2 rounded border border-red-600 text-red-600 hover:bg-red-50"
                >
                  Delete review
                </button>
              )}
            </div>
          </form>
        ) : (
          <p className="text-gray-600">
            <Link to="/login" className="text-indigo-600 hover:underline">
              Login
            </Link>{" "}
            to write a review.
          </p>
        )}
      </div>

      {/* All reviews */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Reviews ({book.numReviews})</h2>
        {book.reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-3">
            {book.reviews.map((r) => (
              <div key={r._id} className="bg-white rounded-xl shadow p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.user?.name || "User"}</span>
                  <StarRating value={r.rating} />
                </div>
                {r.comment && <p className="mt-2 text-gray-700">{r.comment}</p>}
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}