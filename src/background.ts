import queueDownload, {QueueResult, QueueStatus} from "./DownloadMaster";
import {loadOpts} from "./option-tools";

const extensionPrefix = "asus-download-master";

console.log("ASUS Download Master Chrome Extension started...");

function getMessageByQueueResult(result: QueueResult) {
    switch (result.status) {
        case QueueStatus.Ok: return "File has been successfully added to download queue";
        case QueueStatus.Exists: return "Specified torrent file already in download queue";
        case QueueStatus.LoginFail: return "Login fail. Check extension options and specify valid Download Master URL, Login and password";
        case QueueStatus.UnknownError: return "Unknown Error. Sorry :(";
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
            .then(opts => queueDownload(url, opts))
            .then(result => {
                console.log(`Queue of (${url}) has been finished`, result);
                addNotification(getMessageByQueueResult(result), result.status === QueueStatus.LoginFail);
            }, err => {
                console.log("Queue error: ", err);
                addNotification("Unexpected error occurred during adding URL to download queue: " + JSON.stringify(err));
            });
    }
});
