import { getLocalStorage, setLocalStorage } from "./utils.mjs";

// convert form element to plain json object
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

    // validate, package, and save review to localstorage
    async submitReview() {
        const formElement = document.forms["review"];
        if (!formElement) throw new Error("review form not found");

        const formJSON = formDataToJSON(formElement);

        // basic validation
        if (!formJSON.rating) throw new Error("rating is required");
        if (!formJSON.recommend) throw new Error("recommendation is required");
        if (!formJSON.description?.trim()) throw new Error("description is required");

        formJSON.movieId = this.movieId;
        formJSON.movieTitle = this.movieTitle;
        formJSON.submittedAt = new Date().toISOString();

        // append to existing reviews in localstorage
        const existing = getLocalStorage("cine-reviews") || [];
        existing.push(formJSON);
        setLocalStorage("cine-reviews", existing);

        return formJSON;
    }
}