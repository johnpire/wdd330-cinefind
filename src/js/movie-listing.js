import ExternalServices from "./ExternalServices.mjs";
import MovieList from "./MovieList.mjs";
import { loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

const dataSource = new ExternalServices();
const listElement = document.querySelector(".movie-list");
const myList = new MovieList(dataSource, listElement);
myList.init();