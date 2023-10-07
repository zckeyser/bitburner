/** @param {NS} ns */
export async function main(ns) {
  let ramAmounts = [64, 128, 256, 512, 1024, 2048, 3000];
  let outputString = `ramAmount|serverCost|serversAffordable\n`;

  ramAmounts.forEach((ramAmount) => {
    let serverCost = ns.getPurchasedServerCost(ramAmount);
    let affordableCount = Math.floor(ns.getServerMoneyAvailable("home") / serverCost)
    outputString += `${ramAmount}|${serverCost}|${affordableCount}\n`
  });
  
  ns.write("./ram_costs.txt", outputString);
}