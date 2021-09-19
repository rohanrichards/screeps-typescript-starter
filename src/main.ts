import { builder } from "roles/builder";
import { harvester } from "roles/harvester";
import { hauler } from "roles/hauler";
import { upgrader } from "roles/upgrader";
import { utility } from "roles/utility";
import { CREEP_STATES, ICReepJobs } from "utils/constants";
import { ErrorMapper } from "utils/ErrorMapper";
import { ui } from "utils/ui";

declare global {
	interface Memory {
		uuid: number;
		log: any;
	}

	interface CreepMemory {
		role: string;
		state: CREEP_STATES
		job: string;
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
	const utilityCreeps = _.filter(Game.creeps, (creep) => creep.memory.role === 'UTILITY')
	if (utilityCreeps.length < 8) {
		const config = utility.getConfig()
		Game.spawns['Spawn1'].spawnCreep(config.parts, config.name, config.options)
	}

	const harvesterCreeps = _.filter(Game.creeps, (creep) => creep.memory.role === 'HARVESTER')
	if (harvesterCreeps.length < 0) {
		const config = harvester.getConfig()
		Game.spawns['Spawn1'].spawnCreep(config.parts, config.name, config.options)
	}

	const haulerCreeps = _.filter(Game.creeps, (creep) => creep.memory.role === 'HAULER')
	if (haulerCreeps.length < 0) {
		const config = hauler.getConfig()
		Game.spawns['Spawn1'].spawnCreep(config.parts, config.name, config.options)
	}

	const upgraderCreeps = _.filter(Game.creeps, (creep) => creep.memory.role === 'UPGRADER')
	if (upgraderCreeps.length < 0) {
		const config = upgrader.getConfig()
		Game.spawns['Spawn1'].spawnCreep(config.parts, config.name, config.options)
	}

	const builderCreeps = _.filter(Game.creeps, (creep) => creep.memory.role === 'BUILDER')
	if (builderCreeps.length < 0) {
		const config = builder.getConfig()
		Game.spawns['Spawn1'].spawnCreep(config.parts, config.name, config.options)
	}

	utilityCreeps.forEach(creep => {
		utility.run(creep)
	})
	harvesterCreeps.forEach(creep => {
		harvester.run(creep)
	})
	haulerCreeps.forEach(creep => {
		hauler.run(creep)
	})
	upgraderCreeps.forEach(creep => {
		upgrader.run(creep)
	})
	builderCreeps.forEach(creep => {
		builder.run(creep)
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
