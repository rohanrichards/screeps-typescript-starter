import { findEnergyResource } from "utils/behaviors"
import { CREEP_JOBS } from "utils/constants"

const MOVE_CONFIG: MoveToOpts = {
    visualizePathStyle: { stroke: '#1ce633', strokeWidth: 0.05, opacity: 0.5, lineStyle: "dotted" }
}

export const harvestEnergy = (creep: Creep) => {
    const target = creep.memory.target
    let source: Source | null

    if (!target) {
        // no target, find a new one
        source = findEnergyResource(creep) as Source
        creep.memory.target = source?.id
    } else {
        // have a target so look up the related source
        source = Game.getObjectById(target as Id<Source>)
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
