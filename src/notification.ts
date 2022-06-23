
export function createNotification(opts: chrome.notifications.NotificationOptions<true>): Promise<string | undefined> {
    return new Promise(resolve => chrome.notifications.create(opts, resolve));
}

export function updateNotification(id: string, opts: chrome.notifications.NotificationOptions<true>): Promise<boolean> {
    return new Promise(resolve => chrome.notifications.update(id, opts, resolve));
}

export function clearNotification(id: string | undefined): Promise<boolean> {
    return new Promise(resolve => {
        if (!id) {
            return resolve(true);
        }
        chrome.notifications.clear(id, resolve);
    });
}