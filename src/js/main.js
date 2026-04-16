import ExternalServices from "./ExternalServices.mjs";
import MovieList from "./MovieList.mjs";
import { loadHeaderFooter, renderListWithTemplate } from "./utils.mjs";

loadHeaderFooter();

const dataSource = new ExternalServices();

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// trending section
function trendingCardTemplate(movie) {
    return `
        <li class="movie-card">
            <a href="/movie_pages/index.html?movie=${movie.id}">
                <img 
                    src="${movie.poster_path ? IMG_BASE + movie.poster_path : '/images/no-poster.jpg'}" 
                    alt="${movie.title}">
                <h2 class="movie-card__title">${movie.title}</h2>
                <p class="movie-card__year">${movie.release_date?.split("-")[0] ?? "N/A"}</p>
                <p class="movie-card__rating">★ ${movie.vote_average?.toFixed(1)}</p>
            </a>
        </li>
    `;
}

async function loadTrending() {
    const trendingList = document.querySelector(".trending-list");
    if (!trendingList) return;

    const movies = await dataSource.getTrending();
    renderListWithTemplate(trendingCardTemplate, trendingList, movies.slice(0, 8));
}

// search feature
async function handleSearch(query) {
    const resultsSection = document.querySelector(".search-results");
    const resultsList = document.querySelector(".search-results .movie-list");

    if (!query.trim()) return;

    const movies = await dataSource.searchMovies(query);
    resultsSection.classList.remove("hidden");
    renderListWithTemplate(trendingCardTemplate, resultsList, movies);
}

function initSearch() {
    const form = document.forms["search"];
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = form.querySelector("input[name='query']").value;
        handleSearch(query);
    });
}

// --- Init ---

loadTrending();
initSearch();