import { Constants } from "/lib/Constants";
var Colors = Constants.Colors;
var Home = Constants.Home;
var LogLevel = Constants.LogLevel;
const ReadText = {
    readLines(ns, file) {
        return ns.read(file).split(/\r\n|\r|\n/g);
    },
    readNonEmptyLines(ns, file) {
        return ReadText.readLines(ns, file).filter((x) => x.trim() != "");
    }
};
const DownloadFiles = {
    async getFileToHome(ns, source, dest) {
        const logger = new TermLogger(ns);
        logger.info(`Downloading ${source.white()} -> ${dest.white()}`);
        if (!(await ns.wget(source, dest, Home))) {
            logger.err(`\tFailed retrieving ${source.white()} -> ${dest.white()}`);
        }
    }
};
const BasicSecurity = {
    maxSecurityLevel(ns) {
        return (+ns.fileExists(Constants.PurchasableProgram.BruteSSH, Home) +
            +ns.fileExists(Constants.PurchasableProgram.FTPCrack, Home) +
            +ns.fileExists(Constants.PurchasableProgram.RelaySMTP, Home) +
            +ns.fileExists(Constants.PurchasableProgram.HTTPWorm, Home) +
            +ns.fileExists(Constants.PurchasableProgram.SQLInject, Home));
    },
    break(ns, target, level) {
        if (level > 4)
            BasicSecurity.breakSQL(ns, target);
        if (level > 3)
            BasicSecurity.breakHTTP(ns, target);
        if (level > 2)
            BasicSecurity.breakSMTP(ns, target);
        if (level > 1)
            BasicSecurity.breakFTP(ns, target);
        if (level > 0)
            BasicSecurity.breakSSH(ns, target);
        ns.nuke(target);
    },
    breakSSH(ns, target) {
        ns.brutessh(target);
    },
    breakFTP(ns, target) {
        ns.ftpcrack(target);
    },
    breakSMTP(ns, target) {
        ns.relaysmtp(target);
    },
    breakHTTP(ns, target) {
        ns.httpworm(target);
    },
    breakSQL(ns, target) {
        ns.sqlinject(target);
    }
};
class TermLogger {
    constructor(ns) {
        this.ns = ns;
    }
    info(msg, ...args) {
        this.ns.tprintf(`${LogLevel.INFO} ${msg}`, ...args);
    }
    warn(msg, ...args) {
        this.ns.tprintf(`${LogLevel.WARN} ${msg}`, ...args);
    }
    err(msg, ...args) {
        this.ns.tprintf(`${LogLevel.ERROR} ${msg}`, ...args);
    }
    log(msg, ...args) {
        this.ns.tprintf(`${LogLevel.TRACE} ${msg}`, ...args);
    }
}
const repoSettings = {
    baseUrl: "http://localhost:9182",
    manifestPath: "/resources/manifest.txt"
};
class RepoInit {
    constructor(ns, logger) {
        this.ns = ns;
        this.logger = logger;
    }
    static getSourceDestPair(line) {
        return line.startsWith("./")
            ? {
                source: `${repoSettings.baseUrl}${line.substring(1)}`,
                dest: line.substring(1)
            }
            : null;
    }
    async downloadAllFiles() {
        await this.getManifest();
        const files = ReadText.readNonEmptyLines(this.ns, repoSettings.manifestPath);
        this.logger.info(`Contents of manifest:`);
        this.logger.info(`\t${files.join("\n")}`);
        for (let file of files) {
            const pair = RepoInit.getSourceDestPair(file);
            if (!pair) {
                this.logger.err(`Could not read line ${file.white()}`);
            }
            else {
                await DownloadFiles.getFileToHome(this.ns, pair.source, pair.dest);
            }
        }
    }
    async getManifest() {
        const manifestUrl = `${repoSettings.baseUrl}${repoSettings.manifestPath}`;
        this.logger.info(`Getting manifest...`);
        await DownloadFiles.getFileToHome(this.ns, manifestUrl, repoSettings.manifestPath);
    }
}
String.prototype.black = function () {
    return `${Colors.black}${this}${Colors.default}`;
};
String.prototype.red = function () {
    return `${Colors.red}${this}${Colors.default}`;
};
String.prototype.green = function () {
    return `${Colors.green}${this}${Colors.default}`;
};
String.prototype.yellow = function () {
    return `${Colors.yellow}${this}${Colors.default}`;
};
String.prototype.blue = function () {
    return `${Colors.blue}${this}${Colors.default}`;
};
String.prototype.magenta = function () {
    return `${Colors.magenta}${this}${Colors.default}`;
};
String.prototype.cyan = function () {
    return `${Colors.cyan}${this}${Colors.default}`;
};
String.prototype.white = function () {
    return `${Colors.white}${this}${Colors.default}`;
};
String.prototype.brightBlack = function () {
    return `${Colors.brightBlack}${this}${Colors.default}`;
};
String.prototype.brightRed = function () {
    return `${Colors.brightRed}${this}${Colors.default}`;
};
String.prototype.brightGreen = function () {
    return `${Colors.brightGreen}${this}${Colors.default}`;
};
String.prototype.brightYellow = function () {
    return `${Colors.brightYellow}${this}${Colors.default}`;
};
String.prototype.brightBlue = function () {
    return `${Colors.brightBlue}${this}${Colors.default}`;
};
String.prototype.brightMagenta = function () {
    return `${Colors.brightMagenta}${this}${Colors.default}`;
};
String.prototype.brightCyan = function () {
    return `${Colors.brightCyan}${this}${Colors.default}`;
};
String.prototype.brightWhite = function () {
    return `${Colors.brightWhite}${this}${Colors.default}`;
};
String.prototype.default = function () {
    return `${Colors.default}${this}${Colors.default}`;
};
export { ReadText, TermLogger, RepoInit, DownloadFiles, BasicSecurity };
