import {defaultOptions, loadOpts, storeOpts} from "./option-tools";

const downloadMenuItemId = "asus-download-master.download";

async function queueDownload(url: string) {
    const opts = await loadOpts();
    console.log("Queue downloading of url and options", url, opts);


}

chrome.runtime.onInstalled.addListener(() => {

    storeOpts(defaultOptions).then(opts => console.log("Default options has been successfully stored", opts));

    chrome.contextMenus.create({
        id: downloadMenuItemId,
        title: "Download with ASUS Download Master",
        contexts: ["link"],
    });

    chrome.contextMenus.onClicked.addListener(item => {
        const url = item.linkUrl;
        if (item.menuItemId === downloadMenuItemId && url) {
            queueDownload(url).then(() => console.log(`Downloading of (${url}) has been successfully queued...`));
        }
    });

});