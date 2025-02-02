import { buildConstruction } from "jobs/buildConstruction"
import { getStoredEnergy } from "jobs/getStoredEnergy"
import { moveToParkingFlag } from "jobs/moveToParkingFlag"
import { repairStructures } from "jobs/repairStructures"
import { ROLES } from "roles"
import { CREEP_JOBS, CREEP_JOB_ICONS, CREEP_STATES } from "utils/constants"

const MOVE_CONFIG: MoveToOpts = {
    reusePath: 8,
    visualizePathStyle: { stroke: '#ae34eb' }
}

export const builderRole = (creep: Creep) => {
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
                creep.memory.target = undefined
                if (code === ERR_NOT_FOUND) {
                    // found no resources
                    creep.memory.state = CREEP_STATES.IDLE
                } else {
                    // unexpected error
                    console.log('builder fill unexpected error: ', code)
                }
            }
            break
        case CREEP_STATES.EMPTY:
            // look for things to build
            try {
                buildConstruction(creep)
            } catch (code) {
                if (code === ERR_NOT_FOUND) {
                    creep.memory.target = undefined
                    // found nothing to build check for repairable targets
                    try {
                        console.log('nothing to build, attempting to repair')
                        repairStructures(creep)
                    } catch (code) {
                        console.log('failed to repair: ', code)
                        creep.memory.target = undefined
                        throw code
                    }
                } else if (code === ERR_NOT_ENOUGH_RESOURCES) {
                    creep.memory.state = CREEP_STATES.FILL
                } else {
                    // something unexpected went wrong while building
                    console.log('unexpected error while building: ', code)
                    creep.memory.state = CREEP_STATES.IDLE
                }
            }
            break
        case CREEP_STATES.IDLE:
            moveToParkingFlag(creep)
            // always reset after each idle tick incase something has changed and they can now fill or empty
            creep.memory.target = undefined
            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                creep.memory.state = CREEP_STATES.EMPTY
            } else {
                creep.memory.state = CREEP_STATES.FILL
            }
            break
    }
}
