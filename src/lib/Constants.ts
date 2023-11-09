export module Constants {
    export const Home = "home";

    export const level0Targets   = [
        "n00dles",
        "foodnstuff",
        "sigma-cosmetics",
        "joesguns",
        "hong-fang-tea",
        "harakiri-sushi"
    ];
    export const level1Targets   = [
        "neo-net",
        "zer0",
        "max-hardware",
        "iron-gym"
    ];
    export const level2Targets   = [
        "omega-net",
        "phantasy",
        "silver-helix",
        "avmnite-02h"
    ];
    export const level3Targets   = [
        "netlink",
        "rothman-uni",
        "catalyst",
        "summit-uni",
        "I.I.I.I",
        "rho-construction"
    ];
    export const valuableTargets = [
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

    export const MyHacks = {
        hgwHack: {
            path: "/hacks/hgw_target.js",
            paramCount: 1,
            paramType: typeof String
        }
    };

    export enum PurchasableProgram {
        BruteSSH   = "BruteSSH.exe",
        FTPCrack   = "FTPCrack.exe",
        RelaySMTP  = "relaySMTP.exe",
        HTTPWorm   = "HTTPWorm.exe",
        SQLInject  = "SQLInject.exe",
        DeepScanV1 = "DeepScanV1.exe",
        DeepScanV2 = "DeepScanV2.exe",
        AutoLink   = "AutoLink.exe",
        ServerProfiler = "serverprofiler.exe"
    }

    export enum LogLevel {
        TRACE = "TRACE\t>",
        INFO  = "INFO\t>",
        WARN  = "WARN\t>",
        ERROR = "ERROR\t>"
    }

    export enum ServerSize {
        G1   = 1,
        G2   = 1 << 1,
        G4   = 1 << 2,
        G8   = 1 << 3,
        G16  = 1 << 4,
        G32  = 1 << 5,
        G64  = 1 << 6,
        G128 = 1 << 7,
        G256 = 1 << 8,
        G512 = 1 << 9,
        T1   = 1 << 10,
        T2   = 1 << 11,
        T4   = 1 << 12,
        T8   = 1 << 13,
        T16  = 1 << 14,
        T32  = 1 << 15,
        T64  = 1 << 16,
        T128 = 1 << 17,
        T256 = 1 << 18,
        T512 = 1 << 19,
        P1   = 1 << 20
    }

    export type StockSymbol =
        | "ECP"
        | "MGCP"
        | "BLD"
        | "CLRK"
        | "OMTK"
        | "FSIG"
        | "KGI"
        | "FLCM"
        | "STM"
        | "DCOMM"
        | "HLS"
        | "VITA"
        | "ICRS"
        | "UNV"
        | "AERO"
        | "OMN"
        | "SLRS"
        | "GPH"
        | "NVMD"
        | "WDS"
        | "LXO"
        | "RHOC"
        | "APHE"
        | "SYSC"
        | "CTK"
        | "NTLK"
        | "OMGA"
        | "FNS"
        | "SGC"
        | "JGN"
        | "CTYS"
        | "MDYN"
        | "TITN";

    export type OrderType =
        | "limitbuy"
        | "limitsell"
        | "stopbuy"
        | "stopsell";

    export type OrderPos =
        | "long"
        | "short";

    export type University =
        | "Summit University"
        | "Rothman University"
        | "ZB Institute Of Technology";

    export type UniversityCourse =
        | "Study Computer Science"
        | "Data Strucures"
        | "Networks"
        | "Algorithms"
        | "Management"
        | "Leadership";

    export type Gym =
        | "Crush Fitness Gym"
        | "Snap Fitness Gym"
        | "Iron Gym"
        | "Powerhouse Gym"
        | "Millenium Fitness Gym";

    export type GymStat =
        | "str"
        | "def"
        | "dex"
        | "agi";

    export type City =
        | "Aevum"
        | "Chongqing"
        | "Sector-12"
        | "New Tokyo"
        | "Ishima"
        | "Volhaven";

    export const Colors = {
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
}

export enum CompanyName {
    // Sector-12
    MegaCorp = "MegaCorp",
    BladeIndustries = "BladeIndustries",
    FourSigma = "FourSigma",
    IcarusMicrosystems = "IcarusMicroSystems",
    UniversalEnergy = "UniversalEnergy",
    DeltaOne = "DeltaOne",
    CIA = "CIA",
    NSA = "NSA",
    AlphaEnterprises = "AlphaEnterprises",
    CarmichaelSecurity = "CarmichaelSecurity",
    FoodNStuff = "FoodNStuff",
    JoesGuns = "JoesGuns",

    // Aevum
    ECorp = "ECorp",
    BachmanAndAssociates = "BachmanAndAssociates",
    ClarkeIncorporated = "ClarkeIncorporated",
    OmniTekIncorporated = "OmniTekIncorporated",
    FulcrumTechnologies = "FulcrumTechnologies",
    GalacticCybersystems = "GalacticCybersystems",
    AeroCorp = "AeroCorp",
    WatchdogSecurity = "WatchdogSecurity",
    RhoConstruction = "RhoConstruction",
    AevumPolice = "AevumPolice",
    NetLinkTechnologies = "NetLinkTechnologies",

    // Volhaven
    NWO = "NWO",
    HeliosLabs = "HeliosLabs",
    OmniaCybersystems = "OmniaCybersystems",
    LexoCorp = "LexoCorp",
    SysCoreSecurities = "SysCoreSecurities",
    CompuTek = "CompuTek",

    // Chongqing
    KuaiGongInternational = "KuaiGongInternational",
    SolarisSpaceSystems = "SolarisSpaceSystems",

    // Ishima
    StormTechnologies = "StormTechnologies",
    NovaMedical = "NovaMedical",
    OmegaSoftware = "OmegaSoftware",

    // New Tokyo
    DefComm = "DefComm",
    VitaLife = "VitaLife",
    GlobalPharmaceuticals = "GlobalPharmaceuticals",
    NoodleBar = "NoodleBar"
}


export type CompanyField =
    | "software"
    | "software consultant"
    | "it"
    | "security engineer"
    | "network engineer"
    | "business"
    | "business consultant"
    | "security"
    | "agent"
    | "employee"
    | "part-time employee"
    | "waiter"
    | "part-time waiter";

export type FactionName =
    | "Illuminati"
    | "Daedalus"
    | "The Covenant"
    | "ECorp"
    | "MegaCorp"
    | "Bachman & Associates"
    | "Blade Industries"
    | "NWO"
    | "Clarke Incorporated"
    | "OmniTek Incorporated"
    | "Four Sigma"
    | "KuaiGong International"
    | "Fulcrum Secret Technologies"
    | "BitRunners"
    | "The Black Hand"
    | "NiteSec"
    | "Aevum"
    | "Chongqing"
    | "Ishima"
    | "New Tokyo"
    | "Sector-12"
    | "Volhaven"
    | "Speakers for the Dead"
    | "The Dark Army"
    | "The Syndicate"
    | "Silhouette"
    | "Tetrads"
    | "Slum Snakes"
    | "Netburners"
    | "Tian Di Hui"
    | "CyberSec"
    | "Bladeburners";

export type GangName =
    | "Slum Snakes"
    | "Tetrads"
    | "The Syndicate"
    | "The Dark Army"
    | "Speakers for the Dead"
    | "NiteSec"
    | "The Black Hand";

export type FactionWork =
    | "hacking"
    | "field"
    | "security";

export type Crime =
    | "shoplift"
    | "rob store"
    | "mug"
    | "larceny"
    | "deal drugs"
    | "bond forgery"
    | "traffick arms"
    | "homicide"
    | "grand theft auto"
    | "kidnap"
    | "assassinate"
    | "heist";

export type AugmentName =
    | "Augmented Targeting I"
    | "Augmented Targeting II"
    | "Augmented Targeting III"
    | "Synthetic Heart"
    | "Synfibril Muscle"
    | "Combat Rib I"
    | "Combat Rib II"
    | "Combat Rib III"
    | "Nanofiber Weave"
    | "NEMEAN Subdermal Weave"
    | "Wired Reflexes"
    | "Graphene Bone Lacings"
    | "Bionic Spine"
    | "Graphene Bionic Spine Upgrade"
    | "Bionic Legs"
    | "Graphene Bionic Legs Upgrade"
    | "Speech Processor Implant"
    | "TITN-41 Gene-Modification Injection"
    | "Enhanced Social Interaction Implant"
    | "BitWire"
    | "Artificial Bio-neural Network Implant"
    | "Artificial Synaptic Potentiation"
    | "Enhanced Myelin Sheathing"
    | "Synaptic Enhancement Implant"
    | "Neural-Retention Enhancement"
    | "DataJack"
    | "Embedded Netburner Module"
    | "Embedded Netburner Module Core Implant"
    | "Embedded Netburner Module Core V2 Upgrade"
    | "Embedded Netburner Module Core V3 Upgrade"
    | "Embedded Netburner Module Analyze Engine"
    | "Embedded Netburner Module Direct Memory Access Upgrade"
    | "Neuralstimulator"
    | "Neural Accelerator"
    | "Cranial Signal Processors - Gen I"
    | "Cranial Signal Processors - Gen II"
    | "Cranial Signal Processors - Gen III"
    | "Cranial Signal Processors - Gen IV"
    | "Cranial Signal Processors - Gen V"
    | "Neuronal Densification"
    | "Nuoptimal Nootropic Injector Implant"
    | "Speech Enhancement"
    | "FocusWire"
    | "PC Direct-Neural Interface"
    | "PC Direct-Neural Interface Optimization Submodule"
    | "PC Direct-Neural Interface NeuroNet Injector"
    | "ADR-V1 Pheromone Gene"
    | "ADR-V2 Pheromone Gene"
    | "The Shadow's Simulacrum"
    | "Hacknet Node CPU Architecture Neural-Upload"
    | "Hacknet Node Cache Architecture Neural-Upload"
    | "Hacknet Node NIC Architecture Neural-Upload"
    | "Hacknet Node Kernel Direct-Neural Interface"
    | "Hacknet Node Core Direct-Neural Interface"
    | "NeuroFlux Governor"
    | "Neurotrainer I"
    | "Neurotrainer II"
    | "Neurotrainer III"
    | "HyperSight Corneal Implant"
    | "LuminCloaking-V1 Skin Implant"
    | "LuminCloaking-V2 Skin Implant"
    | "HemoRecirculator"
    | "SmartSonar Implant"
    | "Power Recirculation Core"
    | "QLink"
    | "The Red Pill"
    | "SPTN-97 Gene Modification"
    | "ECorp HVMind Implant"
    | "CordiARC Fusion Reactor"
    | "SmartJaw"
    | "Neotra"
    | "Xanipher"
    | "nextSENS Gene Modification"
    | "OmniTek InfoLoad"
    | "Photosynthetic Cells"
    | "BitRunners Neurolink"
    | "The Black Hand"
    | "CRTX42-AA Gene Modification"
    | "Neuregen Gene Modification"
    | "CashRoot Starter Kit"
    | "NutriGen Implant"
    | "INFRARET Enhancement"
    | "DermaForce Particle Barrier"
    | "Graphene BranchiBlades Upgrade"
    | "Graphene Bionic Arms Upgrade"
    | "BrachiBlades"
    | "Bionic Arms"
    | "Social Negotiation Assistant (S.N.A)"
    | "EsperTech Bladeburner Eyewear"
    | "EMS-4 Recombination"
    | "ORION-MKIV Shoulder"
    | "Hyperion Plasma Cannon V1"
    | "Hyperion Plasma Cannon V2"
    | "GOLEM Serum"
    | "Vangelis Virus"
    | "Vangelis Virus 3.0"
    | "I.N.T.E.R.L.I.N.K.E.D"
    | "Blade's Runners"
    | "BLADE-51b Tesla Armor"
    | "BLADE-51b Tesla Armor: Power Cells Upgrade"
    | "BLADE-51b Tesla Armor: Energy Shielding Upgrade"
    | "BLADE-51b Tesla Armor: Unibeam Upgrade"
    | "BLADE-51b Tesla Armor: Omnibeam Upgrade"
    | "BLADE-51b Tesla Armor: IPU Upgrade"
    | "The Blade's Simulacrum";

export type JSONValue = string|boolean|number|object|JSONValue[];

// TODO: segregate by region
export const Gyms = [
    "powerhouse gym"
];
export const Universities = [
    "rothman university"
]

export const ActionScriptsDirectory = "scripts/hack/actions/";
export const WeakenScriptLocation = `${ActionScriptsDirectory}weaken.js`;
export const GrowScriptLocation = `${ActionScriptsDirectory}grow.js`;
export const HackScriptLocation = `${ActionScriptsDirectory}hack.js`;
export const InitScriptLocation = `${ActionScriptsDirectory}init.js`;

export const ConfigFile = `data/config.txt`;

export const SecurityIncreaseForHack = 0.002;
export const SecurityIncreaseForGrow = 0.004;
export const SecurityDecreaseForWeaken = 0.05;

export const DefaultMaxBatchThreads = 512;
export const DefaultMinServerMoneyPercent = 0.3;
export const MinBatcherRam = 256;
export const ActionScriptRamUsage = 1.75;
export const DefaultRequiredBatchRam = DefaultMaxBatchThreads * ActionScriptRamUsage;

// Gang constants
export const GangCycleLength = 5000;
// constants for various thresholds to do diff jobs
export const BaseInitialTrainingThreshold = 100;
export const MaxInitialTrainingThreshold = 1000;
export const TraffickArmsThreshold = 200;
export const WantedPenaltyThreshold = .95;
export const VigilanteStatThreshold = 100;


export const UtilServerName = `util-serv`;
