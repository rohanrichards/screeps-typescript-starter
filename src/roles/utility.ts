/*
Utility creep will harvest until full and then determine the best way to use resources
It will load balance on the energy source nodes so that there's never more than MAX_CREEPS_ON_SOURCE
It will prioritize in the following order:
    - build
    - store (spawn, towers etc)
    - upgrade controller
*/

import { findEnergyResource, findScavengeSource } from "utils/behaviors"
import { CREEP_JOBS, CREEP_JOB_ICONS, CREEP_STATES } from "utils/constants"

const MOVE_CONFIG: MoveToOpts = {
    reusePath: 3,
    visualizePathStyle: { stroke: '#ffffff' }
}

export const utility = {
    getConfig: (): CreepConfig => {
        const role = "UTILITY"
        const version = 1
        const id = Math.random().toString(36).substr(2, 6)
        const name = `${role}_${version}_${id}`
        const parts = [WORK, CARRY, MOVE, MOVE]
        return {
            parts,
            name,
            options: {
                memory: {
                    role,
                    icon: '🧰',
                    state: CREEP_STATES.IDLE,
                    job: CREEP_JOBS.IDLE
                }
            }
        }
    },
    run: (creep: Creep) => {
        creep.say(`${creep.memory.icon}➡${CREEP_JOB_ICONS[creep.memory.job]}`)
        // first we determine what mode the creep is in
        if (creep.store.getUsedCapacity() === 0) {
            // set mode to harvest
            creep.memory.state = CREEP_STATES.FILL
        } else if (creep.store.getFreeCapacity() === 0) {
            // creep is full so it can stop harvesting now
            creep.memory.state = CREEP_STATES.EMPTY
            creep.memory.job = CREEP_JOBS.THINK
            // reset its target
            creep.memory.target = undefined
        }

        // if the creep has no target currently and is idling or empty find it a new source
        if (!creep.memory.target && (creep.memory.state === CREEP_STATES.FILL || creep.memory.state === CREEP_STATES.IDLE)) {
            const source = findEnergyResource(creep)
            const [dropped] = creep.room.find(FIND_DROPPED_RESOURCES)
            const tomb = findScavengeSource(creep)

            if (dropped) {
                // found something on the ground in the room
                creep.memory.target = dropped.id
                creep.memory.state = CREEP_STATES.FILL
                creep.memory.job = CREEP_JOBS.PICKUP
            } else if (tomb) {
                // found a tombstone with something in it
                creep.memory.target = tomb.id
                creep.memory.state = CREEP_STATES.FILL
                creep.memory.job = CREEP_JOBS.SCAVENGE
            } else if (source) {
                // we got a free/available source so set the creeps target
                creep.memory.target = source.id
                creep.memory.state = CREEP_STATES.FILL
                creep.memory.job = CREEP_JOBS.HARVEST
            } else {
                // nowhere to get any resources so just idle
                creep.memory.state = CREEP_STATES.IDLE
                creep.memory.job = CREEP_JOBS.IDLE
            }
        }
        // the creep has a target now and needs to do something with it depending on the job/target type
        if (creep.memory.state === CREEP_STATES.FILL) {
            if (creep.memory.job === CREEP_JOBS.HARVEST) {
                // find a source that matches our target id
                const [source] = creep.room.find(FIND_SOURCES, { filter: (source) => source.id === creep.memory.target })
                // harvest it
                if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, MOVE_CONFIG)
                }
                if (creep.harvest(source) === ERR_NOT_ENOUGH_RESOURCES) {
                    creep.memory.target = undefined
                    creep.memory.job = CREEP_JOBS.THINK
                }
                if (creep.harvest(source) === ERR_INVALID_TARGET) {
                    creep.memory.target = undefined
                    creep.memory.job = CREEP_JOBS.THINK
                }
            } else if (creep.memory.job === CREEP_JOBS.PICKUP) {
                const [source] = creep.room.find(FIND_DROPPED_RESOURCES, { filter: (source) => source.id === creep.memory.target })
                if (creep.pickup(source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, MOVE_CONFIG)
                }
                if (!source) {
                    creep.memory.target = undefined
                    creep.memory.job = CREEP_JOBS.THINK
                }
            } else if (creep.memory.job === CREEP_JOBS.SCAVENGE) {
                let [source]: Ruin[] | Tombstone[] = creep.room.find(FIND_TOMBSTONES, { filter: (source) => source.id === creep.memory.target })
                if (!source) {
                    [source] = creep.room.find(FIND_RUINS, { filter: (source) => source.id === creep.memory.target })
                }
                if (creep.withdraw(source, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, MOVE_CONFIG)
                }
                if (creep.withdraw(source, RESOURCE_ENERGY) === ERR_NOT_ENOUGH_RESOURCES) {
                    creep.memory.target = undefined
                    creep.memory.job = CREEP_JOBS.THINK
                }
                if (creep.withdraw(source, RESOURCE_ENERGY) === ERR_INVALID_TARGET) {
                    creep.memory.target = undefined
                    creep.memory.job = CREEP_JOBS.THINK
                }
                if (!source) {
                    creep.memory.target = undefined
                    creep.memory.job = CREEP_JOBS.THINK
                }
            } else {
                // something weird has happened, they're on fill but have no job type that matches
                creep.memory.target = undefined
                creep.memory.job = CREEP_JOBS.THINK
            }
        } else if (creep.memory.state === CREEP_STATES.EMPTY) {
            const [constructionSite] = creep.room.find(FIND_MY_CONSTRUCTION_SITES)
            const [storageSite] = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (struct) => {
                    return (struct.structureType === STRUCTURE_EXTENSION ||
                        struct.structureType === STRUCTURE_SPAWN ||
                        struct.structureType === STRUCTURE_TOWER) &&
                        struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                }
            })
            const [rampart] = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (struct) => {
                    return (struct.structureType === STRUCTURE_RAMPART) &&
                        struct.hits < (struct.hitsMax * 0.1)
                }
            })
            if (rampart) {
                // check if there's a rampart to top up
                creep.memory.target = rampart.id
                creep.memory.job = CREEP_JOBS.REPAIR
                if (creep.repair(rampart) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(rampart, MOVE_CONFIG);
                }
            } else if (storageSite) {
                // do we have empty storage to put it in?
                creep.memory.target = storageSite.id
                creep.memory.job = CREEP_JOBS.STORE
                if (creep.transfer(storageSite, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storageSite, MOVE_CONFIG);
                }
            } else if (constructionSite) {
                // is there anything that needs building?
                creep.memory.target = constructionSite.id
                creep.memory.job = CREEP_JOBS.BUILD
                if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(constructionSite, MOVE_CONFIG);
                }
            } else {
                // else try to fill the controller
                creep.memory.job = CREEP_JOBS.UPGRADE
                if (creep.upgradeController(creep.room.controller!) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller!, MOVE_CONFIG);
                }
            }
        } else if (creep.memory.state === CREEP_STATES.IDLE) {
            // creep is idling so move to the parking flag
            const [flag] = creep.room.find(FIND_FLAGS, {
                filter: (flag) => flag.name === 'Parking'
            })
            creep.moveTo(flag)
            creep.memory.job = CREEP_JOBS.IDLE
            creep.memory.target = undefined
        }
    }
}
