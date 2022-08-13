export class Environment {
    static isDebug: boolean = /--debug|--inspect/.test(process.execArgv.join(' '));
}
