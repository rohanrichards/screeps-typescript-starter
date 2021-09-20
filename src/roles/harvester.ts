import { JOBS, jobs } from "jobs";
import { harvestEnergy } from "jobs/harvestEnergy";
import { moveToParkingFlag } from "jobs/moveToParkingFlag";
import { storeEnergy } from "jobs/storeEnergy";
import { upgradeController } from "jobs/upgradeController";
import { CREEP_STATES } from "utils/constants";

export const harvesterRole = (creep: Creep) => {
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
                harvestEnergy(creep)
            } catch (code) {
                // nowhere to harvest energy
                creep.memory.target = undefined
                // move to parking bay
                creep.memory.state = CREEP_STATES.IDLE
            }
            break
        case CREEP_STATES.EMPTY:
            // look for places to store energy
            try {
                storeEnergy(creep)
            } catch (code) {
                if (code === ERR_FULL) {
                    // storage is full now untarget to find a new one
                    creep.memory.target = undefined
                }
                if (code === ERR_NOT_FOUND || code === ERR_INVALID_TARGET) {
                    // found no storage or some other odd error (wrong storage type somehow)
                    upgradeController(creep)
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
