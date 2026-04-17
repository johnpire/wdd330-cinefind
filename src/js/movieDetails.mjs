import { getLocalStorage, setLocalStorage } from "./utils.mjs";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const OMDB_KEY = import.meta.env.VITE_OMDB_API_KEY;

export default class MovieDetails {
    constructor(movieId, dataSource) {
        this.movieId = movieId;
        this.dataSource = dataSource;
        this.movie = null;
    }

    async init() {
        try {
            this.movie = await this.dataSource.findMovieById(this.movieId);
            this.displayMovie();

            const button = document.getElementById("addToWatchlist");
            if (!button) throw new Error("addToWatchlist button not found");
            button.addEventListener("click", () => this.addToWatchlist());
        } catch (err) {
            console.error("failed to load movie details:", err);
            const container = document.querySelector(".movie-detail");
            if (container) {
                container.innerHTML = `<p class="error-msg">failed to load movie details. please try again.</p>`;
            }
        }
    }

    // add movie to watchlist, prevent duplicates
    addToWatchlist() {
        let watchlist = getLocalStorage("cine-watchlist") || [];
        const exists = watchlist.some(m => m.id === this.movie.id);

        if (exists) {
            alert("this movie is already in your watchlist.");
            return;
        }

        watchlist.push(this.movie);
        setLocalStorage("cine-watchlist", watchlist);
        alert(`"${this.movie.title}" added to your watchlist!`);
    }

    displayMovie() {
        const container = document.querySelector(".movie-detail");
        if (!container) return;
        container.innerHTML = createMovieMarkup(this.movie);
    }

    // OMDb ratings
    async loadCriticRatings() {
        const imdbId = this.movie.imdb_id;
        console.log("imdb_id:", imdbId);
        if (!imdbId) return;

        try {
            const url = `https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_KEY}`;
            const res = await fetch(url);
            const data = await res.json();
            console.log("omdb response:", data);

            if (data.Response === "False") {
                console.warn("omdb error:", data.Error);
                return;
            }

            // patch in imdb score
            const imdbEl = document.querySelector("#rating-imdb .ratings__score");
            if (imdbEl) imdbEl.textContent = data.imdbRating ?? "n/a";

            // patch in rotten tomatoes
            const rt = data.Ratings?.find(r => r.Source === "Rotten Tomatoes");
            const rtEl = document.querySelector("#rating-rt .ratings__score");
            if (rtEl) rtEl.textContent = rt?.Value ?? "n/a";

            // patch in metacritic
            const mcEl = document.querySelector("#rating-mc .ratings__score");
            if (mcEl) mcEl.textContent = data.Metascore !== "N/A" ? `${data.Metascore}` : "n/a";

        } catch (err) {
            console.error("failed to load critic ratings:", err);
        }
    }
}

// build movie detail html from tmdb data
function createMovieMarkup(movie) {
    const genres = movie.genres?.map(g => g.name).join(", ") ?? "N/A";
    const year = movie.release_date?.split("-")[0] ?? "N/A";
    const poster = movie.poster_path
        ? IMG_BASE + movie.poster_path
        : "/images/no-poster.jpg";

    return `
        <section class="movie-detail">
            <img src="${poster}" alt="${movie.title}">
            <div class="movie-detail__info">
                <h2>${movie.title}</h2>
                <p class="movie-detail__meta">${year} &bull; ${genres}</p>
                <p class="movie-detail__runtime">${movie.runtime} min</p>
                <p class="movie-detail__overview">${movie.overview}</p>

                <div class="ratings">
                    <div class="ratings__item">
                        <span class="ratings__score">${movie.vote_average?.toFixed(1)}</span>
                        <span class="ratings__label">TMDb</span>
                    </div>
                    <div class="ratings__item" id="rating-imdb">
                        <span class="ratings__score">—</span>
                        <span class="ratings__label">IMDb</span>
                    </div>
                    <div class="ratings__item" id="rating-rt">
                        <span class="ratings__score">—</span>
                        <span class="ratings__label">Rotten Tomatoes</span>
                    </div>
                    <div class="ratings__item" id="rating-mc">
                        <span class="ratings__score">—</span>
                        <span class="ratings__label">Metacritic</span>
                    </div>
                </div>

                <div class="movie-detail__add">
                    <button id="addToWatchlist" data-id="${movie.id}">
                        + add to watchlist
                    </button>
                </div>
            </div>
        </section>
    `;
}