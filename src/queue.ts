import {getFileNameFromContentDisposition} from "./content-disposition";
import DownloadMaster from "./dm";
import Notifier from "./notifier";
import {loadOpts} from "./options";
import {Status} from "./status";
import {Proto} from "./url";
import UrlDescriptor from "./url-descriptor";
import {downloadWithProgress, getHeader, HttpHeader, isSuccessfulStatus, isTorrentFile} from "./util";

export default async function queue(link: string): Promise<Status> {

    const opts = await loadOpts();
    const url = new UrlDescriptor(link);

    const notifier = await Notifier.create(url, opts.notificationTimeout);
    const dm = new DownloadMaster(opts, status => notifier.update(status));

    try {

        if (url.proto !== Proto.Unknown) {
            return dm.queueUrl(url);
        }

        console.log(`Checking URL type. Sending GET request to ${url.link}`);

        const resp = await fetch(url.link);
        if (!isSuccessfulStatus(resp.status)) {
            return dm.queueUrl(url);
        }

        url.name = getFileNameFromContentDisposition(getHeader(resp, HttpHeader.ContentDisposition)) || url.name;
        console.log(`Detected name for ${url.link}: ${url.name}`);

        if (!isTorrentFile(getHeader(resp, HttpHeader.ContentType), url.name)) {
            return dm.queueUrl(url);
        }

        url.proto = Proto.Torrent;

        const torrent = await downloadWithProgress(resp, (c, t) =>
            notifier.update(Status.TorrentDownload, isNaN(t) ? undefined : ~~(c / t * 100)));

        return dm.queueTorrentAndConfirm(url, torrent);

    } catch (e) {

        console.error("Error occurred during URL queue: " + link, e);
        await notifier.update(Status.Error);
        return Status.Error;

    }
}
