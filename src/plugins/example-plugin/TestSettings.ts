export class TestSettings {
    someInt: number = 10;
    someStr: string = "asdf";
    someBool: boolean = true;
    someDate: Date = new Date();
    subSettings: SubSettings = new SubSettings();
}

export class SubSettings {
    someStr: string = "jklm";
}