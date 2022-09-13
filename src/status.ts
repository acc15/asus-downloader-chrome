
import UrlDesc from "./url-desc";

export class StatusCategory {

    icon: string;
    terminal: boolean;

    constructor(icon: string, terminal: boolean) {
        this.icon = icon;
        this.terminal = terminal;
    }

    static readonly Intermediate = new StatusCategory("assets/icon.png", false);
    static readonly Success = new StatusCategory("assets/icon_ok.png", true);
    static readonly Warn = new StatusCategory("assets/icon_warn.png", true);
    static readonly Error = new StatusCategory("assets/icon_error.png", true);

}

export default class Status {

    name: string;
    message: (d: UrlDesc) => string;
    category: StatusCategory;

    private constructor(message: (d: UrlDesc) => string, category: StatusCategory = StatusCategory.Intermediate, name = "") {
        this.message = message;
        this.category = category;
        this.name = name;
    }

    toString(progress?: number): string {
        return progress === undefined ? this.name : `${this.name}:${progress}`
    }

    static readonly InProcess = new Status(d => `Queueing URL ${d.link}...`);
    static readonly TorrentDownload = new Status(d => `Downloading .torrent ${d.link}...`);
    static readonly Login = new Status(() => `Logging in to DownloadMaster...`);
    static readonly AddTask = new Status(d => `Adding ${d.description} to DownloadMaster tasks`);
    static readonly ConfirmFiles = new Status(d => `Confirming .torrent files from ${d.link}`);
    static readonly Success = new Status(d => `${d.description} has been successfully added to download queue`, StatusCategory.Success);
    static readonly Error = new Status(d => `Unexpected error occurred during enqueue of URL ${d.link}`, StatusCategory.Error);
    static readonly Exists = new Status(d => `${d.description} already in download queue`, StatusCategory.Warn);
    static readonly LoginFail = new Status(() =>
        "Login fail. Check extension options and specify valid Download Master URL, Login and Password",
        StatusCategory.Error
    );
    static readonly TaskLimit = new Status(() =>
        "Download Master task limit reached (max 30 active tasks). " +
        "Wait until other tasks will finish or cancel them manually. " +
        "This is limitation of ASUS Download Master",
        StatusCategory.Error
    );
    static readonly DiskFull = new Status(() =>
        "Not enough space remaining on router drive. Please free disk space and retry download",
        StatusCategory.Error
    );
    static readonly DmTimeout = new Status(() =>
        "Request to Download Master timed out. " +
        "Ensure that Download Master is up and running. " +
        "Also you can try to increase Download Master timeout option",
        StatusCategory.Error
    )

    static {
        for (const [name, status] of Object.entries(Status)) {
            if (status instanceof Status) {
                status.name = name;
            }
        }
    }

}


