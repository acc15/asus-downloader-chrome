import "./assets/icon.png";
import "./assets/icon_error.png";
import "./assets/icon_ok.png";
import "./assets/icon_warn.png";

import {clearNotification, createNotification, updateNotification} from "./notification";
import Status from "./status";
import UrlDesc from "./url-desc";
import ButtonOptions = chrome.notifications.ButtonOptions;
import NotificationOptions = chrome.notifications.NotificationOptions;

export default class Notifier {

    url: UrlDesc;
    id: string | undefined = undefined;
    timeout: number;

    status: Status;
    progress?: number;

    public constructor(url: UrlDesc, notificationTimeout: number, status: Status) {
        this.url = url;
        this.timeout = notificationTimeout;
        this.status = status
    }

    public async init(): Promise<boolean> {
        console.log(`Init status for ${this.url.link}: ${this.status.toString()}`);
        const opts = this.createNotificationOpts(this.status);
        this.id = await createNotification(opts);
        return Boolean(this.id);
    }

    public async update(status: Status, progress: number | undefined = undefined): Promise<void> {
        if (!this.id) {
            console.log(`Unable to update status for ${this.url.link}. NotificationId unassigned`)
            return;
        }

        if (this.status === status && this.progress === progress) {
            return;
        }

        console.log(
            `Updating status for ${this.url.link} to ${status.toString(progress)} from ${this.status.toString(this.progress)}`
        );

        this.status = status;
        this.progress = progress;

        const opts = this.createNotificationOpts(this.status, progress);
        const updated = await updateNotification(this.id, opts);
        if (updated && status.category.terminal && this.timeout > 0) {
            setTimeout(() => { void clearNotification(this.id) }, this.timeout);
        }
    }

    private createNotificationOpts(status: Status, progress?: number): NotificationOptions<true> {
        const buttons: ButtonOptions[] = [{title: "Download Master"}];
        if (status === Status.LoginFail) {
            buttons.push({ title: "Go to Options"});
        }
        return {
            requireInteraction: true,
            type: progress !== undefined ? "progress" : "basic",
            title: "ASUS Download Master",
            iconUrl: status.category.icon,
            message: status.message(this.url),
            progress,
            buttons
        };
    }

    static async create(url: UrlDesc, timeout: number, initStatus: Status = Status.InProcess): Promise<Notifier> {
        const n = new Notifier(url, timeout, initStatus);
        await n.init();
        return n;
    }

}
