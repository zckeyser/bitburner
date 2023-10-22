import { CityName, NS } from "Bitburner";

// 100 billion
const DefaultMaxDevCost = 100_000_000_000;
const DevCostPercentOfFunds = .01

export async function main(ns: NS) {
    await developProducts(ns, String(ns.args[0]));
}

export async function developProducts(ns: NS, divisionName: string, maxDevCost: number=DefaultMaxDevCost) {
    ns.disableLog("sleep");
    let division = ns.corporation.getDivision(divisionName);
    const cities = division.cities;

    const cityName = "Aevum" as CityName;
    if(!cities.includes(cityName)) {
        ns.print(`No office in ${cityName} exists, creating one now`);
        while(ns.corporation.getCorporation().funds < 9000000000) {
            await ns.sleep(10000);
        }
        ns.corporation.expandCity(divisionName, cityName);
    }
    const corpConstants = ns.corporation.getConstants();

    ns.print(`Found existing products: ${division.products}`);

    let alreadyDevelopingProducts = division.products.map((p) => ns.corporation.getProduct(divisionName, cityName, p)).filter(p => p.developmentProgress < 100);
    if(alreadyDevelopingProducts.length > 0) {
        ns.print(`${alreadyDevelopingProducts.length} products are in development, waiting for them to complete before starting more`.yellow());
    }
    while(alreadyDevelopingProducts.length > 0) {
        alreadyDevelopingProducts = alreadyDevelopingProducts.map((p) => ns.corporation.getProduct(divisionName, cityName, p.name)).filter(p => p.developmentProgress < 100)
        
        for(const prod of alreadyDevelopingProducts) {
            ns.print(`Development progress of ${prod.name} is ${prod.developmentProgress}%`.cyan());
        }
        await ns.sleep(corpConstants.secondsPerMarketCycle * 1000);
    }
    for(const product of division.products) {
        ns.corporation.sellProduct(divisionName, cityName, product, "MAX", "MP", true);
    }
    const productNamePattern = new RegExp(`(auto: )?${divisionName} v(\d+)`); 

    // find the highest current product number, and name the next one 1 higher
    let productCount = division.products.map(p => p.match(productNamePattern)).filter(matches => (matches?.length || 0) > 0).reduce((acc, next) => Math.max(Number((next as any)[2]), acc), 0) + 1;

    ns.print("Entering main loop!".white());
    while(true) {
        productCount++;
        division = ns.corporation.getDivision(divisionName);
        if(division.products.length === division.maxProducts) {
            const oldestProduct = division.products[0];
            ns.print(`Discontinuing oldest product ${oldestProduct} of ${division.products}`.yellow());
            ns.corporation.discontinueProduct(divisionName, oldestProduct);
        }
        
        const corporation = ns.corporation.getCorporation();
        const productName = `auto: ${divisionName} v${productCount}`;
        const devCost = Math.min(maxDevCost, Math.floor(corporation.funds * DevCostPercentOfFunds));
        ns.print(`Making product ${productName} in division ${divisionName} and city ${cityName}`.cyan());
        ns.corporation.makeProduct(divisionName, cityName, productName , devCost, devCost);
        
        let product = ns.corporation.getProduct(divisionName, cityName, productName);
        while(product.developmentProgress < 100) {
            ns.print(`Development progress of ${product.name} is ${product.developmentProgress}%`.cyan());
            await ns.sleep(corpConstants.secondsPerMarketCycle * 1000);
            product = ns.corporation.getProduct(divisionName, cityName, productName);
        }

        ns.print(`Starting to sell product ${product}, which has a rating of ${product.rating} and an effective rating of ${product.effectiveRating}`);
        ns.corporation.sellProduct(divisionName, cityName, productName, "MAX", "MP", true);
    }
}