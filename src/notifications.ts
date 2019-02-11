
export function addNotification(text: string) {
    chrome.notifications.create({
        type: "basic",
        title: "ASUS Download Master",
        iconUrl: "icon.png",
        message: text
    });
}
