const MOVE_CONFIG: MoveToOpts = {
    reusePath: 8,
    visualizePathStyle: { stroke: '#ebc334' }
}


export const repairStructures = (creep: Creep) => {
    const target = creep.memory.target
    let structure: Structure | undefined
    [structure] = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            // only healing ramparts to 20% currently
            if (structure.structureType === STRUCTURE_RAMPART && structure.hits < (structure.hitsMax * 0.2)) {
                return true
            }
            if (structure.structureType === STRUCTURE_WALL) {
                // ignoring walls for now
                return false
            }
            return structure.hits < structure.hitsMax
        }
    })
    creep.memory.target = structure?.id

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
