import "./assets/icon.png";
import "./assets/icon_error.png";
import "./assets/icon_ok.png";
import "./assets/icon_warn.png";
import UrlDescriptor from "./url-descriptor";

export const enum Status {
    InProcess,
    TorrentDownload,
    ConfirmFiles,
    Ok,
    Error,
    Exists,
    LoginFail,
    TaskLimit,
    DiskFull
}

export interface StatusDescriptor {
    message: (d: UrlDescriptor) => string;
    icon: string;
    terminal: boolean
}

export const statusDescriptors: {[key in Status]: StatusDescriptor} = {
    [Status.InProcess]: {
        terminal: false,
        icon: "assets/icon.png",
        message: d => `Queueing URL ${d.link}...`
    },
    [Status.TorrentDownload]: {
        terminal: false,
        icon: "assets/icon.png",
        message: d => `Downloading .torrent file from ${d.link}`
    },
    [Status.ConfirmFiles]: {
        terminal: false,
        icon: "assets/icon.png",
        message: d => `Confirming .torrent files from ${d.link}`
    },
    [Status.Ok]: {
        terminal: true,
        icon: "assets/icon_ok.png",
        message: d => `${d.description} has been successfully added to download queue`
    },
    [Status.Error]: {
        terminal: true,
        icon: "assets/icon_error.png",
        message: d => `Unexpected error occurred during enqueue of URL ${d.link}`
    },
    [Status.Exists]: {
        terminal: true,
        icon: "assets/icon_warn.png",
        message: d => `${d.description} already in download queue`
    },
    [Status.LoginFail]: {
        terminal: true,
        icon: "assets/icon_error.png",
        message: () => "Login fail. Check extension options and specify valid Download Master URL, Login and Password"
    },
    [Status.TaskLimit]: {
        terminal: true,
        icon: "assets/icon_error.png",
        message: () => "Download Master task limit reached (max 30 active tasks). " +
            "Wait until other tasks will finish or cancel them manually. " +
            "This is limitation of ASUS Download Master"
    },
    [Status.DiskFull]: {
        terminal: true,
        icon: "assets/icon_error.png",
        message: () => "Not enough space remaining on router drive. Please free disk space and retry download"
    },
}