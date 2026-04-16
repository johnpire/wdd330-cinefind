import { getParam, loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

// get the movie title from the url to display on success page
const movieTitle = getParam("title");
const titleEl = document.querySelector(".success-movie-title");

if (titleEl && movieTitle) {
    titleEl.textContent = decodeURIComponent(movieTitle);
}