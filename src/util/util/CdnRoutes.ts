export const SPACEBAR_CDN_INTERNAL_PATH = "/_spacebar/cdn";
export const CLOUD_ATTACHMENT_INTERNAL_PATH = `${SPACEBAR_CDN_INTERNAL_PATH}/attachments`;

function trimTrailingSlash(value: string) {
    return value.endsWith("/") ? value.slice(0, -1) : value;
}

function trimLeadingSlash(value: string) {
    return value.startsWith("/") ? value.slice(1) : value;
}

export function getCloudAttachmentCdnPath(uploadFilename: string) {
    return `${CLOUD_ATTACHMENT_INTERNAL_PATH}/${trimLeadingSlash(uploadFilename)}`;
}

export function getCloudAttachmentCdnUrl(cdnEndpoint: string, uploadFilename: string) {
    return `${trimTrailingSlash(cdnEndpoint)}${getCloudAttachmentCdnPath(uploadFilename)}`;
}

export function getCloudAttachmentCloneCdnUrl(cdnEndpoint: string, uploadFilename: string, messageId: string) {
    return `${getCloudAttachmentCdnUrl(cdnEndpoint, uploadFilename)}/clone_to_message/${messageId}`;
}
