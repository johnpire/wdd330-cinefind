import { getParam, loadHeaderFooter } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import MovieDetails from "./movieDetails.mjs";

loadHeaderFooter();

const dataSource = new ExternalServices();
const movieId = getParam("movie");

const movie = new MovieDetails(movieId, dataSource);
movie.init();