import { findEnergyResource } from "utils/behaviors"
import { CREEP_JOBS } from "utils/constants"

const MOVE_CONFIG: MoveToOpts = {
    reusePath: 8,
    visualizePathStyle: { stroke: '#ebc334' }
}

export const harvestEnergy = (creep: Creep) => {
    const target = creep.memory.target
    let source: Source

    if (!target) {
        // no target, find a new one
        source = findEnergyResource(creep) as Source
        creep.memory.target = source?.id
    } else {
        // have a target so look up the related source
        [source] = creep.room.find(FIND_SOURCES, { filter: (source) => source.id === target })
    }

    if (source) {
        creep.memory.job = CREEP_JOBS.HARVEST
        const result = creep.harvest(source)

        if (result === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, MOVE_CONFIG)
        } else if (result !== OK) {
            throw result
        }
    } else {
        throw ERR_NOT_FOUND
    }
}
