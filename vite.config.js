import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",

build: {
  outDir: "../dist",
  rollupOptions: {  
    input: {
      main: resolve(__dirname, "src/index.html"),
      listing: resolve(__dirname, "src/movie_listing/index.html"),
      watchlist: resolve(__dirname, "src/watchlist/index.html"),
      review: resolve(__dirname, "src/review/index.html"),
      movie: resolve(__dirname, "src/movie_pages/index.html"),
    },
  },
},
});