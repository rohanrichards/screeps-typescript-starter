const MOVE_CONFIG: MoveToOpts = {
    visualizePathStyle: { stroke: '#e39a12', strokeWidth: 0.05, opacity: 0.5, lineStyle: "dotted" }
}


export const repairStructures = (creep: Creep) => {
    const target = creep.memory.target
    let structure: Structure | undefined
    if (!target) {
        const structures = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                if (structure.structureType === STRUCTURE_RAMPART && structure.hits < (structure.hitsMax * 0.1)) {
                    // only healing ramparts to 10% currently
                    return true
                } else if (structure.structureType === STRUCTURE_RAMPART && structure.hits >= (structure.hitsMax * 0.1)) {
                    return false
                } else if (structure.structureType === STRUCTURE_WALL && structure.hits < (structure.hitsMax * 0.0001)) {
                    // only healign walls to 30k health (out of 300m)
                    return true
                } else if (structure.structureType === STRUCTURE_WALL && structure.hits >= (structure.hitsMax * 0.0001)) {
                    return false
                } else {
                    return structure.hits < structure.hitsMax
                }
            }
        })
        // find the structure with the lowest health and repair that first
        structures.sort((a, b) => {
            return (b.hitsMax - b.hits) - (a.hitsMax - a.hits)
        })
        structure = structures[0]
        creep.memory.target = structure?.id
    } else {
        structure = Game.getObjectById(target as Id<Structure>) as Structure
    }


    if (structure) {
        console.log('repairing structure: ', structure.structureType, structure.id)
        const result = creep.repair(structure)

        if (result === ERR_NOT_IN_RANGE) {
            creep.moveTo(structure, MOVE_CONFIG)
        } else if (result !== OK) {
            throw result
        }
    } else {
        // no construction sites
        throw ERR_NOT_FOUND
    }
}
