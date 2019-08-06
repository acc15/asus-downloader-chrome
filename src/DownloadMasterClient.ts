import {QueueTorrent} from "./DownloadMaster";
import {Options} from "./option-tools";
import {isSuccessfulStatus, toUrlEncodedFormData} from "./utils";
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

export const enum UploadStatus {
    Success = "success",
    ConfirmFiles = "confirm_files",
    Exists = "exists",
    TaskLimit = "task_limit",
    Error = "error"
}

export async function dmQueueTorrent(p: QueueTorrent): Promise<UploadStatus> {
    const fd = new FormData();
    fd.append("file", p.blob, p.fileName);
    const resp = await xhr({method: "POST", url: p.opts.url + "/downloadmaster/dm_uploadbt.cgi", body: fd});
    if (!isSuccessfulStatus(resp.status)) {
        return UploadStatus.Error;
    }

    const statusMap: { [k: string]: UploadStatus } = {
        "ACK_SUCESS": UploadStatus.Success,
        "TOTAL_FULL": UploadStatus.TaskLimit,
        "BT_EXISTS": UploadStatus.Exists,
        "BT_ACK_SUCESS=": UploadStatus.ConfirmFiles
    };
    return Object.keys(statusMap).filter(k => resp.responseText.indexOf(k) >= 0).map(k => statusMap[k])[0] || UploadStatus.Error;
}

export async function dmConfirmAllFiles(p: QueueTorrent): Promise<boolean> {
    const formData = {
        filename: p.fileName,
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

export async function dmQueueLink(url: string, opts: Options): Promise<boolean> {
    const formData = {
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
    return isSuccessfulStatus(resp.status);
}
