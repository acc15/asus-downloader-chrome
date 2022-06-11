import {QueueTorrent} from "./dm";
import {Options, isSuccessfulStatus} from "./utils";

export async function dmLogin(opts: Options): Promise<boolean> {

    const fd = new URLSearchParams({
        "flag": "",
        "login_username": btoa(opts.user),
        "login_passwd": btoa(opts.pwd),
        "directurl": "/downloadmaster/task.asp"
    });

    console.log("Login form-data", fd);
    const resp = await fetch(opts.url + "/check.asp", {
        method: "POST",
        headers: {
            "Content-type": "application/x-www-form-urlencoded"
        },
        body: fd
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

const statusKeys = Object.keys(statusMap);
statusKeys.sort((a, b) => b.length - a.length);

async function responseToStatus(resp: Response): Promise<QueueStatus> {
    if (!isSuccessfulStatus(resp.status)) {
        return QueueStatus.Error;
    }

    const text = await resp.text();
    return statusKeys.filter(k => text.indexOf(k) >= 0).map(k => statusMap[k])[0] || QueueStatus.Error;
}

export async function dmQueueTorrent(p: QueueTorrent): Promise<QueueStatus> {
    const fd = new FormData();
    fd.append("file", p.blob, p.name);
    const resp = await fetch(p.opts.url + "/downloadmaster/dm_uploadbt.cgi", { method: "POST", body: fd});
    return responseToStatus(resp);
}

export async function dmConfirmAllFiles(p: QueueTorrent): Promise<boolean> {
    const params = new URLSearchParams({
        filename: p.name,
        download_type: "All",
        D_type: "3",
        t: "0.36825365996235604"
    });
    const resp = await fetch(p.opts.url + "/downloadmaster/dm_uploadbt.cgi?" + params.toString());
    return isSuccessfulStatus(resp.status);
}

export async function dmQueueLink(url: string, opts: Options): Promise<QueueStatus> {
    const params = new URLSearchParams({
        action_mode: "DM_ADD",
        download_type: "5",
        again: "no",
        usb_dm_url: url,
        t: "0.7478890386712465"
    });
    const resp = await fetch(opts.url + "/downloadmaster/dm_apply.cgi?" + params.toString());
    return responseToStatus(resp);
}
