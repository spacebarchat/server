import { Config, CloudAttachment } from "@spacebar/util";
import { Request, Response, Router } from "express";
import imageSize from "image-size";
import { HTTPError } from "lambert-server";
import { storage } from "@spacebar/cdn";
import { fileTypeFromBuffer } from "file-type";

const router = Router({ mergeParams: true });

router.put("/:channel_id/:batch_id/:attachment_id/:filename", async (req: Request, res: Response) => {
    const { channel_id, batch_id, attachment_id, filename } = req.params as { [key: string]: string };
    const att = await CloudAttachment.findOneOrFail({
        where: {
            uploadFilename: `${channel_id}/${batch_id}/${attachment_id}/${filename}`,
            channelId: channel_id,
            userAttachmentId: attachment_id,
            userFilename: filename,
        },
    });

    const maxLength = Config.get().cdn.maxAttachmentSize;

    console.log("[Cloud Upload] Uploading attachment", att.id, att.userFilename, `Max size: ${maxLength} bytes`);

    const chunks: Buffer[] = [];
    let length = 0;

    req.on("data", (chunk) => {
        console.log(`[Cloud Upload] Received chunk of size ${chunk.length} bytes`);
        chunks.push(chunk);
        length += chunk.length;
        if (length > maxLength) {
            res.status(413).send("File too large");
            req.destroy();
        }
    });
    req.on("end", async () => {
        console.log(`[Cloud Upload] Finished receiving file, total size ${length} bytes`);
        const buffer = Buffer.concat(chunks);
        const path = `attachments/${channel_id}/${batch_id}/${attachment_id}/${filename}`;

        await storage.set(path, buffer);

        let mimeType = att.userOriginalContentType;
        if (att.userOriginalContentType === null) {
            const ft = await fileTypeFromBuffer(buffer);
            mimeType = att.contentType = ft?.mime || "application/octet-stream";
        }

        if (mimeType?.includes("image")) {
            const dimensions = imageSize(buffer);
            if (dimensions) {
                att.width = dimensions.width;
                att.height = dimensions.height;
            }
        }

        att.size = buffer.length;
        await att.save();

        console.log("[Cloud Upload] Saved attachment", att.id, att.userFilename);
        res.status(200).end();
    });
});

router.delete("/:channel_id/:batch_id/:attachment_id/:filename", async (req: Request, res: Response) => {
    if (req.headers.signature !== Config.get().security.requestSignature) throw new HTTPError("Invalid request signature");
    console.log("[Cloud Delete] Deleting attachment", req.params);

    const { channel_id, batch_id, attachment_id, filename } = req.params as { [key: string]: string };
    const path = `attachments/${channel_id}/${batch_id}/${attachment_id}/${filename}`;

    const att = await CloudAttachment.findOne({
        where: {
            uploadFilename: `${channel_id}/${batch_id}/${attachment_id}/${filename}`,
            channelId: channel_id,
            userAttachmentId: attachment_id,
            userFilename: filename,
        },
    });

    if (att) {
        await att.remove();
        await storage.delete(path);
        return res.send({ success: true });
    }
    return res.status(404).send("Attachment not found");
});

router.post("/:channel_id/:batch_id/:attachment_id/:filename/clone_to_message/:message_id", async (req: Request, res: Response) => {
    if (req.headers.signature !== Config.get().security.requestSignature) throw new HTTPError("Invalid request signature");
    console.log("[Cloud Clone] Cloning attachment to message", req.params);

    const { channel_id, batch_id, attachment_id, filename, message_id } = req.params as { [key: string]: string };
    const path = `attachments/${channel_id}/${batch_id}/${attachment_id}/${filename}`;
    const newPath = `attachments/${channel_id}/${message_id}/${filename}`;

    const att = await CloudAttachment.findOne({
        where: {
            uploadFilename: `${channel_id}/${batch_id}/${attachment_id}/${filename}`,
            channelId: channel_id,
            userAttachmentId: attachment_id,
            userFilename: filename,
        },
    });

    if (att) {
        await storage.clone(path, newPath);
        return res.send({ success: true, new_path: newPath });
    }

    return res.status(404).send("Attachment not found");
});

export default router;
