import { getLocalStorage, setLocalStorage } from "./utils.mjs";

// takes a form element and returns an object where the key is the "name" of the form input
function formDataToJSON(formElement) {
    const formData = new FormData(formElement),
        convertedJSON = {};

    formData.forEach(function (value, key) {
        convertedJSON[key] = value;
    });

    return convertedJSON;
}

export default class ReviewProcess {
    constructor(movieId, movieTitle) {
        this.movieId = movieId;
        this.movieTitle = movieTitle;
    }

    // packages and saves the review to localstorage
    async submitReview() {
        const formElement = document.forms["review"];
        const formJSON = formDataToJSON(formElement);

        formJSON.movieId = this.movieId;
        formJSON.movieTitle = this.movieTitle;
        formJSON.submittedAt = new Date().toISOString();

        // get existing reviews or start fresh
        const existing = getLocalStorage("cine-reviews") || [];
        existing.push(formJSON);
        setLocalStorage("cine-reviews", existing);

        return formJSON;
    }
}