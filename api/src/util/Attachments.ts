import { Attachment } from "@fosscord/util";
import { deleteFile } from "@fosscord/api";
import { URL } from "url";

export async function deleteMessageAttachments(messageId: string, keep?: Attachment[]) {
	let attachments = await Attachment.find({ message_id: messageId });
	if (keep)
		attachments = attachments.filter(x => !keep.map(k => k.id).includes(x.id));
	await Promise.all(attachments.map(a => a.remove()));

	attachments.forEach(a => deleteFile((new URL(a.url)).pathname)); //We don't need to await since this is done on the cdn
}
