import ExternalServices from "./ExternalServices.mjs";
import { loadHeaderFooter, renderListWithTemplate } from "./utils.mjs";
import { movieCardTemplate } from "./MovieList.mjs";

loadHeaderFooter();

const dataSource = new ExternalServices();

// load and render trending movies on homepage
async function loadTrending() {
    const trendingList = document.querySelector(".trending .movie-list");
    if (!trendingList) return;

    try {
        const movies = await dataSource.getTrending();
        renderListWithTemplate(movieCardTemplate, trendingList, movies.slice(0, 8));
    } catch (err) {
        console.error("failed to load trending movies:", err);
        const trendingList = document.querySelector(".trending-list");
        if (trendingList) {
            trendingList.innerHTML = `<p class="error-msg">failed to load trending movies. please try again.</p>`;
        }
    }
}

// handle search form submission
async function handleSearch(query) {
    const resultsSection = document.querySelector(".search-results");
    const resultsList = document.querySelector(".search-results .movie-list");

    if (!query.trim()) return;

    try {
        const movies = await dataSource.searchMovies(query);

        if (movies.length === 0) {
            resultsSection.classList.remove("hidden");
            resultsList.innerHTML = `<p class="error-msg">no results found for "${query}".</p>`;
            return;
        }

        resultsSection.classList.remove("hidden");
        renderListWithTemplate(movieCardTemplate, resultsList, movies);
    } catch (err) {
        console.error("search failed:", err);
        resultsSection.classList.remove("hidden");
        resultsList.innerHTML = `<p class="error-msg">search failed. please try again.</p>`;
    }
}

// init search form listener
function initSearch() {
    const form = document.forms["search"];
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = form.querySelector("input[name='query']").value;
        handleSearch(query);
    });
}

loadTrending();
initSearch();