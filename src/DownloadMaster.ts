import {dmConfirmAllFiles, dmLogin, dmQueueLink, dmQueueTorrent, UploadStatus} from "./DownloadMasterClient";
import {Options} from "./option-tools";
import {firstNonNull, getFileNameFromCD, getFileNameFromUrl, isTorrentFile} from "./utils";
import xhr, {replaceRefererHeader} from "./xhr";

export const enum QueueStatus {
    Ok = "ok",
    Exists = "already_exists",
    LoginFail = "login_fail",
    UnknownError = "unknown_error"
}

export const enum FileType {
    Torrent = "torrent",
    Ed2k = "ed2k",
    Magnet = "magnet",
    Ftp = "ftp",
    Plain = "plain"
}

interface QueueBase {
    url: string;
    opts: Options;
}

export interface QueueResult extends QueueBase {
    status: QueueStatus;
    type?: FileType;
    fileName?: string;
}

interface QueueFile extends QueueBase {
    type: FileType;
    fileName?: string;
}

interface QueueTorrent extends QueueBase {
    fileName: string;
    blob: Blob;
}

const notATorrentUrlPrefixes: { [k: string]: FileType } = {
    "ftp:": FileType.Ftp,
    "ed2k:": FileType.Ed2k,
    "magnet:": FileType.Magnet
};

async function queueTorrent(p: QueueTorrent): Promise<QueueResult> {
    console.log(`Downloading .torrent from ${p.url}...`);

    const uploadBtResp = await dmQueueTorrent(p.blob, p.fileName, p.opts);

    const result: QueueResult = {
        url: p.url,
        opts: p.opts,
        fileName: p.fileName,
        type: FileType.Torrent,
        status: QueueStatus.Ok
    };

    switch (uploadBtResp) {
        case UploadStatus.Success:
            result.status = QueueStatus.Ok;
            break;

        case UploadStatus.Exists:
            result.status = QueueStatus.Exists;
            break;

        case UploadStatus.ConfirmFiles:
            const confirmResp = await dmConfirmAllFiles(p.fileName, p.opts);
            if (!confirmResp) {
                result.status = QueueStatus.UnknownError;
                break;
            }
            result.status = QueueStatus.Ok;
            break;

        default:
            result.status = QueueStatus.UnknownError;
            break;
    }
    return result;
}

async function queueFile(p: QueueFile): Promise<QueueResult> {
    console.log(`Downloading file from ${p.url}...`);

    const resp = await dmQueueLink(p.url, p.opts);
    const result: QueueResult = {
        url: p.url,
        opts: p.opts,
        fileName: p.fileName,
        type: p.type,
        status: QueueStatus.Ok
    };
    result.status = resp ? QueueStatus.Ok : QueueStatus.UnknownError;
    return result;
}

async function queueDownload(url: string, referer: string, opts: Options): Promise<QueueResult> {
    const loginResp = await dmLogin(opts);
    if (!loginResp) {
        return {url, opts, status: QueueStatus.LoginFail};
    }

    const notATorrentMatch = Object.keys(notATorrentUrlPrefixes).filter(p => url.indexOf(p) === 0);
    if (notATorrentMatch.length > 0) {
        const prefixKey = notATorrentMatch[0];
        return await queueFile({url, opts, type: notATorrentUrlPrefixes[prefixKey]});
    }

    const resp = await xhr({
        method: "GET",
        url,
        headers: {
            [replaceRefererHeader]: referer
        },
        onHeadersReceived: req => {
            if (!isTorrentFile(req)) {
                console.log("Aborting XHR request as it's not a .torrent", url);
                req.abort();
            }
        },
        responseType: "blob"
    });

    const fileName = firstNonNull(
        getFileNameFromCD(resp.getResponseHeader("Content-Disposition")),
        getFileNameFromUrl(url)
    );
    if (resp.readyState === XMLHttpRequest.UNSENT) {
        console.log("XHR request was aborted. Queue as simple file", url);
        return await queueFile({url, fileName, opts, type: FileType.Plain});
    }
    return await queueTorrent({url, fileName, opts, blob: resp.response as Blob});
}

export default queueDownload;
