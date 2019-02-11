import queueDownload, {QueueStatus} from "./DownloadMaster";
import {addNotification} from "./notifications";
import {loadOpts} from "./option-tools";

const extensionPrefix = "asus-download-master";

console.log("ASUS Download Master Chrome Extension started...");

function getMessageByStatus(url: string, status: QueueStatus) {
    switch (status) {
        case QueueStatus.Ok: return "File has been successfully added to download queue";
        case QueueStatus.Exists: return "Specified torrent file already in download queue";
        case QueueStatus.LoginFail: return "Login fail. Check extension options and specify valid Download Master URL, Login and password";
        case QueueStatus.UnknownError: return "Unknown Error. Sorry :(";
    }
}

chrome.browserAction.onClicked.addListener(() => {
    addNotification("abc");
    // chrome.runtime.openOptionsPage();
});

const downloadMenuItemId = `${extensionPrefix}.download`;
chrome.contextMenus.create({
    id: downloadMenuItemId,
    title: "Download with ASUS Download Master",
    contexts: ["link"],
});

chrome.contextMenus.onClicked.addListener(item => {
    const url = item.linkUrl;
    if (item.menuItemId === downloadMenuItemId && url) {
        loadOpts()
            .then(opts => queueDownload(url, opts))
            .then(status => {
                console.log(`Queue of (${url}) has been finished with status ${status}...`);
                addNotification(getMessageByStatus(url, status));
            }, err => console.log("Queue error: ", err));
    }
});
