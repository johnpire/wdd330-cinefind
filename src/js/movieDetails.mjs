import { getLocalStorage, setLocalStorage } from "./utils.mjs";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

export default class MovieDetails {
    constructor(movieId, dataSource) {
        this.movieId = movieId;
        this.dataSource = dataSource;
        this.movie = null;
    }

    async init() {
        this.movie = await this.dataSource.findMovieById(this.movieId);
        this.displayMovie();

        const button = document.getElementById("addToWatchlist");
        button.addEventListener("click", () => this.addToWatchlist());
    }

    addToWatchlist() {
        let watchlist = getLocalStorage("cine-watchlist");

        if (!watchlist) {
            watchlist = [];
        }

        const exists = watchlist.some((m) => m.id === this.movie.id);
        if (!exists) {
            watchlist.push(this.movie);
            setLocalStorage("cine-watchlist", watchlist);
        }
    }

    displayMovie() {
        const container = document.querySelector(".movie-detail");
        container.innerHTML = createMovieMarkup(this.movie);
    }
}

function createMovieMarkup(movie) {
    const genres = movie.genres?.map((g) => g.name).join(", ") ?? "N/A";
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
                        + Add to Watchlist
                    </button>
                </div>
            </div>
        </section>
    `;
}