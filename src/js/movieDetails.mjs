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

            // initialize OMDb rating
            await this.loadCriticRatings();
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
        if (!imdbId) return;

        try {
            const res = await fetch(
                `https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_KEY}`
            );

            if (!res.ok) throw new Error(`omdb request failed: ${res.status}`);

            const data = await res.json();

            if (data.Response === "False") throw new Error(`omdb: ${data.Error}`);

            // patch in imdb score — only show if value exists
            const imdbEl = document.querySelector("#rating-imdb .ratings__score");
            if (imdbEl && data.imdbRating && data.imdbRating !== "N/A") {
                imdbEl.textContent = data.imdbRating;
                document.querySelector("#rating-imdb").classList.remove("hidden");
            }

            // patch in rotten tomatoes
            const rt = data.Ratings?.find(r => r.Source === "Rotten Tomatoes");
            const rtEl = document.querySelector("#rating-rt .ratings__score");
            if (rtEl && rt?.Value) {
                rtEl.textContent = rt.Value;
                document.querySelector("#rating-rt").classList.remove("hidden");
            }

            // patch in metacritic
            const mcEl = document.querySelector("#rating-mc .ratings__score");
            if (mcEl && data.Metascore && data.Metascore !== "N/A") {
                mcEl.textContent = data.Metascore;
                document.querySelector("#rating-mc").classList.remove("hidden");
            }

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

                <div class="ratings">
                    <div class="ratings__item">
                        <span class="ratings__icon">★</span>
                        <span class="ratings__score">${movie.vote_average?.toFixed(1)}/10</span>
                        <span class="ratings__label">TMDb</span>
                    </div>
                    <div class="ratings__item hidden" id="rating-imdb">
                        <span class="ratings__label">IMDb:</span>
                        <span class="ratings__score"></span>
                    </div>
                    <div class="ratings__item hidden" id="rating-rt">
                        <span class="ratings__icon">🍅</span>
                        <span class="ratings__label">Rotten Tomatoes:</span>
                        <span class="ratings__score"></span>
                    </div>
                    <div class="ratings__item hidden" id="rating-mc">
                        <span class="ratings__label">Metacritic:</span>
                        <span class="ratings__score"></span>
                    </div>
                </div>

                <p class="movie-detail__runtime">${movie.runtime} min</p>
                <p class="movie-detail__overview">${movie.overview}</p>

                <div class="movie-detail__add">
                    <button id="addToWatchlist" data-id="${movie.id}">
                        + add to watchlist
                    </button>
                </div>
            </div>
        </section>
    `;
}