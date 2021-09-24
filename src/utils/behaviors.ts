const MAX_CREEPS_ON_SOURCE = 3

// finds a source that doesn't have too many creeps targeting it
export const findEnergyResource = (creep: Creep) => {
    // get a map of sources with number of creeps targeting them
    const creepTargets: Map<string, number> = new Map()
    Object.keys(Game.creeps).forEach(name => {
        const creepTarget = Game.creeps[name].memory.target
        if (creepTarget) {
            let count = creepTargets.get(creepTarget) ?? 0
            creepTargets.set(creepTarget, ++count)
        }
    })
    const activeSources = creep.room.find(FIND_SOURCES_ACTIVE)
    if (activeSources.length) {
        const [sourceWithSpace] = _.filter(activeSources, (source) => {
            return (creepTargets.get(source.id) ?? 0) < countEmptyTilesAroundSource(source)
        })
        return sourceWithSpace
    } else {
        return undefined
    }
}

export const isEnergyResourceAvailable = (creep: Creep) => {
    return findEnergyResource(creep) ? true : false
}

export const checkIfSpawnNeedsEnergy = () => {
    const [freeRoom] = _.filter(Game.structures, (structure: AnyStoreStructure) => {
        return (structure.structureType === STRUCTURE_EXTENSION ||
            structure.structureType === STRUCTURE_SPAWN) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    })
    return freeRoom ? true : false
}

const countEmptyTilesAroundSource = (source: Source) => {
    const searchGrid = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
    const sourcePos = source.pos
    const map = Game.map.getRoomTerrain(sourcePos.roomName)
    let emptyTiles = 0
    searchGrid.forEach((coords) => {
        if (map.get(sourcePos.x + coords[0], sourcePos.y + coords[1]) === 0) {
            emptyTiles++
        }
    })
    return emptyTiles
}


export const findScavengeSource = (creep: Creep) => {
    let [tomb] = creep.room.find(FIND_TOMBSTONES, {
        filter: (tomb) => { return tomb.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0 > 0 }
    })
    if (tomb) return tomb

    const [ruin] = creep.room.find(FIND_RUINS, {
        filter: (ruin) => { return ruin.store.getUsedCapacity(RESOURCE_ENERGY) ?? 0 > 0 }
    })
    return ruin
}

export const findScavengeSourceFromId = (creep: Creep, id: String) => {
    let [tomb] = creep.room.find(FIND_TOMBSTONES, {
        filter: (tomb) => { return tomb.id === id }
    })
    if (tomb) return tomb

    const [ruin] = creep.room.find(FIND_RUINS, {
        filter: (ruin) => { return ruin.id === id }
    })
    return ruin
}

export const isEnergyStorageAvailable = (creep: Creep) => {
    const [storage] = creep.room.find(FIND_STRUCTURES, {
        filter: (struct) => {
            return (struct.structureType === STRUCTURE_EXTENSION ||
                struct.structureType === STRUCTURE_SPAWN ||
                struct.structureType === STRUCTURE_TOWER ||
                struct.structureType === STRUCTURE_STORAGE ||
                struct.structureType === STRUCTURE_CONTAINER) &&
                struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        }
    })
    return storage ? true : false
}
