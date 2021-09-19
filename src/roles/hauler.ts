import { CREEP_JOBS, CREEP_JOB_ICONS, CREEP_STATES } from "utils/constants"

const MOVE_CONFIG: MoveToOpts = {
    reusePath: 8,
    visualizePathStyle: { stroke: '#c3eb34' }
}

export const hauler = {
    getConfig: (): CreepConfig => {
        const role = "HAULER"
        const version = 3
        const id = Math.random().toString(36).substr(2, 6)
        const name = `${role}_${version}_${id}`
        const parts = [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
        return {
            parts,
            name,
            options: {
                memory: {
                    role,
                    icon: '🚚',
                    state: CREEP_STATES.IDLE,
                    job: CREEP_JOBS.IDLE
                },
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
            creep.memory.target = undefined
        }

        if (creep.memory.state === CREEP_STATES.FILL) {
            // look for any dropped resources
            let [source] = creep.room.find(FIND_DROPPED_RESOURCES)
            if (source) {
                creep.memory.job = CREEP_JOBS.PICKUP
                if (creep.pickup(source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, MOVE_CONFIG)
                }
            } else {
                // check if extension or spawn have room
                const [freeRoom] = _.filter(Game.structures, (structure: AnyStoreStructure) => {
                    return (structure.structureType === STRUCTURE_EXTENSION ||
                        structure.structureType === STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                })
                if (freeRoom) {
                    // now check if we have any spare energy in storage
                    const [storage] = creep.room.find(FIND_STRUCTURES, {
                        filter: (struct) => {
                            return (struct.structureType === STRUCTURE_STORAGE ||
                                struct.structureType === STRUCTURE_CONTAINER) &&
                                struct.store.getUsedCapacity(RESOURCE_ENERGY) > 0
                        }
                    })
                    if (storage) {
                        creep.memory.job = CREEP_JOBS.TRANSFER
                        if (creep.pickup(source) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(source, MOVE_CONFIG)
                        }
                    } else {
                        // nothing more to pick up
                        creep.memory.state = CREEP_STATES.EMPTY
                    }
                } else {
                    // nothing more to pick up
                    creep.memory.state = CREEP_STATES.EMPTY
                }
            }
        } else if (creep.memory.state === CREEP_STATES.EMPTY) {
            // prioritize spawner and extensions first
            let [storage] = _.filter(Game.structures, (structure: AnyStoreStructure) => {
                return (structure.structureType === STRUCTURE_EXTENSION ||
                    structure.structureType === STRUCTURE_SPAWN ||
                    structure.structureType === STRUCTURE_TOWER) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            })

            // if they're full stick it in storage
            if (!storage) {
                [storage] = creep.room.find(FIND_STRUCTURES, {
                    filter: (struct) => {
                        return (struct.structureType === STRUCTURE_STORAGE ||
                            struct.structureType === STRUCTURE_CONTAINER) &&
                            struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                    }
                })
            }
            if (storage) {
                creep.memory.job = CREEP_JOBS.STORE
                if (creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage, MOVE_CONFIG);
                }
            } else {
                // nowhere to put stuff
                creep.memory.job = CREEP_JOBS.UPGRADE
                if (creep.upgradeController(creep.room.controller!) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller!, MOVE_CONFIG);
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
