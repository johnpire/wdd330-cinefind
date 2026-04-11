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