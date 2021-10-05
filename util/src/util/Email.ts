export const EMAIL_REGEX =
	/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function adjustEmail(email?: string): string | undefined {
	if (!email) return email;
	// body parser already checked if it is a valid email
	const parts = <RegExpMatchArray>email.match(EMAIL_REGEX);
	// @ts-ignore
	if (!parts || parts.length < 5) return undefined;
	const domain = parts[5];
	const user = parts[1];

	// TODO: check accounts with uncommon email domains
	if (domain === "gmail.com" || domain === "googlemail.com") {
		// replace .dots and +alternatives -> Gmail Dot Trick https://support.google.com/mail/answer/7436150 and https://generator.email/blog/gmail-generator
		return user.replace(/[.]|(\+.*)/g, "") + "@gmail.com";
	}

	return email;
}
