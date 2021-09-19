import { CREEP_JOBS, CREEP_JOB_ICONS, CREEP_STATES } from "utils/constants"

const MAX_CREEPS_ON_SOURCE = 3
const MOVE_CONFIG: MoveToOpts = {
    reusePath: 8,
    visualizePathStyle: { stroke: '#ebc334' }
}

export const harvester = {
    // returns a new creep config
    getConfig: (): CreepConfig => {
        const role = "HARVESTER"
        const version = 2
        const id = Math.random().toString(36).substr(2, 6)
        const name = `${role}_${version}_${id}`
        const parts = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE]
        return {
            parts,
            name,
            options: {
                memory: {
                    role,
                    icon: '🚜',
                    state: CREEP_STATES.FILL,
                    job: CREEP_JOBS.THINK
                }
            }
        }
    },
    run: (creep: Creep) => {
        creep.say(`${creep.memory.icon}: ${CREEP_JOB_ICONS[creep.memory.job]}`)
        // finds a source for them to harvest if they dont have one yet
        if (!creep.memory.target) {
            // we need to know how many creeps are targeting each resource
            const creepTargets: Map<string, number> = new Map()
            Object.keys(Game.creeps).forEach(name => {
                const creepTarget = Game.creeps[name].memory.target
                if (creepTarget) {
                    let count = creepTargets.get(creepTarget) ?? 0
                    creepTargets.set(creepTarget, ++count)
                }
            })
            // now we can find a resource that doesn't have too many targets and is available
            const [source] = creep.room.find(FIND_SOURCES_ACTIVE, {
                filter: (source) => {
                    // only return sources that dont have too many creeps on them
                    return (creepTargets.get(source.id) ?? 0) < MAX_CREEPS_ON_SOURCE
                }
            })
            // we got some sources so set the creeps target
            if (source) {
                creep.memory.target = source.id
            } else {
                // no sources to mine so idle
                creep.memory.state = CREEP_STATES.IDLE
                creep.memory.job = CREEP_JOBS.IDLE
                creep.memory.target = undefined
            }
        }

        // find a source that matches our target id
        const [source] = creep.room.find(FIND_SOURCES, { filter: (source) => source.id === creep.memory.target })
        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, MOVE_CONFIG)
        }
        if (creep.harvest(source) === ERR_NOT_ENOUGH_RESOURCES) {
            // source is empty, time to move
            creep.memory.target = undefined
            creep.memory.job = CREEP_JOBS.THINK
        }
    }
}
