import { getParam, loadHeaderFooter } from "./utils.mjs";
import ReviewProcess from "./reviewProcess.mjs";

loadHeaderFooter();

// get movie info from url params passed from watchlist
const movieId = getParam("movie");
const movieTitle = getParam("title");

// display movie title above the form
const titleEl = document.querySelector(".review-movie-title");
if (titleEl && movieTitle) {
    titleEl.textContent = decodeURIComponent(movieTitle);
}

// validate that we have a movie to review
if (!movieId || !movieTitle) {
    const form = document.querySelector(".review-form-section");
    if (form) {
        form.innerHTML = `<p class="error-msg">no movie selected for review. <a href="/watchlist/index.html">go back to watchlist</a></p>`;
    }
}

const reviewProcess = new ReviewProcess(movieId, movieTitle);

document.forms["review"].addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        const review = await reviewProcess.submitReview();
        window.location.href = `/review/success.html?title=${encodeURIComponent(review.movieTitle)}`;
    } catch (err) {
        console.error("review submission failed:", err);
        alert(`submission failed: ${err.message}`);
    }
});