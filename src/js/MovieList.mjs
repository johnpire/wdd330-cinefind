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

function createListingFilter(itemsCount) {
    return `
    <div class="listing-filter-box">
        <dialog id="listing-filter-modal">
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
    constructor(genre, dataSource, listElement) {
        this.genre = genre;
        this.dataSource = dataSource;
        this.listElement = listElement;
        this.list = [];
    }

    async init() {
        this.list = await this.dataSource.getData(this.genre);

        this.listElement.insertAdjacentHTML(
            "beforebegin",
            createListingFilter(this.list.length)
        );

        initListingFilter(this);
        this.renderList(this.list);
    }

    renderList(list) {
      renderListWithTemplate(movieCardTemplate, this.listElement, list, "afterbegin", true);
    }
}

function initListingFilter(movieListInstance) {
    const modal = document.querySelector("#listing-filter-modal");
    const openBtn = document.querySelector("#listing-filter-openBtn");
    const closeBtn = document.querySelector("#listing-filter-closeBtn");

    openBtn.addEventListener("click", () => modal.showModal());
    closeBtn.addEventListener("click", () => modal.close());

    document.querySelector("#rating-high-low").addEventListener("click", () => {
        const sorted = [...movieListInstance.list].sort(
            (a, b) => b.vote_average - a.vote_average
        );
        movieListInstance.renderList(sorted);
        modal.close();
    });

    document.querySelector("#rating-low-high").addEventListener("click", () => {
        const sorted = [...movieListInstance.list].sort(
            (a, b) => a.vote_average - b.vote_average
        );
        movieListInstance.renderList(sorted);
        modal.close();
    });

    document.querySelector("#year-newest").addEventListener("click", () => {
        const sorted = [...movieListInstance.list].sort(
            (a, b) => new Date(b.release_date) - new Date(a.release_date)
        );
        movieListInstance.renderList(sorted);
        modal.close();
    });

    document.querySelector("#year-oldest").addEventListener("click", () => {
        const sorted = [...movieListInstance.list].sort(
            (a, b) => new Date(a.release_date) - new Date(b.release_date)
        );
        movieListInstance.renderList(sorted);
        modal.close();
    });
}