const MOVE_CONFIG: MoveToOpts = {
    reusePath: 8,
    visualizePathStyle: { stroke: '#ebc334' }
}

export const storeEnergy = (creep: Creep) => {
    const target = creep.memory.target
    let storage: StructureStorage | StructureContainer
    if (!target) {
        // no target yet so find one
        [storage] = creep.room.find(FIND_STRUCTURES, {
            filter: (struct) => {
                return (struct.structureType === STRUCTURE_STORAGE ||
                    struct.structureType === STRUCTURE_CONTAINER) &&
                    struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            }
        })
        if (storage) {
            // console.log('path from creep to storage: ', creep.pos.findPathTo(storage.pos))
            creep.memory.target = storage?.id
        }
    } else {
        [storage] = creep.room.find(FIND_STRUCTURES, { filter: (source) => source.id === target })
    }

    if (storage) {
        let result = creep.transfer(storage, RESOURCE_ENERGY)

        if (result === ERR_NOT_IN_RANGE) {
            result = creep.moveTo(storage, MOVE_CONFIG)
            if (result !== OK) {
                throw result
            }
        } else if (result !== OK) {
            throw result
        }
    } else {
        throw ERR_NOT_FOUND
    }
}
