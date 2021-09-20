import { utility } from "roles/utility";
import { CREEP_STATES } from "utils/constants";
import { ErrorMapper } from "utils/ErrorMapper";
import { ui } from "utils/ui";
import { JOBS } from "jobs";
import { ROLES, roles } from "roles";
import { creepConfigs } from "utils/creepConfigs";

declare global {
	interface Memory {
		uuid: number;
		log: any;
	}

	interface CreepMemory {
		role: string
		state: CREEP_STATES
		job: string
		job2?: JOBS
		role2?: ROLES
		target?: string
		icon: string
	}

	// Syntax for adding proprties to `global` (ex "global.log")
	namespace NodeJS {
		interface Global {
			log: any;
		}
	}

	interface CreepConfig {
		parts: BodyPartConstant[]
		name: string
		options: SpawnOptions
	}
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
	const haulerCreeps = _.filter(Game.creeps, (creep) => creep.memory.role === 'HAULER')
	if (haulerCreeps.length < 1) {
		const config = creepConfigs.HAULER()
		Game.spawns['Spawn1'].spawnCreep(config.parts, config.name, config.options)
	}

	const utilityCreeps = _.filter(Game.creeps, (creep) => creep.memory.role === 'UTILITY')
	if (utilityCreeps.length < 0) {
		const config = utility.getConfig()
		Game.spawns['Spawn1'].spawnCreep(config.parts, config.name, config.options)
	}

	const harvesterCreeps = _.filter(Game.creeps, (creep) => creep.memory.role === 'HARVESTER')
	if (harvesterCreeps.length < 4) {
		const config = creepConfigs.HARVESTER()
		Game.spawns['Spawn1'].spawnCreep(config.parts, config.name, config.options)
	}

	const builderCreeps = _.filter(Game.creeps, (creep) => creep.memory.role === 'BUILDER')
	if (builderCreeps.length < 4) {
		const config = creepConfigs.BUILDER()
		Game.spawns['Spawn1'].spawnCreep(config.parts, config.name, config.options)
	}

	const upgraderCreeps = _.filter(Game.creeps, (creep) => creep.memory.role === 'UPGRADER')
	if (upgraderCreeps.length < 2) {
		const config = creepConfigs.UPGRADER()
		Game.spawns['Spawn1'].spawnCreep(config.parts, config.name, config.options)
	}



	utilityCreeps.forEach(creep => {
		utility.run(creep)
	})
	_.forEach(Game.creeps, (creep) => {
		try {
			roles[creep.memory.role2 as ROLES](creep)
			creep.say(`${creep.memory.icon}`)
		} catch (e) {
			// shh
		}
	})

	ui.run('E25S39')

	cleanupMemory()
});

const cleanupMemory = () => {
	// Automatically delete memory of missing creeps
	for (const name in Memory.creeps) {
		if (!(name in Game.creeps)) {
			delete Memory.creeps[name];
		}
	}
}
