const downloadMenuItemId = "asus-download-master.download";

function queueDownload(url: string) {
    console.log("Queue downloading of url ", url);
}

chrome.runtime.onInstalled.addListener(() => {

    chrome.storage.local.set({

        url: "http://router.asus.com:8081",
        user: "admin",
        pwd: "admin"

    }, () => console.log("Default options is set"));


    chrome.contextMenus.create({
        id: downloadMenuItemId,
        title: "Download with ASUS Download Master",
        contexts: ["link"],
    });

    chrome.contextMenus.onClicked.addListener(item => {
        if (item.menuItemId === downloadMenuItemId && item.linkUrl) {
            queueDownload(item.linkUrl);
        }
    });

});