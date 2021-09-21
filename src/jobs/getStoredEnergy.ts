const MOVE_CONFIG: MoveToOpts = {
    visualizePathStyle: { stroke: '#ede3b2', strokeWidth: 0.03, opacity: 0.3, lineStyle: "solid" }
}

export const getStoredEnergy = (creep: Creep) => {
    const target = creep.memory.target
    let storage: Structure | null
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
        storage = Game.getObjectById(target as Id<Structure>)
    }
    if (storage) {
        const result = creep.withdraw(storage, RESOURCE_ENERGY)

        if (result === ERR_NOT_IN_RANGE) {
            creep.moveTo(storage, MOVE_CONFIG)
        } else if (result !== OK) {
            throw result
        }
    } else {
        throw ERR_NOT_FOUND
    }
}
