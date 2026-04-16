import { getParam, loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

// display the movie title that was just reviewed
const movieTitle = getParam("title");
const titleEl = document.querySelector(".success-movie-title");

if (titleEl && movieTitle) {
    titleEl.textContent = decodeURIComponent(movieTitle);
} else if (titleEl) {
    titleEl.textContent = "your movie";
}