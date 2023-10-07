import {NS, CompanyPositionInfo} from "Bitburner";
import {CompanyName} from "lib/Constants"

/**
 * @param ns BitBurner API
 */
export async function main(ns: NS) {
  let highestSalaryJob = getHighestSalaryWorkableJob(ns);
  ns.singularity.applyToCompany(highestSalaryJob.companyName, highestSalaryJob.positionInfo.name)
  ns.singularity.workForCompany(highestSalaryJob.companyName, false);
}

export interface CompanyPosition {
  companyName: string;
  positionInfo: CompanyPositionInfo
}

/**
 * @param {NS} ns BitBurner API
 * @return {[string, CompanyPositionInfo]} the highest salary job currently workable by the player
 */
export function getHighestSalaryWorkableJob(ns: NS): CompanyPosition {
  let workableJobs = getWorkableJobs(ns);

  workableJobs.sort((a, b) => a.positionInfo.salary - b.positionInfo.salary);

  return workableJobs[0];
}

/** 
 * Gets a list of available jobs that the player is able to perform
 * @param {NS} ns BitBurner API
 * @return {[string, CompanyPositionInfo][]} pairs of company name + job information of all positions that are workable 
 */
export function getWorkableJobs(ns: NS) {
  let player = ns.getPlayer();

  // TODO: get a list of these names
  let companyNames = Object.values(CompanyName);

  let workablePositions: CompanyPosition[] = [];

  for(let i = 0; i < companyNames.length; i++) {
    let companyName = companyNames[i];
    const positionNames = ns.singularity.getCompanyPositions(companyName);

    const positionInfos: CompanyPosition[] = positionNames.map((positionName) => {
      return {
        companyName: companyName, 
        positionInfo: ns.singularity.getCompanyPositionInfo(companyName, positionName)
      };
    });

    const localWorkablePositions = positionInfos.filter((companyPositionInfo) => {
      return companyPositionInfo.positionInfo.requiredSkills.agility <= player.skills.agility &&
              companyPositionInfo.positionInfo.requiredSkills.charisma <= player.skills.charisma &&
              companyPositionInfo.positionInfo.requiredSkills.dexterity <= player.skills.dexterity &&
              companyPositionInfo.positionInfo.requiredSkills.defense <= player.skills.defense &&
              companyPositionInfo.positionInfo.requiredSkills.hacking <= player.skills.hacking &&
              companyPositionInfo.positionInfo.requiredSkills.strength <= player.skills.strength &&
              companyPositionInfo.positionInfo.requiredReputation <= ns.singularity.getCompanyRep(companyName)
    });
    
    workablePositions = workablePositions.concat(localWorkablePositions);
  }

  return workablePositions;
}
