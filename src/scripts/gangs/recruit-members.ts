import { NS } from "Bitburner";

export async function main(ns: NS) {
    await recruitGangMembers(ns);
}

/**
 * Recruits gang members whenever possible until the max number of members (30) is reached
 * @param ns BitBurner API
 */
export async function recruitGangMembers(ns: NS) {
    let gangMembers: string[] = [];
    while((gangMembers = ns.gang.getMemberNames()).length < 30) {
        if(ns.gang.canRecruitMember()) {
            const name = memberNames[gangMembers.length];
            
            ns.print(`Recruiting member ${name}`);
            ns.gang.recruitMember(name);
            ns.gang.setMemberTask(name, "Train Combat");
        }

        await ns.sleep(5000);
    }
}

const memberNames = [
    "Peter",
    "Paul",
    "Mary",
    "Joseph",
    "David",
    "Abraham",
    "Benjamin",
    "Gabriel",
    "Isaac",
    "Caleb",
    "Elijah",
    "Asher",
    "Hannah",
    "Daniel",
    "Esther",
    "Noah",
    "Sarah",
    "James",
    "Michael",
    "Ethan",
    "Levi",
    "Jacob",
    "Matthew",
    "Elizabeth",
    "Naomi",
    "Maria",
    "Delilah",
    "Ariel",
    "Enoch",
    "Gideon",
    "Solomon"
];