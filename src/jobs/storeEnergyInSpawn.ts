const MOVE_CONFIG: MoveToOpts = {
    visualizePathStyle: { stroke: '#edd351', strokeWidth: 0.1, opacity: 0.5, lineStyle: "dashed" }
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
        storage = Game.getObjectById(target as Id<StructureSpawn>) as StructureSpawn
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
