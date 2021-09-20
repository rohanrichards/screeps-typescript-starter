const MOVE_CONFIG: MoveToOpts = {
    reusePath: 8,
    visualizePathStyle: { stroke: '#ebc334' }
}

export const getStoredEnergy = (creep: Creep) => {
    const target = creep.memory.target
    let storage: StructureStorage | StructureContainer
    if (!target) {
        // no storage target yet so find storage
        [storage] = creep.room.find(FIND_STRUCTURES, {
            filter: (struct) => {
                return (struct.structureType === STRUCTURE_STORAGE ||
                    struct.structureType === STRUCTURE_CONTAINER) &&
                    struct.store.getUsedCapacity(RESOURCE_ENERGY) > 0
            }
        })
        if (storage) {
            creep.memory.target = storage?.id
        }
    } else {
        [storage] = creep.room.find(FIND_STRUCTURES, { filter: (source) => source.id === target })
    }
    if (storage) {
        const result = creep.withdraw(storage, RESOURCE_ENERGY)

        if (result === ERR_NOT_IN_RANGE) {
            creep.moveTo(storage, MOVE_CONFIG)
        }
        if (result === ERR_NOT_ENOUGH_RESOURCES) {
            // storage is empty look for more
            creep.memory.target = undefined
        }
        if (result === ERR_FULL) {
            // creep is now full
            creep.memory.target = undefined
        }
        if (result === ERR_NOT_FOUND || result === ERR_INVALID_TARGET) {
            // storage is gone or wrong
            creep.memory.target = undefined
        }
    }
}
