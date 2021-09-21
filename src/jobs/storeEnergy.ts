const MOVE_CONFIG: MoveToOpts = {
    visualizePathStyle: { stroke: '#edd351', strokeWidth: 0.1, opacity: 0.5, lineStyle: "dashed" }
}

export const storeEnergy = (creep: Creep) => {
    const target = creep.memory.target
    let storage: Structure | null
    if (!target) {
        // no target yet so find one
        [storage] = creep.room.find(FIND_STRUCTURES, {
            filter: (struct) => {
                return (struct.structureType === STRUCTURE_TOWER ||
                    struct.structureType === STRUCTURE_STORAGE ||
                    struct.structureType === STRUCTURE_CONTAINER) &&
                    struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            }
        })
        if (storage) {
            // console.log('path from creep to storage: ', creep.pos.findPathTo(storage.pos))
            creep.memory.target = storage?.id
        }
    } else {
        storage = Game.getObjectById(target as Id<Structure>)
    }

    if (storage) {
        let result = creep.transfer(storage, RESOURCE_ENERGY)

        if (result === ERR_NOT_IN_RANGE) {
            result = creep.moveTo(storage, MOVE_CONFIG)
            if (result !== OK) {
                console.log('error while harvester moving to storage: ', result)
                creep.drop(RESOURCE_ENERGY)
                throw result
            }
        } else if (result !== OK) {
            throw result
        }
    } else {
        throw ERR_NOT_FOUND
    }
}
