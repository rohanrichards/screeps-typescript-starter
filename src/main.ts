import { CREEP_STATES } from "utils/constants";
import { ErrorMapper } from "utils/ErrorMapper";
import { ui } from "utils/ui";
import { ROLES, roles } from "roles";
import { creepConfigs } from "utils/creepConfigs";

declare global {
	interface Memory {
		uuid: number;
		log: any;
	}

	interface CreepMemory {
		role: ROLES
		state: CREEP_STATES
		job: string
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

const RoleCounts = new Map([
	[ROLES.UPGRADER, 2],
	[ROLES.BUILDER, 2],
	[ROLES.HAULER, 2],
	[ROLES.HARVESTER, 3],
	[ROLES.UTILITY, 1],
])

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
	const creepMap: Map<ROLES, number> = new Map()

	// loop through all creeps
	_.forEach(Game.creeps, (creep) => {
		// figure out how many of each creep we have
		let count = creepMap.get(creep.memory.role) ?? 0
		creepMap.set(creep.memory.role, ++count)

		// call their control methods
		try {
			roles[creep.memory.role as ROLES](creep)
			creep.say(`${creep.memory.icon}`)
		} catch (e) {
			console.log('uncaught error in main.ts: ', e)
			// shh
		}
	})

	// check if there are less than we want and spawn them if needed
	RoleCounts.forEach((roleCount, key) => {
		const count = creepMap.get(key) ?? 0
		if (count < roleCount) {
			const config = creepConfigs[key]()
			Game.spawns['Spawn1'].spawnCreep(config.parts, config.name, config.options)
		}
	})

	// ui.run('E25S39')

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
