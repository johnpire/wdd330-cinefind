import { getParam, loadHeaderFooter } from "./utils.mjs";
import ReviewProcess from "./reviewProcess.mjs";

loadHeaderFooter();

// get movie info passed via url params from watchlist
const movieId = getParam("movie");
const movieTitle = getParam("title");

// display the movie title on the form
const titleEl = document.querySelector(".review-movie-title");
if (titleEl) {
    titleEl.textContent = decodeURIComponent(movieTitle);
}

const reviewProcess = new ReviewProcess(movieId, movieTitle);

document.forms["review"].addEventListener("submit", async (event) => {
    event.preventDefault();

    // save review to localstorage and redirect to success page
    const review = await reviewProcess.submitReview();
    window.location.href = `/review/success.html?title=${encodeURIComponent(review.movieTitle)}`;
});