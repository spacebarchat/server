export class CaptchaConfiguration {
    enabled: boolean = false;
    service: "recaptcha" | "hcaptcha" | null = null; // TODO: hcaptcha, custom
    sitekey: string | null = null;
    secret: string | null = null;
}