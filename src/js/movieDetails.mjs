import { getLocalStorage, setLocalStorage } from "./utils.mjs";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const WATCHMODE_KEY = import.meta.env.VITE_WATCHMODE_API_KEY;

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

            // load streaming info after main content
            await this.loadStreamingInfo();
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

    // fetch and display streaming availability from watchmode
    async loadStreamingInfo() {
        const container = document.querySelector(".streaming-info");
        if (!container) return;

        try {
            // search watchmode for the movie by tmdb id
            const searchRes = await fetch(
                `https://api.watchmode.com/v1/search/?apiKey=${WATCHMODE_KEY}&search_field=tmdb_movie_id&search_value=${this.movieId}`
            );

            if (!searchRes.ok) throw new Error("watchmode search failed");
            const searchData = await searchRes.json();

            if (!searchData.title_results?.length) {
                container.innerHTML = `<p class="streaming-none">no streaming info available.</p>`;
                return;
            }

            const watchmodeId = searchData.title_results[0].id;

            // get streaming sources for the found title
            const sourcesRes = await fetch(
                `https://api.watchmode.com/v1/title/${watchmodeId}/sources/?apiKey=${WATCHMODE_KEY}`
            );

            if (!sourcesRes.ok) throw new Error("watchmode sources failed");
            const sources = await sourcesRes.json();

            // filter to subscription services only, remove duplicates by name
            const unique = sources
                .filter(s => s.type === "sub")
                .reduce((acc, s) => {
                    if (!acc.find(x => x.name === s.name)) acc.push(s);
                    return acc;
                }, []);

            if (!unique.length) {
                container.innerHTML = `<p class="streaming-none">not available on any streaming service.</p>`;
                return;
            }

            container.innerHTML = `
                <h3>available on</h3>
                <ul class="streaming-list">
                    ${unique.map(s => `
                        <li class="streaming-item">
                            <a href="${s.web_url}" target="_blank" rel="noopener noreferrer">
                                ${s.name}
                            </a>
                        </li>
                    `).join("")}
                </ul>
            `;
        } catch (err) {
            console.error("failed to load streaming info:", err);
            container.innerHTML = `<p class="streaming-none">streaming info unavailable.</p>`;
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
                <p class="movie-detail__rating">★ ${movie.vote_average?.toFixed(1)} / 10</p>
                <p class="movie-detail__runtime">${movie.runtime} min</p>
                <p class="movie-detail__overview">${movie.overview}</p>
                <div class="movie-detail__add">
                    <button id="addToWatchlist" data-id="${movie.id}">
                        + add to watchlist
                    </button>
                </div>

                <!-- watchmode streaming availability injected here -->
                <div class="streaming-info">
                    <p class="streaming-loading">loading streaming info...</p>
                </div>
            </div>
        </section>
    `;
}