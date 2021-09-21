import { ROLES } from "roles"
import { CREEP_JOBS, CREEP_STATES } from "./constants"

export const creepConfigs = {
    [ROLES.HARVESTER]: () => {
        const role = "HARVESTER"
        const version = 2
        const id = Math.random().toString(36).substr(2, 6)
        const name = `${role}_${version}_${id}`
        const parts = [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE] //800
        return {
            parts,
            name,
            options: {
                memory: {
                    role: ROLES.HARVESTER,
                    icon: '🚜',
                    state: CREEP_STATES.FILL,
                    job: CREEP_JOBS.IDLE,
                },
            }
        }
    },
    [ROLES.BUILDER]: () => {
        const role = "BUILDER"
        const version = 2
        const id = Math.random().toString(36).substr(2, 6)
        const name = `${role}_${version}_${id}`
        const parts = [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] //800
        return {
            parts,
            name,
            options: {
                memory: {
                    role: ROLES.BUILDER,
                    icon: '👷‍♂️',
                    state: CREEP_STATES.FILL,
                    job: CREEP_JOBS.THINK,
                }
            }
        }
    },
    [ROLES.HAULER]: () => {
        const role = "HAULER"
        const version = 2
        const id = Math.random().toString(36).substr(2, 6)
        const name = `${role}_${version}_${id}`
        const parts = [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE] //800
        return {
            parts,
            name,
            options: {
                memory: {
                    role: ROLES.HAULER,
                    icon: '🚚',
                    state: CREEP_STATES.FILL,
                    job: CREEP_JOBS.IDLE,
                },
            }
        }
    },
    [ROLES.UPGRADER]: () => {
        const role = "UPGRADER"
        const version = 2
        const id = Math.random().toString(36).substr(2, 6)
        const name = `${role}_${version}_${id}`
        const parts = [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE] //800
        return {
            parts,
            name,
            options: {
                memory: {
                    role: ROLES.UPGRADER,
                    icon: '⏫',
                    state: CREEP_STATES.FILL,
                    job: CREEP_JOBS.THINK
                }
            }
        }
    },
    [ROLES.UTILITY]: () => {
        const role = "UTILITY"
        const version = 1
        const id = Math.random().toString(36).substr(2, 6)
        const name = `${role}_${version}_${id}`
        const parts = [WORK, CARRY, MOVE, MOVE] //250
        return {
            parts,
            name,
            options: {
                memory: {
                    role: ROLES.UTILITY,
                    icon: '🧰',
                    state: CREEP_STATES.FILL,
                    job: CREEP_JOBS.THINK
                }
            }
        }
    }
}
