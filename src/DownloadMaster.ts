import {dmConfirmAllFiles, dmLogin, dmUpload, dmUploadLink, UploadStatus} from "./dmclient";
import {Options} from "./option-tools";
import xhr, {getFileNameFromCD} from "./xhr";

export const enum QueueStatus {
    Ok = "ok",
    Exists = "already_exists",
    LoginFail = "login_fail",
    UnknownError = "unknown_error"
}

async function queueTorrent(url: string, opts: Options): Promise<QueueStatus> {
    console.log(`Downloading .torrent from ${url}...`);

    const torrentResp = await xhr({ method: "GET", url, responseType: 'blob' });
    const fileName = getFileNameFromCD(torrentResp.getResponseHeader("Content-Disposition"), "test.torrent");
    const torrentBlob: Blob = torrentResp.response as Blob;

    const uploadBtResp = await dmUpload(torrentBlob, fileName, opts);
    switch (uploadBtResp) {
        case UploadStatus.Success:
            return QueueStatus.Ok;

        case UploadStatus.Exists:
            return QueueStatus.Exists;

        case UploadStatus.ConfirmFiles:
            const confirmResp = await dmConfirmAllFiles(fileName, opts);
            if (!confirmResp) {
                return QueueStatus.UnknownError;
            }
            return QueueStatus.Ok;

        default:
            return QueueStatus.UnknownError;
    }
}

async function queueFile(url: string, opts: Options): Promise<QueueStatus> {
    console.log(`Downloading file from ${url}...`);

    const resp = await dmUploadLink(url, opts);
    return resp ? QueueStatus.Ok : QueueStatus.UnknownError;
}

async function queueDownload(url: string, opts: Options): Promise<QueueStatus> {
    const loginResp = await dmLogin(opts);
    if (!loginResp) {
        return QueueStatus.LoginFail;
    }

    const headResponse = await xhr({method: "HEAD", url});
    const contentType = headResponse.getResponseHeader("Content-Type");
    try {
        return await contentType && contentType !== null && contentType.indexOf("application/x-bittorrent") >= 0
            ? queueTorrent(url, opts)
            : queueFile(url, opts);
    } catch (e) {
        console.log("Unknown error while adding download to queue", e);
        return QueueStatus.UnknownError;
    }
}

export default queueDownload;