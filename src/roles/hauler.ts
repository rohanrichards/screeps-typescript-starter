import { getStoredEnergy } from "jobs/getStoredEnergy"
import { moveToParkingFlag } from "jobs/moveToParkingFlag"
import { scavengeEnergy } from "jobs/scavengeEnergy"
import { storeEnergy } from "jobs/storeEnergy"
import { storeEnergyInSpawn } from "jobs/storeEnergyInSpawn"
import { ROLES } from "roles"
import { checkIfSpawnNeedsEnergy } from "utils/behaviors"
import { CREEP_JOBS, CREEP_JOB_ICONS, CREEP_STATES } from "utils/constants"

const MOVE_CONFIG: MoveToOpts = {
    reusePath: 8,
    visualizePathStyle: { stroke: '#c3eb34' }
}

export const haulerRole = (creep: Creep) => {
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
                scavengeEnergy(creep)
            } catch (code) {
                creep.memory.target = undefined
                if (code === ERR_NOT_FOUND) {
                    // found nothing on the ground/ruins/tombs
                    if (checkIfSpawnNeedsEnergy()) {
                        // check if the spawner or extensions needs any energy and if so fill up from storage
                        try {
                            getStoredEnergy(creep)
                        } catch (code) {
                            // nothing to fill up on, empty what we have
                            creep.memory.target = undefined
                            creep.memory.state = CREEP_STATES.EMPTY
                        }
                    }
                } else {
                    // some other error while scavenging
                    creep.memory.target = undefined
                    creep.memory.state = CREEP_STATES.EMPTY
                }
            }
            break
        case CREEP_STATES.EMPTY:
            // put the energy somewhere
            try {
                // try to store it in a spawner/extension first
                storeEnergyInSpawn(creep)
            } catch (code) {
                if (code === ERR_NOT_FOUND) {
                    // spawners dont need any so just store it in containers/storage
                    try {
                        storeEnergy(creep)
                    } catch (e) {
                        // nowhere to store what we're holding, just idle
                        creep.memory.target = undefined
                        creep.memory.state = CREEP_STATES.IDLE
                    }
                } else {
                    // something unexpected went wrong
                    creep.memory.target = undefined
                    creep.memory.state = CREEP_STATES.IDLE
                }
            }
            break
        case CREEP_STATES.IDLE:
            moveToParkingFlag(creep)
            // always reset after each idle tick incase something has changed and they can now fill or empty
            creep.memory.target = undefined
            creep.memory.state = CREEP_STATES.EMPTY
            break
    }
}
