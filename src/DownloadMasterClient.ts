import {QueueTorrent} from "./DownloadMaster";
import {Options} from "./option-tools";
import {isSuccessfulStatus, StringMap, StrNumMap, toUrlEncodedFormData} from "./utils";
import xhr from "./xhr";

function encodeBase64(str: string): string {
    return btoa(unescape(encodeURIComponent(str)));
}

export async function dmLogin(opts: Options): Promise<boolean> {
    const fd = {
        flag: "",
        login_username: encodeBase64(opts.user),
        login_passwd: encodeBase64(opts.pwd),
        directurl: "/downloadmaster/task.asp"
    };
    console.log("Login form-data", fd);
    const resp = await xhr({
        method: "POST",
        url: opts.url + "/check.asp",
        headers: {
            "Content-type": "application/x-www-form-urlencoded"
        },
        body: toUrlEncodedFormData(fd)
    });
    return isSuccessfulStatus(resp.status);
}

export const enum QueueStatus {
    Ok = "ok",
    Exists = "already_exists",
    LoginFail = "login_fail",
    TaskLimit = "task_limit",
    DiskFull = "disk_full",
    ConfirmFiles = "confirm_files",
    Error = "error"
}

const statusMap: { [k: string]: QueueStatus } = {
    "ACK_SUCESS": QueueStatus.Ok,
    "TOTAL_FULL": QueueStatus.TaskLimit,
    "BT_EXISTS": QueueStatus.Exists,
    "BT_EXIST": QueueStatus.Exists,
    "BT_ACK_SUCESS=": QueueStatus.ConfirmFiles,
    "DISK_FULL": QueueStatus.DiskFull
};

function responseToStatus(req: XMLHttpRequest): QueueStatus {
    if (!isSuccessfulStatus(req.status)) {
        return QueueStatus.Error;
    }

    const text = req.responseText;

    const statusKeys = Object.keys(statusMap);
    statusKeys.sort((a, b) => b.length - a.length);
    return statusKeys.filter(k => text.indexOf(k) >= 0).map(k => statusMap[k])[0] || QueueStatus.Error;
}

export async function dmQueueTorrent(p: QueueTorrent): Promise<QueueStatus> {
    const fd = new FormData();
    fd.append("file", p.blob, p.name);
    const resp = await xhr({method: "POST", url: p.opts.url + "/downloadmaster/dm_uploadbt.cgi", body: fd});
    return responseToStatus(resp);
}

export async function dmConfirmAllFiles(p: QueueTorrent): Promise<boolean> {
    const formData: StringMap = {
        filename: p.name,
        download_type: "All",
        D_type: "3",
        t: "0.36825365996235604"
    };
    const resp = await xhr({
        method: "GET",
        url: p.opts.url + "/downloadmaster/dm_uploadbt.cgi?" + toUrlEncodedFormData(formData)
    });
    return isSuccessfulStatus(resp.status);
}

export async function dmQueueLink(url: string, opts: Options): Promise<QueueStatus> {
    const formData: StrNumMap = {
        action_mode: "DM_ADD",
        download_type: 5,
        again: "no",
        usb_dm_url: url,
        t: "0.7478890386712465"
    };
    const resp = await xhr({
        method: "GET",
        url: opts.url + "/downloadmaster/dm_apply.cgi?" + toUrlEncodedFormData(formData)
    });
    return responseToStatus(resp);
}
