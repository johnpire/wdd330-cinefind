import { renderListWithTemplate } from "./utils.mjs";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// movie card template shared across pages
export function movieCardTemplate(movie) {
    return `
        <li class="movie-card">
            <a href="/movie_pages/index.html?movie=${movie.id}">
                <img
                    src="${movie.poster_path ? IMG_BASE + movie.poster_path : "/images/no-poster.jpg"}"
                    alt="${movie.title}">
                <div class="movie-card__info">
                    <h2>${movie.title}</h2>
                    <p>${movie.release_date?.split("-")[0] ?? "N/A"} &bull; ★ ${movie.vote_average?.toFixed(1)}</p>
                </div>
            </a>
        </li>
    `;
}

export default class MovieList {
    constructor(dataSource, listElement) {
        this.dataSource = dataSource;
        this.listElement = listElement;
        this.list = [];
        this.currentPage = 1;
        this.currentGenre = null;
        this.loading = false;
    }

    async init() {
        try {
            const genres = await this.dataSource.getGenres();
            this.list = await this.dataSource.getMovies();
            this.renderGenres(genres);
            this.renderList(this.list);
            this.initLazyLoad();

            // re-render genre ui on window resize
            let resizeTimer;
            window.addEventListener("resize", () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => this.renderGenres(genres), 200);
            });
        } catch (err) {
            console.error("failed to initialize movie list:", err);
            this.listElement.innerHTML = `<p class="error-msg">failed to load movies. please try again.</p>`;
        }
    }

    // render genre ui based on screen size
    renderGenres(genres) {
        if (window.innerWidth >= 641) {
            this.renderGenresDesktop(genres);
        } else {
            this.renderGenresMobile(genres);
        }
    }

    // desktop: collapsible pill tabs
    renderGenresDesktop(genres) {
        const container = document.querySelector(".genre-tabs");
        if (!container) return;

        container.innerHTML = `
            <button class="genre-toggle">Genre</button>
            <div class="genre-options hidden">
                <button class="genre-tab active" data-id="">All</button>
                ${genres.map(g => `<button class="genre-tab" data-id="${g.id}">${g.name}</button>`).join("")}
            </div>
        `;

        const toggle = container.querySelector(".genre-toggle");
        const options = container.querySelector(".genre-options");

        // toggle genre list visibility
        toggle.addEventListener("click", () => {
            options.classList.toggle("hidden");
        });

        // handle genre selection
        options.addEventListener("click", async (e) => {
            const tab = e.target.closest(".genre-tab");
            if (!tab) return;

            options.querySelectorAll(".genre-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            // update label to selected genre or reset to "Genre"
            toggle.textContent = tab.dataset.id ? tab.textContent : "Genre";
            options.classList.add("hidden");

            await this.switchGenre(tab.dataset.id || null);
        });
    }

    // mobile: native select dropdown
    renderGenresMobile(genres) {
        const container = document.querySelector(".genre-tabs");
        if (!container) return;

        container.innerHTML = `
            <select class="genre-select">
                <option value="">All Genres</option>
                ${genres.map(g => `<option value="${g.id}">${g.name}</option>`).join("")}
            </select>
        `;

        container.querySelector(".genre-select").addEventListener("change", async (e) => {
            await this.switchGenre(e.target.value || null);
        });
    }

    // switch genre, reset pagination, reload list
    async switchGenre(genreId) {
        try {
            this.currentPage = 1;
            this.currentGenre = genreId;

            this.list = this.currentGenre
                ? await this.dataSource.getMoviesByGenre(this.currentGenre)
                : await this.dataSource.getMovies();

            this.renderList(this.list);
        } catch (err) {
            console.error("failed to switch genre:", err);
            this.listElement.innerHTML = `<p class="error-msg">failed to load movies for this genre.</p>`;
        }
    }

    renderList(list, append = false) {
        renderListWithTemplate(
            movieCardTemplate,
            this.listElement,
            list,
            "beforeend",
            !append
        );
    }

    // load next page and append to existing list
    async loadMore() {
        if (this.loading) return;
        this.loading = true;

        try {
            this.currentPage++;
            const more = this.currentGenre
                ? await this.dataSource.getMoviesByGenre(this.currentGenre, this.currentPage)
                : await this.dataSource.getMovies(this.currentPage);

            this.list = [...this.list, ...more];
            this.renderList(more, true);
        } catch (err) {
            console.error("failed to load more movies:", err);
        } finally {
            this.loading = false;
        }
    }

    // observe sentinel element to trigger lazy loading
    initLazyLoad() {
        const sentinel = document.createElement("div");
        sentinel.classList.add("sentinel");
        this.listElement.insertAdjacentElement("afterend", sentinel);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) this.loadMore();
            });
        }, { threshold: 0.1 });

        observer.observe(sentinel);
    }
}