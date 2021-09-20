const MOVE_CONFIG: MoveToOpts = {
    reusePath: 8,
    visualizePathStyle: { stroke: '#ebc334' }
}

export const storeEnergyInSpawn = (creep: Creep) => {
    const target = creep.memory.target
    let storage: StructureSpawn | StructureExtension
    if (!target) {
        // no target yet so find one
        [storage] = creep.room.find(FIND_STRUCTURES, {
            filter: (struct) => {
                return (struct.structureType === STRUCTURE_EXTENSION ||
                    struct.structureType === STRUCTURE_SPAWN) &&
                    struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            }
        })
        if (storage) {
            creep.memory.target = storage?.id
        }
    } else {
        [storage] = creep.room.find(FIND_STRUCTURES, { filter: (source) => source.id === target })
    }

    if (storage) {
        const result = creep.transfer(storage, RESOURCE_ENERGY)

        if (result === ERR_NOT_IN_RANGE) {
            creep.moveTo(storage, MOVE_CONFIG)
        } else if (result !== OK) {
            throw result
        }
    } else {
        throw ERR_NOT_FOUND
    }
}
