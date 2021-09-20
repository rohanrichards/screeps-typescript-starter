import { ROLES } from "roles"
import { CREEP_JOBS, CREEP_STATES } from "./constants"

export const creepConfigs = {
    HARVESTER: () => {
        const role = "HARVESTER"
        const version = 1
        const id = Math.random().toString(36).substr(2, 6)
        const name = `${role}_${version}_${id}`
        const parts = [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]
        return {
            parts,
            name,
            options: {
                memory: {
                    role,
                    role2: ROLES.HARVESTER,
                    icon: '🚜',
                    state: CREEP_STATES.FILL,
                    job: CREEP_JOBS.IDLE,
                },
            }
        }
    },
    BUILDER: () => {
        const role = "BUILDER"
        const version = 1
        const id = Math.random().toString(36).substr(2, 6)
        const name = `${role}_${version}_${id}`
        const parts = [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]
        return {
            parts,
            name,
            options: {
                memory: {
                    role,
                    role2: ROLES.BUILDER,
                    icon: '🏗',
                    state: CREEP_STATES.FILL,
                    job: CREEP_JOBS.THINK,
                }
            }
        }
    },
    HAULER: () => {
        const role = "HAULER"
        const version = 1
        const id = Math.random().toString(36).substr(2, 6)
        const name = `${role}_${version}_${id}`
        const parts = [WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE]
        return {
            parts,
            name,
            options: {
                memory: {
                    role,
                    role2: ROLES.HAULER,
                    icon: '🚚',
                    state: CREEP_STATES.FILL,
                    job: CREEP_JOBS.IDLE,
                },
            }
        }
    },
    UPGRADER: () => {
        const role = "UPGRADER"
        const version = 1
        const id = Math.random().toString(36).substr(2, 6)
        const name = `${role}_${version}_${id}`
        const parts = [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]
        return {
            parts,
            name,
            options: {
                memory: {
                    role,
                    role2: ROLES.UPGRADER,
                    icon: '⚙',
                    state: CREEP_STATES.FILL,
                    job: CREEP_JOBS.THINK
                }
            }
        }
    }
}
