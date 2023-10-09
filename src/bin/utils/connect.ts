import { NS } from "Bitburner";
import { TermLogger } from "/lib/Helpers";
import { scanNetwork } from "/lib/servers/scan-servers";

export async function main(ns: NS) {
    let logger = new TermLogger(ns);
    const target = String(ns.args[0]);
    if(!target) {
        logger.err("Must provide target argument");
        return;
    }
    const path = findPath(ns, target);

    if(!path) {
        logger.err(`Target ${target} was not found on the network`);
        return;
    }

    chainConnect(ns, path);
}

interface FindResult {
    foundTarget: boolean,
    path: string[]
}

/**
 * Finds a path to the target server on the current network. Returns an empty array if none exists.
 * @param ns BitBurner API
 * @param target server to find
 * @returns array of intermediate servers to reach the target server
 */
export function findPath(ns: NS, target: string): string[] {
    const network = scanNetwork(ns)[1];

    function findTarget(networkSubset: Object): FindResult {
        let findResult = {path: [] as string[], foundTarget: false};
        // note: the network is a tree, so we don't need to check for cycles
        const neighbors = Object.keys(networkSubset);
        neighbors.forEach(server => {
            if(findResult.foundTarget) {
                // we've already found the target, no need to search further
                return;
            }
            if (server == target) {
                findResult = {
                    path: [target],
                    foundTarget: true
                };
                return;
            } else {
                let searchResult = findTarget(networkSubset[server]);
                if(searchResult.foundTarget) {
                    findResult = {
                        path: [server, ...searchResult.path],
                        foundTarget: true
                    };
                    return;
                }
            }
        });
        return findResult;
    }

    return findTarget(network).path;
}

/**
 * connects through a chain of servers to reach a final destination server
 * @param ns BitBurner API
 * @param path servers to connect to, in order
 */
export function chainConnect(ns: NS, path: string[]) {
    path.forEach(ns.singularity.connect);
}

/**
 * sample network map for reference
 * export const ServerMap = {
  "n00dles": {},
  "foodnstuff": {
    "nectar-net": {
      "phantasy": {
        "computek": {
          "I.I.I.I": {
            "alpha-ent": {}
          }
        },
        "crush-fitness": {
          "summit-uni": {
            "aevum-police": {}
          }
        }
      }
    }
  },
  "sigma-cosmetics": {
    "CSEC": {}
  },
  "joesguns": {},
  "hong-fang-tea": {
    "max-hardware": {}
  },
  "harakiri-sushi": {
    "zer0": {
      "neo-net": {
        "netlink": {
          "zb-institute": {}
        }
      },
      "silver-helix": {},
      "omega-net": {
        "the-hub": {
          "catalyst": {
            "lexo-corp": {
              "global-pharm": {
                "omnia": {}
              },
              "snap-fitness": {
                "deltaone": {
                  "univ-energy": {}
                },
                "unitalife": {
                  "defcomm": {},
                  "icarus": {
                    "infocomm": {},
                    "taiyang-digital": {
                      "titan-labs": {
                        "fulcrumtech": {}
                      },
                      "microdyne": {
                        "stormtech": {
                          "omnitek": {
                            "nwo": {
                              "fulcrumassets": {}
                            },
                            "powerhouse-fitness": {
                              "ecorp": {},
                              "megacorp": {}
                            }
                          }
                        },
                        "helios": {}
                      }
                    }
                  },
                  "solaris": {
                    "nova-med": {
                      "applied-energetics": {
                        "vitalife": {
                          "4sigma": {},
                          "kuai-gong": {
                            "b-and-a": {
                              "The-Cave": {
                                "w0r1d_d43m0n": {}
                              }
                            },
                            "blade": {}
                          },
                          ".": {
                            "clarkinc": {}
                          }
                        }
                      },
                      "run4theh111z": {}
                    }
                  },
                  "zeus-med": {
                    "zb-def": {}
                  }
                }
              }
            },
            "millenium-fitness": {
              "aerocorp": {}
            }
          }
        },
        "johnson-ortho": {
          "rothman-uni": {}
        },
        "avmnite-02h": {
          "syscore": {
            "rho-construction": {
              "galactic-cyber": {}
            }
          }
        }
      }
    }
  },
  "iron-gym": {}
};
 */