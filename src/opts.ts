import "./opts.css"
import DownloadMaster from "./dm";

import {loadOpts, Options, storeOpts} from "./options";

function getElementChecked<T extends HTMLElement>(id: string): T {
    const el = document.getElementById(id);
    if (!el) {
        throw new Error("Unable to find DOM element by id: " + id);
    }
    return el as T;
}

function toNumberOrZero(n: number) {
    return isNaN(n) ? 0 : n
}

async function onContentLoaded() {

    const urlInput = getElementChecked<HTMLInputElement>("url");
    const urlLink = getElementChecked<HTMLAnchorElement>("urlLink");
    const userInput = getElementChecked<HTMLInputElement>("user");
    const pwdInput = getElementChecked<HTMLInputElement>("pwd");
    const notificationTimeoutInput = getElementChecked<HTMLInputElement>("notification-timeout");
    const requestTimeoutInput = getElementChecked<HTMLInputElement>("request-timeout");
    const dmTimeoutInput = getElementChecked<HTMLInputElement>("dm-timeout");
    const statusDiv = getElementChecked<HTMLDivElement>("status");
    const checkButton = getElementChecked<HTMLButtonElement>("check");
    const form = getElementChecked<HTMLFormElement>("form");

    function createOptionsFromInputs(): Options {
        return {
            url: urlInput.value,
            user: userInput.value,
            pwd: pwdInput.value,
            notificationTimeout: toNumberOrZero(notificationTimeoutInput.valueAsNumber),
            requestTimeout: toNumberOrZero(requestTimeoutInput.valueAsNumber),
            dmTimeout: toNumberOrZero(dmTimeoutInput.valueAsNumber)
        };
    }

    async function checkCredentials(opts: Options) {
        const result = await new DownloadMaster(opts).login();
        statusDiv.innerText = result
            ? "Provided URL and credentials are valid. Don't forget to Save options"
            : "Invalid credentials provided";
    }

    async function storeOptions(opts: Options) {
        console.log("Saving options...", opts);

        await storeOpts(opts);
        statusDiv.innerText = "Settings has been successfully saved";
    }

    const opts = await loadOpts();
    urlInput.value = opts.url;
    urlLink.href = opts.url;
    userInput.value = opts.user;
    pwdInput.value = opts.pwd;
    notificationTimeoutInput.valueAsNumber = opts.notificationTimeout;
    requestTimeoutInput.valueAsNumber = opts.requestTimeout;
    dmTimeoutInput.valueAsNumber = opts.dmTimeout;

    urlInput.addEventListener("input", () => {
        urlLink.href = urlInput.value;
    });

    checkButton.addEventListener("click", () => {
        void checkCredentials(createOptionsFromInputs());
    });

    form.addEventListener("submit", e => {
        e.preventDefault();
        void storeOptions(createOptionsFromInputs());
    });

}

document.addEventListener("DOMContentLoaded", () => {
    void onContentLoaded();
});
