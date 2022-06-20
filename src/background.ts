import queueDownload, {getFileTypeName, QueueResult} from "./dm";
import {QueueStatus} from "./dm-client";
import {unexpectedErrorHandler, loadOpts} from "./utils";

const extensionPrefix = "asus-download-master";
const downloadMenuItemId = `${extensionPrefix}.download`;

console.log("ASUS Download Master Chrome Extension started...");

const getFilePrefix = (result: QueueResult) => `${getFileTypeName(result.type)} '${result.name}'`;
const getMessageByQueueResult = (result: QueueResult) => {
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

const addNotification = (msg: string, optionsButtons = false) => chrome.notifications.create({
    type: "basic",
    title: "ASUS Download Master",
    iconUrl: "icon.png",
    message: msg,
    buttons: [{title: "Download Master"}].concat(optionsButtons ? [{ title: "Go to Options"}] : [])
});

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
    void (async (url: string) => {
        const opts = await loadOpts();
        try {
            const result = await queueDownload(url, opts)
            console.log(`Queue of (${url}) has been finished`, result);
            addNotification(getMessageByQueueResult(result), result.status === QueueStatus.LoginFail);
        } catch (err) {
            console.log("Queue error", err);
            addNotification("Unexpected error occurred during adding URL to download queue");
        }
    })(item.linkUrl);
});

chrome.notifications.onButtonClicked.addListener((id, btnIdx) => {
    console.log("Notification button clicked", id, btnIdx);
    switch (btnIdx) {
        case 0:
            loadOpts().then(opts => {
                chrome.tabs.query({ url: opts.url + "/*" }, tabs => {
                    if (tabs && tabs.length > 0) {
                        chrome.tabs.highlight({ tabs: tabs[0].index }).catch(unexpectedErrorHandler);
                    } else {
                        chrome.tabs.create({ url: opts.url }).catch(unexpectedErrorHandler);
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

