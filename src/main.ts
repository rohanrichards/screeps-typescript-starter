import { CREEP_STATES } from "utils/constants";
import { ErrorMapper } from "utils/ErrorMapper";
import { ui } from "utils/ui";
import { ROLES, roles } from "roles";
import { creepConfigs } from "utils/creepConfigs";
import { interpret, createMachine } from 'xstate';
import { haulerMachineConfig, machineOptions } from "state";

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
		xstate: string
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
	[ROLES.UPGRADER, 0],
	[ROLES.BUILDER, 0],
	[ROLES.HAULER, 0],
	[ROLES.HARVESTER, 0],
	[ROLES.UTILITY, 1],
])

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
	// const creepMap: Map<ROLES, number> = new Map()

	// // loop through all creeps
	// _.forEach(Game.creeps, (creep) => {
	// 	// figure out how many of each creep we have
	// 	let count = creepMap.get(creep.memory.role) ?? 0
	// 	creepMap.set(creep.memory.role, ++count)

	// 	// call their control methods
	// 	try {
	// 		roles[creep.memory.role as ROLES](creep)
	// 		creep.say(`${creep.memory.icon}`)
	// 	} catch (e) {
	// 		console.log('uncaught error in main.ts: ', e)
	// 		// shh
	// 	}
	// })

	// // check if there are less than we want and spawn them if needed
	// RoleCounts.forEach((roleCount, key) => {
	// 	const count = creepMap.get(key) ?? 0
	// 	if (count < roleCount) {
	// 		const config = creepConfigs[key]()
	// 		Game.spawns['Spawn1'].spawnCreep(config.parts, config.name, config.options)
	// 	}
	// })

	// // ui.run('E25S39')
	console.log('sim running: - start loop')
	// get all existing creeps
	_.forEach(Game.creeps, (creep) => {
		// make a state machine for each one setting the initial state to its current state
		const machine = interpret(createMachine(haulerMachineConfig, machineOptions).withContext({ creep }))
		machine.onTransition((state) => {
			console.log('machine transition: ', state.value)
		}).start()
	})

	console.log(`CPU Used, CPU in bucket: ${Game.cpu.getUsed()} out of ${Game.cpu.bucket}`)

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
