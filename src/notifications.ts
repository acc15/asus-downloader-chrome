
export type NotificationCallback = () => void;

export interface ButtonDesc {
    title: string;
    callback: NotificationCallback;
}

interface NotificationDesc {
    id: string;
    clicked: NotificationCallback;
    callbacks: Array<NotificationCallback>;
}

const notifications: Array<NotificationDesc> = [];

function findNotificationById(id: string): number {
    for (let i = 0; i < notifications.length; i++) {
        if (notifications[i].id === id) {
            return i;
        }
    }
    return -1;
}

export function initNotifications() {
    chrome.notifications.onButtonClicked.addListener((id, btnIdx) => {
        console.log("notification button clicked", id, btnIdx);

        const idx = findNotificationById(id);
        if (idx < 0) {
            console.warn("Notification not found by id ", id);
        }

        const callbacks = notifications[idx].callbacks;
        if (btnIdx >= callbacks.length) {
            console.warn("Notification button callback not found", id, btnIdx);
        }

        notifications[idx].callbacks[btnIdx]();

    });
    chrome.notifications.onClicked.addListener((id) => {
        console.log("notification clicked", id);
    });
    chrome.notifications.onClosed.addListener((id) => {
        console.log("notification closed", id);

        const idx = findNotificationById(id);
        if (idx >= 0) {
            notifications.splice(idx, 1);
        }
    });
}

export function addNotification(text: string, buttons: Array<ButtonDesc>) {
    chrome.notifications.create({
        type: "basic",
        title: "ASUS Download Master",
        iconUrl: "icon.png",
        message: text,
        buttons: buttons.map(b => ({title: b.title})
    }, id => {
        notifications.push({ id, callbacks: buttons.map(b => b.callback) });
        console.log("notification created", id)
    });
}
