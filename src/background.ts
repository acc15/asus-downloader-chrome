import {loadOpts} from "./options";
import queue from "./queue";

const extensionPrefix = "asus-download-master";
const downloadMenuItemId = `${extensionPrefix}.download`;

console.log("ASUS Download Master Chrome Extension started...");

async function openDownloadMaster() {
    const opts = await loadOpts();
    const tabs = await chrome.tabs.query({url: opts.url + "/*"});
    if (tabs && tabs.length > 0) {
        await chrome.tabs.highlight({tabs: tabs[0].index});
    } else {
        await chrome.tabs.create({url: opts.url});
    }
}

chrome.runtime.onInstalled.addListener(() => {
    console.log("onInstalled called");
    chrome.contextMenus.create({
        id: downloadMenuItemId,
        title: "Download with ASUS Download Master",
        contexts: ["link"],
    })
});

chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());

chrome.contextMenus.onClicked.addListener((item) => {
    if (item.menuItemId !== downloadMenuItemId || !item.linkUrl) {
        return;
    }
    void queue(item.linkUrl);
});

chrome.notifications.onButtonClicked.addListener((id, btnIdx) => {
    console.log("Notification button clicked", id, btnIdx);
    switch (btnIdx) {
        case 0:
            void openDownloadMaster();
            break;

        case 1:
            chrome.runtime.openOptionsPage();
            break;

        default:
            console.warn("Illegal btnIdx was clicked on notification", id, btnIdx);
            break;
    }
});

