import {
	DateOfBirthConfiguration,
	EmailConfiguration,
	PasswordConfiguration,
} from ".";

export class RegisterConfiguration {
	email: EmailConfiguration = new EmailConfiguration();
	dateOfBirth: DateOfBirthConfiguration = new DateOfBirthConfiguration();
	password: PasswordConfiguration = new PasswordConfiguration();
	disabled: boolean = false;
	requireCaptcha: boolean = true;
	requireInvite: boolean = false;
	guestsRequireInvite: boolean = true;
	allowNewRegistration: boolean = true;
	allowMultipleAccounts: boolean = true;
	blockProxies: boolean = true;
	incrementingDiscriminators: boolean = false; // random otherwise
	defaultRights: string = "30644591655940"; // See `npm run generate:rights`
}
