import {Options} from "./options";
import Queue from "./queue";
import {isSuccessfulStatus} from "./utils";

export const enum QueueStatus {
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

const statusMap: { [k: string]: QueueStatus } = {
    "BT_ACK_SUCESS=": QueueStatus.ConfirmFiles,
    "ACK_SUCESS": QueueStatus.Ok,
    "TOTAL_FULL": QueueStatus.TaskLimit,
    "BT_EXISTS": QueueStatus.Exists,
    "BT_EXIST": QueueStatus.Exists,
    "DISK_FULL": QueueStatus.DiskFull
};

function isLoginFailed(status: number) {
    return status === 401 || status === 598;
}

export function responseTextToStatus(responseText: string): QueueStatus {
    for (const text in statusMap) {
        if (responseText.indexOf(text) >= 0) {
            return statusMap[text];
        }
    }
    return QueueStatus.Error;
}

async function responseToStatus(resp: Response, checkResponseText: boolean): Promise<QueueStatus> {
    if (!isSuccessfulStatus(resp.status)) {
        return isLoginFailed(resp.status) ? QueueStatus.LoginFail : QueueStatus.Error;
    }

    if (!checkResponseText) {
        return QueueStatus.Ok;
    }

    const text = await resp.text();
    return responseTextToStatus(text);
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
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: fd
    });

    return isSuccessfulStatus(resp.status);
}

async function dmCall(l: Queue, checkResponseText: boolean, httpCall: () => Promise<Response>): Promise<QueueStatus> {
    const resp = await httpCall();
    if (!isLoginFailed(resp.status)) {
        return responseToStatus(resp, checkResponseText);
    }

    const loginResult = await dmLogin(l.opts);
    if (!loginResult) {
        return QueueStatus.LoginFail;
    }

    const secondResp = await httpCall();
    return responseToStatus(secondResp, checkResponseText);
}

export async function dmQueueTorrent(l: Queue): Promise<QueueStatus> {
    console.log(`Queueing .torrent from ${l.url}...`);

    const fd = new FormData();
    fd.append("file", l.torrent, l.name);

    return dmCall(l, true, () => fetch(l.opts.url + "/downloadmaster/dm_uploadbt.cgi", { method: "POST", body: fd}));
}

export async function dmConfirmAllFiles(l: Queue): Promise<QueueStatus> {
    console.log(`Confirming all .torrent files from ${l.url}...`);

    const params = new URLSearchParams({
        filename: l.name,
        download_type: "All",
        D_type: "3",
        t: "0.36825365996235604"
    }).toString();

    return dmCall(l, false, () => fetch(l.opts.url + "/downloadmaster/dm_uploadbt.cgi?" + params));
}

export async function dmQueueUrl(l: Queue): Promise<QueueStatus> {
    console.log(`Queueing file from ${l.url}...`);

    const params = new URLSearchParams({
        action_mode: "DM_ADD",
        download_type: "5",
        again: "no",
        usb_dm_url: l.url,
        t: "0.7478890386712465"
    }).toString();

    return dmCall(l, true, () => fetch(l.opts.url + "/downloadmaster/dm_apply.cgi?" + params));
}
