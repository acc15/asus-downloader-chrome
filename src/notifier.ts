import {clearNotification, createNotification, updateNotification} from "./notification";
import {Status, StatusDescriptor, statusDescriptors} from "./status";
import UrlDescriptor from "./url-descriptor";
import ButtonOptions = chrome.notifications.ButtonOptions;
import NotificationOptions = chrome.notifications.NotificationOptions;

export default class Notifier {

    url: UrlDescriptor;
    id: string | undefined = undefined;
    timeout: number;

    public constructor(url: UrlDescriptor, notificationTimeout: number) {
        this.url = url;
        this.timeout = notificationTimeout;
    }

    public async init(status: Status): Promise<boolean> {
        console.log(`Init status for ${this.url.link}: ${status}`);
        const opts = this.createNotificationOpts(status, statusDescriptors[status]);
        this.id = await createNotification(opts);
        return Boolean(this.id);
    }

    public async update(status: Status, progress: number | undefined = undefined): Promise<void> {
        console.log(`Updating status for ${this.url.link}: ${status}`);
        if (!this.id) {
            return;
        }

        const desc = statusDescriptors[status];
        const opts = this.createNotificationOpts(status, desc, progress);
        const updated = await updateNotification(this.id, opts);
        if (updated && desc.terminal && this.timeout > 0) {
            setTimeout(() => { void clearNotification(this.id) }, this.timeout);
        }
    }

    private createNotificationOpts(status: Status, desc: StatusDescriptor, progress?: number): NotificationOptions<true> {
        const buttons: ButtonOptions[] = [{title: "Download Master"}];
        if (status === Status.LoginFail) {
            buttons.push({ title: "Go to Options"});
        }
        return {
            requireInteraction: true,
            type: progress !== undefined ? "progress" : "basic",
            title: "ASUS Download Master",
            iconUrl: desc.icon,
            message: desc.message(this.url),
            progress,
            buttons
        };
    }

    static async create(url: UrlDescriptor, timeout: number, initStatus: Status = Status.InProcess): Promise<Notifier> {
        const n = new Notifier(url, timeout);
        await n.init(initStatus);
        return n;
    }

}
