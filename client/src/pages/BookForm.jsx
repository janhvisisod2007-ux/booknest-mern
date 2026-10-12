import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { GENRES } from "../constants";

export default function BookForm() {
  const { id } = useParams(); // present only in edit mode
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    author: "",
    genre: "",
    coverImage: "",
    description: "",
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/books/${id}`)
      .then(({ data }) => {
        if (data.addedBy?._id !== user._id) {
          navigate("/");
          return;
        }
        setForm({
          title: data.title || "",
          author: data.author || "",
          genre: data.genre || "",
          coverImage: data.coverImage || "",
          description: data.description || "",
        });
      })
      .catch(() => setError("Could not load book"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const { data } = isEdit
        ? await api.put(`/books/${id}`, form)
        : await api.post("/books", form);
      navigate(`/books/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save book");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;

  const input =
    "w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? "Edit book" : "Add a book"}</h1>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          placeholder="Title *"
          value={form.title}
          onChange={handleChange}
          required
          className={input}
        />
        <input
          name="author"
          placeholder="Author *"
          value={form.author}
          onChange={handleChange}
          required
          className={input}
        />
        <select
          name="genre"
          value={form.genre}
          onChange={handleChange}
          className={input + " bg-white"}
        >
          <option value="">Select genre</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <input
          name="coverImage"
          placeholder="Cover image URL (optional)"
          value={form.coverImage}
          onChange={handleChange}
          className={input}
        />
        <textarea
          name="description"
          rows={4}
          placeholder="Description (optional)"
          value={form.description}
          onChange={handleChange}
          className={input}
        />
        <button
          disabled={saving}
          className="w-full bg-indigo-600 text-white py-2 rounded font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : isEdit ? "Update book" : "Add book"}
        </button>
      </form>
    </div>
  );
}