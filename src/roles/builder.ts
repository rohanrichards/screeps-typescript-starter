import { CREEP_JOBS, CREEP_JOB_ICONS, CREEP_STATES } from "utils/constants"

const MOVE_CONFIG: MoveToOpts = {
    reusePath: 8,
    visualizePathStyle: { stroke: '#ae34eb' }
}

export const builder = {
    getConfig: (): CreepConfig => {
        const role = "BUILDER"
        const version = 3
        const id = Math.random().toString(36).substr(2, 6)
        const name = `${role}_${version}_${id}`
        const parts = [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
        return {
            parts,
            name,
            options: {
                memory: {
                    role,
                    icon: '🏗',
                    state: CREEP_STATES.IDLE,
                    job: CREEP_JOBS.THINK
                }
            }
        }
    },
    run: (creep: Creep) => {
        creep.say(`${creep.memory.icon}: ${CREEP_JOB_ICONS[creep.memory.job]}`)

        if (creep.store.getUsedCapacity() === 0) {
            // set mode to fill up storage
            creep.memory.state = CREEP_STATES.FILL
        } else if (creep.store.getFreeCapacity() === 0) {
            // creep is full so it can stop collecting now
            creep.memory.state = CREEP_STATES.EMPTY
        }

        if (creep.memory.state === CREEP_STATES.FILL) {
            const [source] = creep.room.find(FIND_STRUCTURES, {
                filter: (struct) => {
                    return (struct.structureType === STRUCTURE_STORAGE ||
                        struct.structureType === STRUCTURE_CONTAINER) &&
                        struct.store.getUsedCapacity(RESOURCE_ENERGY) > 0
                }
            })
            if (source) {
                creep.memory.job = CREEP_JOBS.PICKUP
                if (creep.withdraw(source, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, MOVE_CONFIG)
                }
            } else {
                // nothing to pick up currently so go idle
                creep.memory.job = CREEP_JOBS.IDLE
                creep.memory.state = CREEP_STATES.IDLE
            }
        }
        else if (creep.memory.state === CREEP_STATES.EMPTY) {
            // in build mode
            const [target] = creep.room.find(FIND_MY_CONSTRUCTION_SITES)
            if (target) {
                creep.memory.job = CREEP_JOBS.BUILD
                if (creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, MOVE_CONFIG);
                }
            } else {
                // no build targets, check for repairs
                const [target] = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        // ignoring walls for now, too much HP to try to repair
                        return structure.hits < structure.hitsMax && (structure.structureType !== STRUCTURE_WALL)
                    }
                })
                creep.memory.job = CREEP_JOBS.REPAIR
                if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, MOVE_CONFIG);
                }
                if (!target) {
                    // nothing to repair go into an idle state
                    creep.memory.state = CREEP_STATES.IDLE
                    creep.memory.job = CREEP_JOBS.IDLE
                }
            }
        } else if (creep.memory.state === CREEP_STATES.IDLE) {
            // move to the idle flag
            const [flag] = creep.room.find(FIND_FLAGS, {
                filter: (flag) => flag.name === 'Parking'
            })
            creep.moveTo(flag)
            creep.memory.job = CREEP_JOBS.IDLE
            creep.memory.state = CREEP_STATES.EMPTY
        }
    }
}
