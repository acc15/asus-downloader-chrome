import {getFileNameFromContentDisposition} from "./content-disposition/content-disposition";
import DownloadMaster from "./dm";
import Notifier from "./notifier";
import {loadOpts} from "./options";
import Status from "./status";
import {Proto} from "./url";
import UrlDesc from "./url-desc";
import {downloadWithProgress, getHeader, HttpHeader, isSuccessfulStatus, isTorrentFile, withTimeout} from "./util";

export default async function queue(link: string): Promise<Status> {

    const opts = await loadOpts();
    const url = new UrlDesc(link);

    const notifier = await Notifier.create(url, opts.notificationTimeout);
    const dm = new DownloadMaster(opts, status => notifier.update(status));

    try {

        if (url.proto !== Proto.Unknown) {
            return dm.queueUrl(url);
        }

        console.log(`Checking URL type. Sending GET request to ${url.link}`);

        const resp = await withTimeout(opts.requestTimeout, signal => fetch(url.link, {signal}))
        if (!isSuccessfulStatus(resp.status)) {
            return dm.queueUrl(url);
        }

        const cdName = getFileNameFromContentDisposition(getHeader(resp, HttpHeader.ContentDisposition));
        if (cdName) {
            url.name = cdName;
            console.log(`Detected filename from Content-Disposition for ${url.link}: ${url.name}`);
        } else {
            console.log(`Unable to detect filename from Content-Disposition for ${url.link}`);
        }

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
