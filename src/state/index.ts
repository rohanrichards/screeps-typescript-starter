import { harvestEnergy } from "jobs/harvestEnergy";
import { moveToParkingFlag } from "jobs/moveToParkingFlag";
import { storeEnergy } from "jobs/storeEnergy";
import { storeEnergyInSpawn } from "jobs/storeEnergyInSpawn";
import { findEnergyResource, isEnergyResourceAvailable, isEnergyStorageAvailable } from "utils/behaviors";
import { creepConfigs } from "utils/creepConfigs";
import { MachineConfig, MachineOptions } from "xstate";

type HaulerEvent = { type: 'DONE' } | { type: 'IDLE' } | { type: 'NOT_FOUND' } | { type: 'EMPTY' } | { type: 'HARVEST' }
interface HaulerContext {
    creep: Creep
}

export const haulerMachineConfig: MachineConfig<HaulerContext, any, HaulerEvent> = {
    id: 'harvester',
    initial: 'thinking',
    on: {
        DONE: 'done',
        IDLE: 'idling',
        EMPTY: 'emptying',
        HARVEST: 'harvesting'
    },
    states: {
        harvesting: {
            always: [
                { target: 'emptying', cond: 'isFull' }
            ],
            entry: (context) => { context.creep.memory.xstate = 'harvesting' },
            invoke: {
                id: 'harvestFunction',
                src: (context, event) => (callback, onReceive) => {
                    const result = harvestEnergy(context.creep)
                    console.log('harvestEnergy result: ', result)
                    if (result === OK) {
                        callback('DONE')
                    } else {
                        context.creep.memory.target = undefined
                        callback('IDLE')
                    }
                    return () => { }
                }
            }
        },
        emptying: {
            type: 'compound',
            initial: 'inSpawn',
            always: [
                { target: 'harvesting', cond: 'isEmpty' },
            ],
            entry: (context) => { context.creep.memory.xstate = 'emptying' },
            on: {
                NOT_FOUND: [
                    { target: 'harvesting', cond: 'isNotEmptyOrFull' },
                    { target: 'idling', cond: 'isFull' },
                ]
            },
            states: {
                inSpawn: {
                    entry: (context) => { console.log('emptying.inSpawn') },
                    on: {
                        NOT_FOUND: 'inStorage'
                    },
                    invoke: {
                        id: 'storeInSpawnHandler',
                        src: (context, event) => (callback, onReceive) => {
                            const result = storeEnergyInSpawn(context.creep)
                            console.log('storeEnergyInSpawn result: ', result)
                            if (result === OK) {
                                // energy was stored, creep is empty, find new task
                                context.creep.memory.target = undefined
                                callback('DONE')
                            } else if (result === ERR_NOT_IN_RANGE) {
                                // creep had to move, all is well
                                callback('DONE')
                            } else if (result === ERR_NOT_FOUND) {
                                // nowhere to put anything, parent will handle
                                context.creep.memory.target = undefined
                                callback('NOT_FOUND')
                            } else {
                                context.creep.memory.target = undefined
                                console.log(result)
                            }
                            return () => { }
                        }
                    }
                },
                inStorage: {
                    entry: (context) => { console.log('emptying.inStorage') },
                    on: {
                        NOT_FOUND: '#harvester.idling'
                    },
                    invoke: {
                        id: 'storeInStorageHandler',
                        src: (context, event) => (callback, onReceive) => {
                            const result = storeEnergy(context.creep)
                            console.log('storeEnergy result: ', result)
                            if (result === OK) {
                                // energy was stored, creep is empty, find new task
                                context.creep.memory.target = undefined
                                callback('HARVEST')
                            } else if (result === ERR_NOT_IN_RANGE) {
                                // creep had to move, all is well
                                callback('DONE')
                            } else if (result === ERR_NOT_FOUND) {
                                // nowhere to put anything, parent will handle
                                context.creep.memory.target = undefined
                                callback('NOT_FOUND')
                            } else {
                                // some other error, simply try again
                                context.creep.memory.target = undefined
                                // callback('IDLE')
                            }
                            return () => { }
                        }
                    }
                }
            },
        },
        idling: {
            entry: (context) => { context.creep.memory.xstate = 'idling'; console.log('idling') },
            invoke: {
                id: 'parkFunction',
                src: (context, event) => (callback, onReceive) => {
                    if (context.creep.store.getUsedCapacity() > 0) {
                        // creep is carrying something
                        if (isEnergyStorageAvailable(context.creep)) {
                            // there is now somewhere to store it so try empty again
                            context.creep.memory.target = undefined
                            return callback('EMPTY')
                        }
                    } else {
                        // creep is empty so check if harvest source is available now
                        if (isEnergyResourceAvailable(context.creep)) {
                            // attempt to harvest again
                            context.creep.memory.target = undefined
                            return callback('HARVEST')
                        }
                    }

                    const result = moveToParkingFlag(context.creep)
                    callback('DONE')
                    return () => { }
                }
            }
        },
        thinking: {
            // intermediate initial state for determining what state the machine should be in
            always: [
                { target: 'done', cond: (context) => { return context.creep.spawning } },
                { target: 'harvesting', cond: (context) => { return context.creep?.memory.xstate === 'harvesting' } },
                { target: 'emptying', cond: (context) => { return context.creep?.memory.xstate === 'emptying' } },
                { target: 'idling', cond: (context) => { return context.creep?.memory.xstate === 'idling' } },
            ]
        },
        done: {
            type: 'final',
        }
    }
}

export const machineOptions: MachineOptions<HaulerContext, HaulerEvent> = {
    guards: {
        isFull: (context: HaulerContext, event: HaulerEvent) => {
            return context.creep.store.getFreeCapacity() === 0
        },
        isEmpty: (context: HaulerContext, event: HaulerEvent) => {
            return context.creep.store.getUsedCapacity() === 0
        },
        isNotEmpty: (context: HaulerContext, event: HaulerEvent) => {
            return context.creep.store.getUsedCapacity() > 0
        },
        isNotEmptyOrFull: (context: HaulerContext, event: HaulerEvent) => {
            return context.creep.store.getFreeCapacity() > 0
        },
        isSomewhereToStore: (context, event) => {
            return isEnergyStorageAvailable(context.creep)
        },
        isNotSomewhereToStore: (context, event) => {
            return isEnergyStorageAvailable(context.creep)
        },
        isSomewhereToHarvest: (context, event) => {
            return findEnergyResource(context.creep) ? true : false
        }

    },
    actions: {},
    activities: {},
    services: {},
    delays: {}
}
