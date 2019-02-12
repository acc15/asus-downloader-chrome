import queueDownload, {FileType, QueueResult, QueueStatus} from "./DownloadMaster";
import {loadOpts} from "./option-tools";
import {initRequestFiltering} from "./xhr";

const extensionPrefix = "asus-download-master";

console.log("ASUS Download Master Chrome Extension started...");

function getSuccessMessagePrefix(result: QueueResult) {
    switch (result.type) {
        case FileType.Plain: return `File ${result.fileName}`;
        case FileType.Ed2k: return `ED2K file (${result.url})`;
        case FileType.Magnet: return `Magnet URL (${result.url})`;
        case FileType.Ftp: return `FTP file (${result.url})`;
        case FileType.Torrent: return `Torrent file '${result.fileName}'`;
    }
}

function getMessageByQueueResult(result: QueueResult) {
    switch (result.status) {
        case QueueStatus.Ok:
            return getSuccessMessagePrefix(result) + " has been successfully added to download queue";

        case QueueStatus.Exists:
            return `Torrent file '${result.fileName}' already in download queue`;

        case QueueStatus.LoginFail:
            return "Login fail. Check extension options and specify valid Download Master URL, Login and Password";

        case QueueStatus.UnknownError:
            return "Unknown Error. Sorry :(";
    }
}

function addNotification(msg: string, optionsButtons: boolean = false) {
    const opts: chrome.notifications.NotificationOptions = {
        type: "basic",
        title: "ASUS Download Master",
        iconUrl: "icon.png",
        message: msg,
        buttons: optionsButtons ? [{ title: "Go to Options"}] : []
    };
    chrome.notifications.create(opts);
}

initRequestFiltering();

chrome.browserAction.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
});

chrome.notifications.onButtonClicked.addListener((id, btnIdx) => {
    console.log("Notification button clicked", id, btnIdx);
    chrome.runtime.openOptionsPage();
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
            .then(opts => queueDownload(url, item.pageUrl, opts))
            .then(result => {
                console.log(`Queue of (${url}) has been finished`, result);
                addNotification(getMessageByQueueResult(result), result.status === QueueStatus.LoginFail);
            }, err => {
                console.log("Queue error: ", err);
                addNotification("Unexpected error occurred during adding URL to download queue: " + JSON.stringify(err));
            });
    }
});
