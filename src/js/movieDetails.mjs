import { getLocalStorage, setLocalStorage } from "./utils.mjs";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

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
                <p class="movie-detail__rating">★ ${movie.vote_average?.toFixed(1)} / 10</p>
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