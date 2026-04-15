import { renderListWithTemplate } from "./utils.mjs";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

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
        // fetch and render genre tabs
        const genres = await this.dataSource.getGenres();
        this.renderGenres(genres);
        
        // fetch and render initial movies
        this.list = await this.dataSource.getMovies();
        this.renderList(this.list);
        
        // start lazy load observer
        this.initLazyLoad();

        // re-render genre UI on resize
        window.addEventListener("resize", () => {
            this.renderGenres(genres);
        });
    }

    renderGenres(genres) {
      if (window.innerWidth >= 641) {
        this.renderGenresDesktop(genres);
      } else {
        this.renderGenresMobile(genres);
      }
    }

    renderGenresDesktop(genres) {
        const container = document.querySelector(".genre-tabs");
        if (!container) return;

        // start collapsed, showing only the toggle label
        container.innerHTML = `
            <button class="genre-toggle active" data-id="">Genre</button>
            <div class="genre-options hidden">
                <button class="genre-tab active" data-id="">All</button>
                ${genres.map(g => `<button class="genre-tab" data-id="${g.id}">${g.name}</button>`).join("")}
            </div>
        `;

        const toggle = container.querySelector(".genre-toggle");
        const options = container.querySelector(".genre-options");

        // toggle collapse/expand
        toggle.addEventListener("click", () => {
            options.classList.toggle("hidden");
        });

        options.addEventListener("click", async (e) => {
            const tab = e.target.closest(".genre-tab");
            if (!tab) return;
            
            options.querySelectorAll(".genre-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            // update label to selected genre or back to "Genre"
            toggle.textContent = tab.dataset.id ? tab.textContent : "Genre";
            
            // collapse after selection
            options.classList.add("hidden");
            
            await this.switchGenre(tab.dataset.id || null);
        });
    }

    renderGenresMobile(genres) {
        const container = document.querySelector(".genre-tabs");
        if (!container) return;

        // dropdown select for mobile
        container.innerHTML = `
            <select class="genre-select">
                <option value="">All</option>
                ${genres.map(g => `<option value="${g.id}">${g.name}</option>`).join("")}
            </select>
        `;

        container.querySelector(".genre-select").addEventListener("change", async (e) => {
            await this.switchGenre(e.target.value || null);
        });
    }

    async switchGenre(genreId) {
        this.currentPage = 1;
        this.currentGenre = genreId;
        
        this.list = this.currentGenre
            ? await this.dataSource.getMoviesByGenre(this.currentGenre)
            : await this.dataSource.getMovies();
        
        this.renderList(this.list);
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

    async loadMore() {
        if (this.loading) return;
        this.loading = true;
        this.currentPage++;

        const more = this.currentGenre
            ? await this.dataSource.getMoviesByGenre(this.currentGenre, this.currentPage)
            : await this.dataSource.getMovies(this.currentPage);

        this.list = [...this.list, ...more];
        this.renderList(more, true);
        this.loading = false;
    }

    initLazyLoad() {
        // sentinel div at bottom triggers loadMore when visible
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