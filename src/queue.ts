import "./assets/icon.png";
import "./assets/icon_error.png";
import "./assets/icon_ok.png";
import "./assets/icon_warn.png";
import {dmConfirmAllFiles, dmQueueTorrent, dmQueueUrl, QueueStatus} from "./dm";
import {Options} from "./options";
import {detectUrlKind, getFileNameByUrl, getFileTypeName, UrlKind} from "./urls";
import {getContentLength, getFileNameFromCD, isSuccessfulStatus, isTorrentFile} from "./utils";
import ButtonOptions = chrome.notifications.ButtonOptions;
import NotificationOptions = chrome.notifications.NotificationOptions;

class Queue {

    url: string;
    opts: Options;
    notificationId: string | undefined = undefined;
    name: string;
    kind: UrlKind;
    torrent: Blob = new Blob();
    status: QueueStatus = QueueStatus.InProcess;

    public constructor(url: string, opts: Options) {
        this.url = url;
        this.opts = opts;
        this.kind = detectUrlKind(url);
        this.name = getFileNameByUrl(url);
        this.torrent = new Blob();
    }

    public get filePrefix() {
        return `${getFileTypeName(this.kind)} '${this.name}'`;
    }

    private get statusIcon() {
        switch (this.status) {
            case QueueStatus.Ok:
                return "assets/icon_ok.png";

            case QueueStatus.LoginFail:
            case QueueStatus.DiskFull:
            case QueueStatus.Error:
            case QueueStatus.TaskLimit:
                return "assets/icon_error.png";

            case QueueStatus.Exists:
                return "assets/icon_warn.png";

            default:
                return "assets/icon.png";
        }
    }

    private get statusMessage() {
        switch (this.status) {
            case QueueStatus.InProcess:
                return `Queueing URL ${this.url}...`

            case QueueStatus.TorrentDownload:
                return `Downloading .torrent file from ${this.url}`;

            case QueueStatus.Ok:
                return `${this.filePrefix} has been successfully added to download queue`;

            case QueueStatus.LoginFail:
                return "Login fail. Check extension options and specify valid Download Master URL, Login and Password";

            case QueueStatus.Exists:
                return `${this.filePrefix} already in download queue`;

            case QueueStatus.ConfirmFiles:
                return `Confirming .torrent files from ${this.url}`;

            case QueueStatus.TaskLimit:
                return "Download Master task limit reached (max 30 active tasks). " +
                    "Wait until other tasks will finish or cancel them manually. " +
                    "This is limitation of ASUS Download Master";

            case QueueStatus.DiskFull:
                return "Not enough space remaining on router drive. Please free disk space and retry download";

            default:
                return "Unexpected error occurred during adding URL to download queue";
        }
    }

    public init(): Promise<void> {
        return new Promise((resolve) => {
            const opts = this.createNotificationOpts();
            chrome.notifications.create(opts, id => {
                this.notificationId = id;
                resolve();
            });
        });
    }

    public async update(status: QueueStatus, progress: number | undefined = undefined): Promise<void> {

        console.log(`Updating status for ${this.url} from ${this.status} to ${status}`);
        this.status = status;

        return new Promise(resolve => {
            if (!this.notificationId) {
                resolve();
                return;
            }

            const opts = this.createNotificationOpts(progress);
            chrome.notifications.update(this.notificationId, opts, () => {
                resolve();
            });
        });
    }

    public async queue(): Promise<void> {

        if (this.kind !== UrlKind.Unknown) {
            return this.queueAsUrl();
        }

        console.log(`Checking URL type. Sending GET request to ${this.url}`);

        const resp = await fetch(this.url);
        if (!isSuccessfulStatus(resp.status)) {
            return this.queueAsUrl();
        }

        const contentType = resp.headers.get("Content-Type");
        const contentDisposition = resp.headers.get("Content-Disposition");

        const cdName = getFileNameFromCD(contentDisposition);
        if (cdName) {
            this.name = cdName;
        }

        if (!isTorrentFile(contentType, this.name)) {
            return this.queueAsUrl();
        }

        this.kind = UrlKind.Torrent;
        this.torrent = await this.downloadTorrent(resp);
        return this.queueAsTorrent();

    }

    private createNotificationOpts(progress: number | undefined = undefined): NotificationOptions<true> {
        const buttons: ButtonOptions[] = [{title: "Download Master"}];
        if (this.status === QueueStatus.LoginFail) {
            buttons.push({ title: "Go to Options"});
        }
        return {
            type: progress !== undefined ? "progress" : "basic",
            title: "ASUS Download Master",
            iconUrl: this.statusIcon,
            message: this.statusMessage,
            progress,
            buttons
        };
    }

    private async queueAsUrl(): Promise<void> {
        const status = await dmQueueUrl(this);
        await this.update(status);
    }

    private async queueAsTorrent(): Promise<void> {
        const queueStatus = await dmQueueTorrent(this);
        await this.update(queueStatus);

        if (queueStatus !== QueueStatus.ConfirmFiles) {
            return;
        }

        const confirmStatus = await dmConfirmAllFiles(this);
        await this.update(confirmStatus);
    }

    private async downloadTorrent(resp: Response): Promise<Blob> {

        const total = getContentLength(resp);
        if (!total) {
            await this.update(QueueStatus.TorrentDownload);
            return resp.blob();
        }

        const body = resp.body;
        if (!body) {
            await this.update(QueueStatus.TorrentDownload);
            return resp.blob();
        }

        const reader = body.getReader();
        const chunks: Array<Uint8Array> = [];

        let current = 0;
        for (;;) {

            await this.update(QueueStatus.TorrentDownload, current / total * 100);

            const {done, value} = await reader.read();
            if (done) {
                break;
            }

            chunks.push(value);
            current += value.length;

        }

        return new Blob(chunks);
    }

}

export default Queue;