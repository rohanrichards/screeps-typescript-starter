/*
Utility creep will harvest until full and then determine the best way to use resources
It will load balance on the energy source nodes so that there's never more than MAX_CREEPS_ON_SOURCE
It will prioritize in the following order:
    - build
    - store (spawn, towers etc)
    - upgrade controller
*/

import { buildConstruction } from "jobs/buildConstruction";
import { harvestEnergy } from "jobs/harvestEnergy";
import { moveToParkingFlag } from "jobs/moveToParkingFlag";
import { repairStructures } from "jobs/repairStructures";
import { scavengeEnergy } from "jobs/scavengeEnergy";
import { storeEnergy } from "jobs/storeEnergy";
import { storeEnergyInSpawn } from "jobs/storeEnergyInSpawn";
import { upgradeController } from "jobs/upgradeController";
import { CREEP_STATES } from "utils/constants"

const MOVE_CONFIG: MoveToOpts = {
    reusePath: 3,
    visualizePathStyle: { stroke: '#ffffff' }
}

export const utilityRole = (creep: Creep) => {
    const state = creep.memory.state

    if (creep.store.getUsedCapacity() === 0) {
        // creep is empty
        creep.memory.state = CREEP_STATES.FILL
    } else if (creep.store.getFreeCapacity() === 0) {
        // creep is full
        creep.memory.state = CREEP_STATES.EMPTY
        creep.memory.target = undefined
    }

    switch (state) {
        case CREEP_STATES.FILL:
            // attempt to harvest
            try {
                scavengeEnergy(creep)
            } catch (code) {
                console.log('utility failed to scavenge: ', code)
                try {
                    // nowhere to pickup energy so go mine it
                    harvestEnergy(creep)
                } catch (code) {
                    // no energy available at all so idle for now
                    creep.memory.target = undefined
                    // move to parking bay
                    creep.memory.state = CREEP_STATES.IDLE
                }
                if (code === ERR_FULL) {
                    creep.memory.state = CREEP_STATES.EMPTY
                    creep.memory.target = undefined
                }
            }
            break
        case CREEP_STATES.EMPTY:
            // look for places to store energy
            try {
                storeEnergyInSpawn(creep)
            } catch (code) {
                creep.memory.target = undefined
                if (code === ERR_NOT_FOUND) {
                    // spawn doesn't need energy try building/repairing
                    try {
                        buildConstruction(creep)
                    } catch (code) {
                        try {
                            repairStructures(creep)
                        } catch (code) {
                            throw code
                        }
                    }
                } else if (code === ERR_NOT_ENOUGH_RESOURCES) {
                    creep.memory.state = CREEP_STATES.FILL
                    creep.memory.target = undefined
                } else {
                    try {
                        storeEnergy(creep)
                    } catch (code) {
                        upgradeController(creep)
                    }
                }

            }
            break
        case CREEP_STATES.IDLE:
            moveToParkingFlag(creep)
            // always reset after each idle tick incase something has changed and they can now fill or empty
            creep.memory.target = undefined
            creep.memory.state = CREEP_STATES.FILL
            break
    }
}
