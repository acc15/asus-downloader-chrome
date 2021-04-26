import queueDownload, {getFileTypeName, QueueResult} from "./DownloadMaster";
import {QueueStatus} from "./DownloadMasterClient";
import {loadOpts} from "./option-tools";
import {unexpectedErrorHandler} from "./utils";
import {initRequestFiltering} from "./xhr";

const extensionPrefix = "asus-download-master";

console.log("ASUS Download Master Chrome Extension started...");

function getFilePrefix(result: QueueResult) {
    return `${getFileTypeName(result.type)} '${result.name}'`;
}

function getMessageByQueueResult(result: QueueResult) {
    switch (result.status) {
        case QueueStatus.Ok:
            return getFilePrefix(result) + " has been successfully added to download queue";

        case QueueStatus.Exists:
            return getFilePrefix(result) + " already in download queue";

        case QueueStatus.LoginFail:
            return "Login fail. Check extension options and specify valid Download Master URL, Login and Password";

        case QueueStatus.TaskLimit:
            return "Download Master task limit reached (30 active tasks max). " +
                "Wait until other tasks will finish or cancel them manually. " +
                "This is limitation of ASUS Download Master. ";

        case QueueStatus.DiskFull:
            return "Not enough space remaining on router drive. " +
                "Please free disk space and retry download. ";

        default:
            return "Unknown Error. Sorry :(";
    }
}

function addNotification(msg: string, optionsButtons = false) {
    const opts: chrome.notifications.NotificationOptions = {
        type: "basic",
        title: "ASUS Download Master",
        iconUrl: "icon.png",
        message: msg,
        buttons: [{title: "Download Master"}].concat(optionsButtons ? [{ title: "Go to Options"}] : [])
    };
    chrome.notifications.create(opts);
}

initRequestFiltering();

chrome.browserAction.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
});

chrome.notifications.onButtonClicked.addListener((id, btnIdx) => {
    console.log("Notification button clicked", id, btnIdx);
    switch (btnIdx) {
        case 0:
            loadOpts().then(opts => {
                chrome.tabs.query({ url: opts.url + "/*" }, tabs => {
                    if (tabs && tabs.length > 0) {
                        chrome.tabs.highlight({ tabs: tabs[0].index });
                    } else {
                        chrome.tabs.create({ url: opts.url });
                    }
                });
            }, unexpectedErrorHandler);
            break;

        case 1:
            chrome.runtime.openOptionsPage();
            break;

        default:
            console.warn("Illegal btnIdx was clicked on notification", id, btnIdx);
            break;
    }
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
                console.log("Queue error", err);
                addNotification("Unexpected error occurred during adding URL to download queue");
            });
    }
});
