import "./options.css";

function getElementChecked<T extends HTMLElement>(id: string): T {
    const el = document.getElementById(id);
    if (!el) {
        throw new Error("Unable to find DOM element by id: " + id);
    }
    return el as T;
}

document.addEventListener("DOMContentLoaded", () => {
    const urlInput = getElementChecked<HTMLInputElement>("url");
    const userInput = getElementChecked<HTMLInputElement>("user");
    const pwdInput = getElementChecked<HTMLInputElement>("pwd");
    const statusDiv = getElementChecked<HTMLDivElement>("status");
    const form = getElementChecked<HTMLFormElement>("form");

    chrome.storage.local.get(["url", "user", "pwd"], items => {
        console.log("Settings loaded", items);
        urlInput.value = items.url;
        userInput.value = items.user;
        pwdInput.value = items.pwd;
    });


    form.addEventListener("submit", e => {
        e.preventDefault();

        const options = {
            url: urlInput.value,
            user: userInput.value,
            pwd: pwdInput.value
        };

        console.log("Saving options...", options);
        chrome.storage.local.set(options,
            () => statusDiv.innerText = "Settings has been successfully saved");

    });
});

