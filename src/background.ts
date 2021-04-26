import queueDownload, {FileType, QueueResult} from "./DownloadMaster";
import {UploadStatus} from "./DownloadMasterClient";
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
        case UploadStatus.Ok:
            return getSuccessMessagePrefix(result) + " has been successfully added to download queue";

        case UploadStatus.Exists:
            return `Torrent file '${result.fileName}' already in download queue`;

        case UploadStatus.LoginFail:
            return "Login fail. Check extension options and specify valid Download Master URL, Login and Password";

        case UploadStatus.TaskLimit:
            return "Download Master task limit reached (30 active tasks max). " +
                "Wait until other tasks will finish or cancel them manually. " +
                "This is limitation of ASUS Download Master. ";

        case UploadStatus.DiskFull:
            return "Not enough space remaining on router drive. " +
                "Please free disk space and retry download. ";

        default:
            return "Unknown Error. Sorry :(";
    }
}

function addNotification(msg: string, optionsButtons: boolean = false) {
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
            });
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
                addNotification(getMessageByQueueResult(result), result.status === UploadStatus.LoginFail);
            }, err => {
                console.log("Queue error", err);
                addNotification("Unexpected error occurred during adding URL to download queue");
            });
    }
});
