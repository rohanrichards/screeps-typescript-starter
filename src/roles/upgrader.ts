import { getStoredEnergy } from "jobs/getStoredEnergy"
import { moveToParkingFlag } from "jobs/moveToParkingFlag"
import { upgradeController } from "jobs/upgradeController"
import { CREEP_STATES } from "utils/constants"

export const upgraderRole = (creep: Creep) => {
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
            // attempt to collect energy
            try {
                getStoredEnergy(creep)
            } catch (code) {
                // nowhere to collect energy
                console.log('upgrader fill error: ', code)
                creep.memory.target = undefined
                creep.memory.state = CREEP_STATES.IDLE
            }
            break
        case CREEP_STATES.EMPTY:
            // look for things to build
            try {
                upgradeController(creep)
            } catch (code) {
                if (code === ERR_NOT_ENOUGH_RESOURCES) {
                    creep.memory.state = CREEP_STATES.FILL
                    creep.memory.target = undefined
                } else {
                    console.log('error while upgrading controller: ', code)
                    creep.memory.state = CREEP_STATES.IDLE
                    creep.memory.target = undefined
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
