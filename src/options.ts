import {loadOpts, Options, storeOpts} from "./option-tools";
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
    const urlLink = getElementChecked<HTMLAnchorElement>("urlLink");
    const userInput = getElementChecked<HTMLInputElement>("user");
    const pwdInput = getElementChecked<HTMLInputElement>("pwd");
    const statusDiv = getElementChecked<HTMLDivElement>("status");
    const form = getElementChecked<HTMLFormElement>("form");

    loadOpts().then(opts => {
        urlInput.value = opts.url;
        urlLink.href = opts.url;
        userInput.value = opts.user;
        pwdInput.value = opts.pwd;
    });

    urlInput.addEventListener("input", function() {
        urlLink.href = this.value;
    });

    form.addEventListener("submit", e => {
        e.preventDefault();

        const options: Options = {
            url: urlInput.value,
            user: userInput.value,
            pwd: pwdInput.value
        };

        console.log("Saving options...", options);
        storeOpts(options).then(() => statusDiv.innerText = "Settings has been successfully saved");

    });
});
