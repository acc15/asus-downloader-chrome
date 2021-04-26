import {dmLogin} from "./DownloadMasterClient";
import {loadOpts, Options, storeOpts} from "./option-tools";
import "./options.css";
import {unexpectedErrorHandler} from "./utils";

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
    const checkButton = getElementChecked<HTMLButtonElement>("check");
    const form = getElementChecked<HTMLFormElement>("form");

    loadOpts().then(opts => {
        urlInput.value = opts.url;
        urlLink.href = opts.url;
        userInput.value = opts.user;
        pwdInput.value = opts.pwd;
    }, unexpectedErrorHandler);

    urlInput.addEventListener("input", function() {
        urlLink.href = this.value;
    });

    checkButton.addEventListener("click", () => {
        dmLogin({ url: urlInput.value, user: userInput.value, pwd: pwdInput.value })
            .then(result => statusDiv.innerText = result
                ? "Provided URL and credentials are valid. Don't forget to Save options"
                : "Invalid credentials provided", unexpectedErrorHandler);
    });

    form.addEventListener("submit", e => {
        e.preventDefault();

        const options: Options = {
            url: urlInput.value,
            user: userInput.value,
            pwd: pwdInput.value
        };

        console.log("Saving options...", options);
        storeOpts(options).then(() => statusDiv.innerText = "Settings has been successfully saved", unexpectedErrorHandler);

    });
});
