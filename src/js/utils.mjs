// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
    return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}
// save data to local storage
export function setLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
    qs(selector).addEventListener("touchend", (event) => {
        event.preventDefault();
        callback();
    });
    qs(selector).addEventListener("click", callback);
}

// get the product id from the query string
export function getParam(param) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const product = urlParams.get(param);
    return product
}

export function renderListWithTemplate(
    templateFn,
    parentElement,
    list,
    position = "afterbegin",
    clear = false
)   {
    if (clear) {
        parentElement.innerHTML = "";
    }

    const htmlStrings = list.map(templateFn);
    parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

export async function loadTemplate(path) {
    // fetch content from filepaths. Content = Template
    const res = await fetch(path);
    const template = await res.text();
    return template;
}

export function renderWithTemplate(template, parentElement, data, callback) {
    // rende the template into the html element
    parentElement.innerHTML = template;
    if (callback) {
      callback(data)
    }
}

export async function loadHeaderFooter() {
    // setup main header
    const headerTemple = await loadTemplate("../partials/header.html")
    const headerElement = document.querySelector("#main-header")
    renderWithTemplate(headerTemple, headerElement)

    // setup main footer
    const footerTemple = await loadTemplate("../partials/footer.html")
    const footerElement = document.querySelector("#main-footer")
    renderWithTemplate(footerTemple, footerElement)
}