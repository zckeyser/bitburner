/**
 * @param {string} target
 */
async function init(target) {

}

/** @param {NS} ns */
export async function main(ns) {
  let target = ns.args[0];
  let functionType = ns.args[1];
  let threads = parseInt(ns.args[2]);

  let dispatchMap = {
    hack: ns.hack,
    weaken: ns.weaken,
    grow: ns.grow,
    init: init
  }

  if (functionType in dispatchMap) {
    dispatchMap[functionType](target);
  } else {
    throw Exception(`Unrecognized functionType: ${functionType}`);
  }
}