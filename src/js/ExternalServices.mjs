const baseURL = import.meta.env.VITE_TMDB_BASE_URL;
const apiKey = import.meta.env.VITE_TMDB_API_KEY;

async function convertToJson(res) {
    const jsonResponse = res.json();
    if (res.ok) {
        return jsonResponse
    } else {
        throw { name: "servicesError", message: jsonResponse };
    }
}

export default class ExternalServices {
    // fetch popular movies, supports pagination
    async getMovies(page = 1) {
        const response = await fetch(
            `${baseURL}discover/movie?api_key=${apiKey}&sort_by=popularity.desc&page=${page}`
        );
        const data = await convertToJson(response);
        return data.results;
    }

    // fetch movies filtered by genre id
    async getMoviesByGenre(genreId, page = 1) {
        const response = await fetch(
            `${baseURL}discover/movie?api_key=${apiKey}&with_genres=${genreId}&page=${page}`
        );
        const data = await convertToJson(response);
        return data.results;
    }

    // fetch all available genres from tmdb
    async getGenres() {
        const response = await fetch(
            `${baseURL}genre/movie/list?api_key=${apiKey}`
        );
        const data = await convertToJson(response);
        return data.genres;
    }

    // fetch a single movie by its id
    async findMovieById(id) {
        if (!id) throw new Error("no movie id provided");
        const response = await fetch(
            `${baseURL}movie/${id}?api_key=${apiKey}&append_to_response=external_ids`
        );
        const data = await convertToJson(response);
    
        // lift imdb_id up to the top level for easy access
        data.imdb_id = data.external_ids?.imdb_id ?? null;
    
        return data;
    }

    // fetch trending movies this week
    async getTrending() {
        const response = await fetch(
            `${baseURL}trending/movie/week?api_key=${apiKey}`
        );
        const data = await convertToJson(response);
        return data.results;
    }

    // search movies by query string
    async searchMovies(query) {
        if (!query.trim()) throw new Error("empty search query");
        const response = await fetch(
            `${baseURL}search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`
        );
        const data = await convertToJson(response);
        return data.results;
    }

    // mock review submission — saves to localstorage
    async submitReview(payload) {
        if (!payload) throw new Error("no review payload provided");
        const existing = JSON.parse(localStorage.getItem("cine-reviews")) || [];
        existing.push(payload);
        localStorage.setItem("cine-reviews", JSON.stringify(existing));
        return { success: true };
    }
}