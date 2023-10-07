import {CompanyNames} from "lib/singularity/companies"

/**
 * @param {NS} ns
 */
export async function main(ns) {
  let highestSalaryJob = getHighestSalaryWorkableJob(ns);
  let companyName = highestSalaryJob[0];
  let jobInfo = highestSalaryJob[1];
  ns.singularity.workForCompany(companyName, jobInfo.name, false);
}

/**
 * @param {NS} ns
 * @return {[string, CompanyPositionInfo]} the highest salary job currently workable by the player
 */
export function getHighestSalaryWorkableJob(ns) {
  let workableJobs = getWorkableJobs(ns);

  workableJobs.sort((a, b) => a.salary - b.salary);

  return workableJobs[0];
}

/** 
 * Gets a list of available jobs that the player is able to perform
 * @param {NS} ns 
 * @return {[string, CompanyPositionInfo][]} pairs of company name + job information of all positions that are workable 
 */
export function getWorkableJobs(ns) {
  let player = ns.getPlayer();

  return CompanyNames.reduce((workablePositions, companyName) => {
    const positionNames = ns.singularity.getCompanyPositions(companyName);

    const positionInfos = positionNames.map((positionName) => {return [companyName, ns.singularity.getCompanyPositionInfo(companyName, positionName)]});

    const localWorkablePositions = positionInfos.filter(([companyName, positionInfo]) => {
      return positionInfo.requiredSkills.agility <= player.skills.agility &&
             positionInfo.requiredSkills.charisma <= player.skills.charisma &&
             positionInfo.requiredSkills.dexterity <= player.skills.dexterity &&
             positionInfo.requiredSkills.defense <= player.skills.defense &&
             positionInfo.requiredSkills.hacking <= player.skills.hacking &&
             positionInfo.requiredSkills.strength <= player.skills.strength &&
             positionInfo.requiredReputation <= ns.singularity.getCompanyRep(companyName);
    });
    
    workablePositions = workablePositions.concat(localWorkablePositions);
  }, []);
}

/** 
 * @param {NS} ns
 *  
 */
export function getBestMoneyMakingMethod(ns) {

}

/**
 * @param {NS} ns
 */
export async function makeMoney(ns) {

}