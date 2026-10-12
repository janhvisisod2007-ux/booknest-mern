import { useEffect, useState } from "react";
import api from "../api";
import BookCard from "../components/BookCard";
import { GENRES } from "../constants";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .get("/books", { params: { search: query, genre, page, limit: 8 } })
      .then(({ data }) => {
        if (cancelled) return;
        setBooks(data.books);
        setPages(data.pages);
      })
      .catch(() => !cancelled && setError("Could not load books. Is the server running?"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [query, genre, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQuery(searchInput.trim());
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by title or author"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <select
          value={genre}
          onChange={(e) => {
            setPage(1);
            setGenre(e.target.value);
          }}
          className="border rounded px-3 py-2 bg-white"
        >
          <option value="">All genres</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <button className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700">
          Search
        </button>
      </form>

      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
      {loading && <p className="text-gray-500">Loading books...</p>}

      {!loading && !error && books.length === 0 && (
        <p className="text-gray-500 text-center mt-10">No books found.</p>
      )}

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {books.map((b) => (
          <BookCard key={b._id} book={b} />
        ))}
      </div>

      {pages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 border rounded bg-white disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm">
            Page {page} of {pages}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border rounded bg-white disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}