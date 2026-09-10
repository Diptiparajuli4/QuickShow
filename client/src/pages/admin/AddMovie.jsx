import React, { useState, useMemo } from "react";
import Title from "../../components/admin/Title";
import toast from "react-hot-toast";
import { dummyShowsData } from "../../assets/assets";

const AddMovie = () => {
    const [form, setForm] = useState({
        _id: "",
        title: "",
        overview: "",
        poster_path: "",
        backdrop_path: "",
        release_date: "",
        runtime: "",
        vote_average: "",
        original_language: "en",
        genres: "",
        tagline: "",
        casts: [],        // ← array of { name, profile_path }
    });

    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    // =====================================================
    // FILTER SUGGESTIONS
    // =====================================================
    const filteredSuggestions = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return dummyShowsData;

        return dummyShowsData.filter((movie) => {
            const title = (movie.title || "").toLowerCase();
            const id = String(movie._id || "").toLowerCase();
            return title.includes(q) || id.includes(q);
        });
    }, [searchQuery]);

    // =====================================================
    // PICK A MOVIE → FILL FORM
    // =====================================================
    const handlePickMovie = (movie) => {
        const genresString = Array.isArray(movie.genres)
            ? movie.genres
                  .map((g) => (typeof g === "string" ? g : g?.name))
                  .filter(Boolean)
                  .join(", ")
            : "";

        // Casts → array of { name, profile_path }
        const castsArray = Array.isArray(movie.casts)
            ? movie.casts.map((c) => {
                  if (typeof c === "string") {
                      return {
                          name: c,
                          profile_path: `https://ui-avatars.com/api/?name=${encodeURIComponent(c)}&size=200&background=1e40af&color=fff`,
                      };
                  }
                  return {
                      name: c?.name || "",
                      profile_path: c?.profile_path || "",
                  };
              })
            : [];

        setForm({
            _id: String(movie._id || ""),
            title: movie.title || "",
            overview: movie.overview || "",
            poster_path: movie.poster_path || "",
            backdrop_path: movie.backdrop_path || "",
            release_date: movie.release_date || "",
            runtime: movie.runtime ? String(movie.runtime) : "",
            vote_average: movie.vote_average
                ? String(movie.vote_average)
                : "",
            original_language: movie.original_language || "en",
            genres: genresString,
            tagline: movie.tagline || "",
            casts: castsArray,
        });

        setSearchQuery(movie.title || "");
        setShowSuggestions(false);

        toast.success(`Loaded "${movie.title}" — review and save`);
    };

    // =====================================================
    // FORM CHANGE
    // =====================================================
    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    // =====================================================
    // CAST HANDLERS
    // =====================================================
    const handleCastChange = (index, field, value) => {
        setForm((prev) => {
            const updated = [...prev.casts];
            updated[index] = { ...updated[index], [field]: value };

            // Auto-generate avatar if name changes and image is empty
            if (
                field === "name" &&
                (!updated[index].profile_path ||
                    updated[index].profile_path.includes("ui-avatars.com"))
            ) {
                updated[index].profile_path = value
                    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          value
                      )}&size=200&background=1e40af&color=fff`
                    : "";
            }

            return { ...prev, casts: updated };
        });
    };

    const handleAddCast = () => {
        setForm((prev) => ({
            ...prev,
            casts: [...prev.casts, { name: "", profile_path: "" }],
        }));
    };

    const handleRemoveCast = (index) => {
        setForm((prev) => ({
            ...prev,
            casts: prev.casts.filter((_, i) => i !== index),
        }));
    };

    // =====================================================
    // SUBMIT
    // =====================================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form._id || !form.title || !form.release_date) {
            toast.error("TMDB ID, Title, and Release Date are required");
            return;
        }

        try {
            setSaving(true);

            const token =
                localStorage.getItem("adminToken") ||
                localStorage.getItem("token");

            // Clean up casts: remove empty names
            const castsArray = form.casts
                .filter((c) => c.name && c.name.trim())
                .map((c) => ({
                    name: c.name.trim(),
                    profile_path:
                        c.profile_path ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            c.name.trim()
                        )}&size=200&background=1e40af&color=fff`,
                }));

            const payload = {
                _id: String(form._id),
                title: form.title,
                overview: form.overview,
                poster_path: form.poster_path,
                backdrop_path: form.backdrop_path,
                release_date: form.release_date,
                runtime: Number(form.runtime) || 0,
                vote_average: Number(form.vote_average) || 0,
                original_language: form.original_language || "en",
                tagline: form.tagline,
                genres: form.genres
                    .split(",")
                    .map((g) => g.trim())
                    .filter(Boolean)
                    .map((name, i) => ({ id: i, name })),
                casts: castsArray,
            };

            const res = await fetch("http://localhost:5000/movie/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to add movie");
            }

            toast.success("Movie added successfully!");

            setForm({
                _id: "",
                title: "",
                overview: "",
                poster_path: "",
                backdrop_path: "",
                release_date: "",
                runtime: "",
                vote_average: "",
                original_language: "en",
                genres: "",
                tagline: "",
                casts: [],
            });
            setSearchQuery("");
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Failed to add movie");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Title text1="Add" text2="Movie" />

            {/* ================================================= */}
            {/* SUGGESTION SEARCH BOX */}
            {/* ================================================= */}
            <div className="mt-8 max-w-3xl relative">
                <label className="block text-sm font-medium mb-1">
                    Search from suggestions
                </label>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Type a movie title or TMDB ID..."
                    className="w-full border border-gray-600 rounded p-2 bg-transparent text-white focus:outline-none focus:border-primary"
                />

                {showSuggestions && (
                    <div className="absolute z-20 mt-1 w-full max-h-80 overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg shadow-2xl">
                        {filteredSuggestions.length === 0 ? (
                            <div className="px-4 py-3 text-gray-500 text-sm">
                                No suggestions match "{searchQuery}"
                            </div>
                        ) : (
                            filteredSuggestions.map((movie) => (
                                <button
                                    key={movie._id}
                                    type="button"
                                    onClick={() => handlePickMovie(movie)}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800 transition text-left"
                                >
                                    {movie.poster_path && (
                                        <img
                                            src={movie.poster_path}
                                            alt={movie.title}
                                            className="w-10 h-14 object-cover rounded flex-shrink-0"
                                            onError={(e) =>
                                                (e.currentTarget.style.display =
                                                    "none")
                                            }
                                        />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-white text-sm font-medium truncate">
                                            {movie.title}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {movie.release_date || "—"}
                                            {" • "}
                                            TMDB {movie._id}
                                            {movie.original_language && (
                                                <> • {movie.original_language}</>
                                            )}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* ================================================= */}
            {/* FORM */}
            {/* ================================================= */}
            <form
                onSubmit={handleSubmit}
                className="mt-8 max-w-3xl space-y-4"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            TMDB ID *
                        </label>
                        <input
                            type="text"
                            value={form._id}
                            onChange={(e) => handleChange("_id", e.target.value)}
                            className="w-full border border-gray-600 rounded p-2 bg-transparent text-white"
                            placeholder="e.g. 1184918"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                            className="w-full border border-gray-600 rounded p-2 bg-transparent text-white"
                            placeholder="The Wild Robot"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Release Date *
                        </label>
                        <input
                            type="date"
                            value={form.release_date}
                            onChange={(e) =>
                                handleChange("release_date", e.target.value)
                            }
                            className="w-full border border-gray-600 rounded p-2 bg-transparent text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Runtime (minutes)
                        </label>
                        <input
                            type="number"
                            value={form.runtime}
                            onChange={(e) => handleChange("runtime", e.target.value)}
                            className="w-full border border-gray-600 rounded p-2 bg-transparent text-white"
                            placeholder="102"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Vote Average
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={form.vote_average}
                            onChange={(e) =>
                                handleChange("vote_average", e.target.value)
                            }
                            className="w-full border border-gray-600 rounded p-2 bg-transparent text-white"
                            placeholder="8.4"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Original Language
                        </label>
                        <input
                            type="text"
                            value={form.original_language}
                            onChange={(e) =>
                                handleChange("original_language", e.target.value)
                            }
                            className="w-full border border-gray-600 rounded p-2 bg-transparent text-white"
                            placeholder="en"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Poster URL
                    </label>
                    <input
                        type="text"
                        value={form.poster_path}
                        onChange={(e) =>
                            handleChange("poster_path", e.target.value)
                        }
                        className="w-full border border-gray-600 rounded p-2 bg-transparent text-white"
                        placeholder="https://image.tmdb.org/t/p/w500/..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Backdrop URL
                    </label>
                    <input
                        type="text"
                        value={form.backdrop_path}
                        onChange={(e) =>
                            handleChange("backdrop_path", e.target.value)
                        }
                        className="w-full border border-gray-600 rounded p-2 bg-transparent text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Genres (comma-separated)
                    </label>
                    <input
                        type="text"
                        value={form.genres}
                        onChange={(e) => handleChange("genres", e.target.value)}
                        className="w-full border border-gray-600 rounded p-2 bg-transparent text-white"
                        placeholder="Action, Adventure, Sci-Fi"
                    />
                </div>

                {/* ================================================= */}
                {/* CASTS WITH IMAGES */}
                {/* ================================================= */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium">
                            Casts / Actors
                        </label>
                        <button
                            type="button"
                            onClick={handleAddCast}
                            className="text-xs bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 px-3 py-1 rounded transition"
                        >
                            + Add Cast
                        </button>
                    </div>

                    {form.casts.length === 0 ? (
                        <div className="text-xs text-gray-500 border border-dashed border-gray-700 rounded p-3 text-center">
                            No cast members yet. Click "Add Cast" to add one.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {form.casts.map((cast, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-2 bg-gray-900/50 border border-gray-700 rounded p-2"
                                >
                                    {/* Preview */}
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 flex-shrink-0 border border-gray-700">
                                        {cast.profile_path ? (
                                            <img
                                                src={cast.profile_path}
                                                alt={cast.name || "Cast"}
                                                className="w-full h-full object-cover"
                                                onError={(e) =>
                                                    (e.currentTarget.style.display =
                                                        "none")
                                                }
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                                ?
                                            </div>
                                        )}
                                    </div>

                                    {/* Inputs */}
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            value={cast.name}
                                            onChange={(e) =>
                                                handleCastChange(
                                                    index,
                                                    "name",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Actor name"
                                            className="w-full border border-gray-600 rounded p-2 bg-transparent text-white text-sm"
                                        />
                                        <input
                                            type="text"
                                            value={cast.profile_path}
                                            onChange={(e) =>
                                                handleCastChange(
                                                    index,
                                                    "profile_path",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Image URL (optional)"
                                            className="w-full border border-gray-600 rounded p-2 bg-transparent text-white text-sm"
                                        />
                                    </div>

                                    {/* Remove */}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveCast(index)}
                                        className="text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition text-lg leading-none"
                                        title="Remove"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                        Image URL खाली छोड्नुभयो भने नामबाट automatic avatar बन्छ।
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Tagline
                    </label>
                    <input
                        type="text"
                        value={form.tagline}
                        onChange={(e) => handleChange("tagline", e.target.value)}
                        className="w-full border border-gray-600 rounded p-2 bg-transparent text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Overview
                    </label>
                    <textarea
                        rows={4}
                        value={form.overview}
                        onChange={(e) =>
                            handleChange("overview", e.target.value)
                        }
                        className="w-full border border-gray-600 rounded p-2 bg-transparent text-white"
                    />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className={`bg-primary text-white px-8 py-2 rounded transition ${
                        saving
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-primary/90 cursor-pointer"
                    }`}
                >
                    {saving ? "Saving..." : "Add Movie"}
                </button>
            </form>
        </>
    );
};

export default AddMovie;