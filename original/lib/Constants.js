export var Constants;
(function (Constants) {
    Constants.Home = "home";
    Constants.level0Targets = [
        "n00dles",
        "foodnstuff",
        "sigma-cosmetics",
        "joesguns",
        "hong-fang-tea",
        "harakiri-sushi"
    ];
    Constants.level1Targets = [
        "neo-net",
        "zer0",
        "max-hardware",
        "iron-gym"
    ];
    Constants.level2Targets = [
        "omega-net",
        "phantasy",
        "silver-helix",
        "avmnite-02h"
    ];
    Constants.level3Targets = [
        "netlink",
        "rothman-uni",
        "catalyst",
        "summit-uni",
        "I.I.I.I",
        "rho-construction"
    ];
    Constants.valuableTargets = [
        "phantasy",
        "the-hub",
        "rho-construction",
        "alpha-ent",
        "univ-energy",
        "unitalife",
        "deltaone",
        "zeus-med",
        "icarus",
        "stormtech",
        "4sigma",
        "kuai-gong",
        "megacorp",
        "nwo",
        "blade",
        ".",
        "fulcrumtech"
    ];
    Constants.MyHacks = {
        hgwHack: {
            path: "/hacks/hgw_target.js",
            paramCount: 1,
            paramType: typeof String
        }
    };
    let LogLevel;
    (function (LogLevel) {
        LogLevel["TRACE"] = "TRACE\t>";
        LogLevel["INFO"] = "INFO\t>";
        LogLevel["WARN"] = "WARN\t>";
        LogLevel["ERROR"] = "ERROR\t>";
    })(LogLevel = Constants.LogLevel || (Constants.LogLevel = {}));
    let ServerSize;
    (function (ServerSize) {
        ServerSize[ServerSize["G1"] = 1] = "G1";
        ServerSize[ServerSize["G2"] = 2] = "G2";
        ServerSize[ServerSize["G4"] = 4] = "G4";
        ServerSize[ServerSize["G8"] = 8] = "G8";
        ServerSize[ServerSize["G16"] = 16] = "G16";
        ServerSize[ServerSize["G32"] = 32] = "G32";
        ServerSize[ServerSize["G64"] = 64] = "G64";
        ServerSize[ServerSize["G128"] = 128] = "G128";
        ServerSize[ServerSize["G256"] = 256] = "G256";
        ServerSize[ServerSize["G512"] = 512] = "G512";
        ServerSize[ServerSize["T1"] = 1024] = "T1";
        ServerSize[ServerSize["T2"] = 2048] = "T2";
        ServerSize[ServerSize["T4"] = 4096] = "T4";
        ServerSize[ServerSize["T8"] = 8192] = "T8";
        ServerSize[ServerSize["T16"] = 16384] = "T16";
        ServerSize[ServerSize["T32"] = 32768] = "T32";
        ServerSize[ServerSize["T64"] = 65536] = "T64";
        ServerSize[ServerSize["T128"] = 131072] = "T128";
        ServerSize[ServerSize["T256"] = 262144] = "T256";
        ServerSize[ServerSize["T512"] = 524288] = "T512";
        ServerSize[ServerSize["P1"] = 1048576] = "P1";
    })(ServerSize = Constants.ServerSize || (Constants.ServerSize = {}));
    let PurchasableProgram;
    (function (PurchasableProgram) {
        PurchasableProgram["BruteSSH"] = "BruteSSH.exe";
        PurchasableProgram["FTPCrack"] = "FTPCrack.exe";
        PurchasableProgram["RelaySMTP"] = "relaySMTP.exe";
        PurchasableProgram["HTTPWorm"] = "HTTPWorm.exe";
        PurchasableProgram["SQLInject"] = "SQLInject.exe";
        PurchasableProgram["DeepScanV1"] = "DeepScanV1.exe";
        PurchasableProgram["DeepScanV2"] = "DeepScanV2.exe";
        PurchasableProgram["AutoLink"] = "AutoLink.exe";
    })(PurchasableProgram = Constants.PurchasableProgram || (Constants.PurchasableProgram = {}));
    Constants.Colors = {
        black: "\u001b[30m",
        red: "\u001b[31m",
        green: "\u001b[32m",
        yellow: "\u001b[33m",
        blue: "\u001b[34m",
        magenta: "\u001b[35m",
        cyan: "\u001b[36m",
        white: "\u001b[37m",
        brightBlack: "\u001b[30;1m",
        brightRed: "\u001b[31;1m",
        brightGreen: "\u001b[32;1m",
        brightYellow: "\u001b[33;1m",
        brightBlue: "\u001b[34;1m",
        brightMagenta: "\u001b[35;1m",
        brightCyan: "\u001b[36;1m",
        brightWhite: "\u001b[37;1m",
        default: "\u001b[0m"
    };
})(Constants || (Constants = {}));
