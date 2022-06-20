import {QueueFile, QueueTorrent} from "./dm";
import {Options, isSuccessfulStatus} from "./utils";

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

const isLoginFailed = (status: number): boolean => status == 401 || status == 598;

async function responseToStatus(resp: Response, checkResponseText: boolean): Promise<QueueStatus> {
    if (!isSuccessfulStatus(resp.status)) {
        return isLoginFailed(resp.status) ? QueueStatus.LoginFail : QueueStatus.Error;
    }

    if (!checkResponseText) {
        return QueueStatus.Ok;
    }

    const text = await resp.text();
    return statusKeys.filter(k => text.indexOf(k) >= 0).map(k => statusMap[k])[0] || QueueStatus.Error;
}

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

const dmCall = async (opts: Options, checkResponseText: boolean, httpCall: () => Promise<Response>): Promise<QueueStatus> => {
    const resp = await httpCall();
    if (!isLoginFailed(resp.status)) {
        return responseToStatus(resp, checkResponseText);
    }

    const loginResult = await dmLogin(opts);
    if (!loginResult) {
        return QueueStatus.LoginFail;
    }

    const secondResp = await httpCall();
    return responseToStatus(secondResp, checkResponseText);
}

export const dmQueueTorrent = async (p: QueueTorrent): Promise<QueueStatus> => {
    console.log(`Queueing .torrent from ${p.url}...`);

    const fd = new FormData();
    fd.append("file", p.blob, p.name);

    return dmCall(p.opts, true, () => fetch(p.opts.url + "/downloadmaster/dm_uploadbt.cgi", { method: "POST", body: fd}));
}

export const dmConfirmAllFiles = async (p: QueueTorrent): Promise<QueueStatus> => {
    console.log(`Confirming all .torrent files from ${p.url}...`);

    const params = new URLSearchParams({
        filename: p.name,
        download_type: "All",
        D_type: "3",
        t: "0.36825365996235604"
    }).toString();

    return dmCall(p.opts, false, () => fetch(p.opts.url + "/downloadmaster/dm_uploadbt.cgi?" + params));
}

export const dmQueueLink = async (p: QueueFile): Promise<QueueStatus> => {
    console.log(`Queueing file from ${p.url}...`);

    const params = new URLSearchParams({
        action_mode: "DM_ADD",
        download_type: "5",
        again: "no",
        usb_dm_url: p.url,
        t: "0.7478890386712465"
    }).toString();

    return dmCall(p.opts, true, () => fetch(p.opts.url + "/downloadmaster/dm_apply.cgi?" + params));
}
