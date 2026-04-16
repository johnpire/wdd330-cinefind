import { getLocalStorage, setLocalStorage, loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// build each watchlist item card
function watchlistItemTemplate(movie) {
    return `
        <li class="watchlist-card divider">
            <a href="/movie_pages/index.html?movie=${movie.id}" class="watchlist-card__image">
                <img
                    src="${movie.poster_path ? IMG_BASE + movie.poster_path : "/images/no-poster.jpg"}"
                    alt="${movie.title}">
            </a>
            <div class="watchlist-card__info">
                <h2>${movie.title}</h2>
                <p>${movie.release_date?.split("-")[0] ?? "N/A"} &bull; ★ ${movie.vote_average?.toFixed(1)}</p>
            </div>
            <div class="watchlist-card__actions">
                <a href="/review/index.html?movie=${movie.id}&title=${encodeURIComponent(movie.title)}" class="btn btn-primary">review</a>
                <button class="remove-item btn btn-outline" data-id="${movie.id}">remove</button>
            </div>
        </li>
    `;
}

// remove movie from watchlist by id and re-render
function removeFromWatchlist(id) {
    let items = getLocalStorage("cine-watchlist") || [];
    items = items.filter(movie => movie.id !== Number(id));
    setLocalStorage("cine-watchlist", items);
    renderWatchlistContents();
}

// render all watchlist items or show empty state
function renderWatchlistContents() {
    const items = getLocalStorage("cine-watchlist") || [];
    const list = document.querySelector(".watchlist-list");

    if (!list) return;

    if (items.length === 0) {
        list.innerHTML = `
            <p class="watchlist-empty">
                your watchlist is empty.
                <a href="/movie_listing/index.html">browse movies</a>
            </p>
        `;
        return;
    }

    list.innerHTML = items.map(watchlistItemTemplate).join("");
}

// delegate remove clicks to watchlist list
document.querySelector(".watchlist-list").addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-item")) {
        removeFromWatchlist(e.target.dataset.id);
    }
});

renderWatchlistContents();