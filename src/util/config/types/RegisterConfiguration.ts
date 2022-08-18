import { DateOfBirthConfiguration, EmailConfiguration, PasswordConfiguration } from ".";

export class RegisterConfiguration {
    //classes
    email: EmailConfiguration = new EmailConfiguration();
    dateOfBirth: DateOfBirthConfiguration = new DateOfBirthConfiguration();
    password: PasswordConfiguration = new PasswordConfiguration();
    //base types
    disabled = false;
    requireCaptcha = true;
    requireInvite = false;
    guestsRequireInvite = true;
    allowNewRegistration = true;
    allowMultipleAccounts = true;
    blockProxies = true;
    incrementingDiscriminators = false; // random otherwise
    defaultRights = "648540060672";
}
