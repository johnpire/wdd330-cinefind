import ExternalServices from "./ExternalServices.mjs";
import MovieList from "./MovieList.mjs";
import { loadHeaderFooter, getParam } from "./utils.mjs";

loadHeaderFooter();

const genre = getParam("genre") || null;
const dataSource = new ExternalServices();
const listElement = document.querySelector(".movie-list");
const myList = new MovieList(genre, dataSource, listElement);
myList.init();