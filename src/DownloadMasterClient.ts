import {Options} from "./option-tools";
import {isSuccessfulStatus, toUrlEncodedFormData} from "./utils";
import xhr from "./xhr";

export async function dmLogin(opts: Options): Promise<boolean> {
    const fd = {
        flag: "",
        login_username: btoa(opts.user),
        login_passwd: btoa(opts.pwd),
        directurl: "/downloadmaster/task.asp"
    };
    console.log("Login form-data", fd);
    const resp = await xhr({ method: "POST", url: opts.url + "/check.asp", headers: {
        "Content-type": 'application/x-www-form-urlencoded'
    }, body: toUrlEncodedFormData(fd)});
    return isSuccessfulStatus(resp.status);
}

export const enum UploadStatus {
    Success = "success",
    ConfirmFiles = "confirm_files",
    Exists = "exists",
    Error = "error"
}

export async function dmQueueTorrent(file: Blob, fileName: string, opts: Options): Promise<UploadStatus> {
    const fd = new FormData();
    fd.append("file", file, fileName);
    const resp = await xhr({method: "POST", url: opts.url + "/downloadmaster/dm_uploadbt.cgi", body: fd});
    if (!isSuccessfulStatus(resp.status)) {
        return UploadStatus.Error;
    }
    if (resp.responseText.indexOf("BT_EXISTS") >= 0) {
        return UploadStatus.Exists;
    }
    if (resp.responseText.indexOf("BT_ACK_SUCESS=") >= 0) {
        return UploadStatus.ConfirmFiles;
    }
    return UploadStatus.Success;
}

export async function dmConfirmAllFiles(fileName: string, opts: Options): Promise<boolean> {
    const formData = {
        filename: fileName,
        download_type: "All",
        D_type: "3",
        t: "0.36825365996235604"
    };
    const resp = await xhr({method: "GET", url: opts.url + "/downloadmaster/dm_uploadbt.cgi?" + toUrlEncodedFormData(formData)});
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
    const resp = await xhr({method: "GET", url: opts.url + "/downloadmaster/dm_apply.cgi?" + toUrlEncodedFormData(formData)});
    return isSuccessfulStatus(resp.status);
}