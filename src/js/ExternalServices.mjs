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
    async getTrending() {
        const response = await fetch(`${baseURL}trending/movie/week?api_key=${apiKey}`);
        const data = await convertToJson(response);
        return data.results;
    }

    async getData(genre = null) {
        const endpoint = genre
            ? `${baseURL}discover/movie?api_key=${apiKey}&with_genres=${genre}`
            : `${baseURL}discover/movie?api_key=${apiKey}&sort_by=popularity.desc`;
        const response = await fetch(endpoint);
        const data = await convertToJson(response);
        return data.results;
    }

    async findMovieById(id) {
        const response = await fetch(`${baseURL}movie/${id}?api_key=${apiKey}`);
        return await convertToJson(response);
    }

    async searchMovies(query) {
        const response = await fetch(`${baseURL}search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`);
        const data = await convertToJson(response);
        return data.results;
    }

    async getGenres() {
        const response = await fetch(`${baseURL}genre/movie/list?api_key=${apiKey}`);
        const data = await convertToJson(response);
        return data.genres;
    }
}