import { renderListWithTemplate } from "./utils.mjs";

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

export function movieCardTemplate(movie) {
    return `
        <li class="movie-card">
            <a href="/movie_pages/index.html?movie=${movie.id}">
                <img src="${movie.poster_path ? IMG_BASE + movie.poster_path : "/images/no-poster.jpg"}" alt="${movie.title}">
                <div class="movie-card__info">
                    <h2>${movie.title}</h2>
                    <p>${movie.release_date?.split("-")[0] ?? "N/A"} &bull; ★ ${movie.vote_average?.toFixed(1)}</p>
                </div>
            </a>
        </li>
    `;
}

function createListingFilter(itemsCount, genres) {
    return `
    <div class="listing-filter-box">
        <dialog id="listing-filter-modal">
            <select id="genre-filter">
                <option value="">All Genres</option>
                ${genres.map(g => `<option value="${g.id}">${g.name}</option>`).join("")}
            </select>
            <button id="rating-high-low">Rating: High to Low</button>
            <button id="rating-low-high">Rating: Low to High</button>
            <button id="year-newest">Newest First</button>
            <button id="year-oldest">Oldest First</button>
            <button id="listing-filter-closeBtn">Close</button>
        </dialog>
        <button id="listing-filter-openBtn">Filter</button>
        <p>Total Movies: ${itemsCount}</p>
    </div>`;
}

export default class MovieList {
    constructor(dataSource, listElement) {
        this.dataSource = dataSource;
        this.listElement = listElement;
        this.list = [];
        this.filters = {};
        this.currentPage = 1;
        this.loading = false;
    }

    async init() {
        const genres = await this.dataSource.getGenres();
        this.list = await this.dataSource.getMovies();

        this.listElement.insertAdjacentHTML(
            "beforebegin",
            createListingFilter(this.list.length, genres)
        );

        initListingFilter(this);
        this.renderList(this.list);
        this.initLazyLoad();
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
        const more = await this.dataSource.getMovies(this.filters, this.currentPage);
        this.list = [...this.list, ...more];
        this.renderList(more, true);
        this.loading = false;
    }

    initLazyLoad() {
        const sentinel = document.createElement("div");
        sentinel.classList.add("sentinel");
        this.listElement.insertAdjacentElement("afterend", sentinel);
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadMore();
                }
            });
        }, { threshold: 0.1 });
      
        observer.observe(sentinel);
    }
}

function initListingFilter(movieListInstance) {
    const modal = document.querySelector("#listing-filter-modal");
    const openBtn = document.querySelector("#listing-filter-openBtn");
    const closeBtn = document.querySelector("#listing-filter-closeBtn");
    
    openBtn.addEventListener("click", () => modal.showModal());
    closeBtn.addEventListener("click", () => modal.close());

    document.querySelector("#genre-filter").addEventListener("change", async (e) => {
        if (e.target.value) {
          movieListInstance.filters.with_genres = e.target.value;
        } else {
          delete movieListInstance.filters.with_genres;
        }
        movieListInstance.currentPage = 1;
        movieListInstance.list = await movieListInstance.dataSource.getMovies(movieListInstance.filters);
        movieListInstance.renderList(movieListInstance.list);
        modal.close();
    });

    document.querySelector("#rating-high-low").addEventListener("click", () => {
        movieListInstance.currentPage = 1;
        const sorted = [...movieListInstance.list].sort((a, b) => b.vote_average - a.vote_average);
        movieListInstance.renderList(sorted);
        modal.close();
    });

    document.querySelector("#rating-low-high").addEventListener("click", () => {
        movieListInstance.currentPage = 1;
        const sorted = [...movieListInstance.list].sort((a, b) => a.vote_average - b.vote_average);
        movieListInstance.renderList(sorted);
        modal.close();
    });

    document.querySelector("#year-newest").addEventListener("click", () => {
        movieListInstance.currentPage = 1;
        const sorted = [...movieListInstance.list].sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
        movieListInstance.renderList(sorted);
        modal.close();
    });

    document.querySelector("#year-oldest").addEventListener("click", () => {
        movieListInstance.currentPage = 1;
        const sorted = [...movieListInstance.list].sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
        movieListInstance.renderList(sorted);
        modal.close();
    });
}