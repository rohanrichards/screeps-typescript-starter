const MOVE_CONFIG: MoveToOpts = {
    reusePath: 8,
    visualizePathStyle: { stroke: '#ebc334' }
}


export const buildConstruction = (creep: Creep) => {
    const target = creep.memory.target
    let construction: ConstructionSite | undefined
    if (!target) {
        // nothing targeted currently find a construction site
        [construction] = creep.room.find(FIND_MY_CONSTRUCTION_SITES)
        creep.memory.target = construction?.id
    } else {
        [construction] = creep.room.find(FIND_MY_CONSTRUCTION_SITES, { filter: (site) => site.id === target })
    }

    if (construction) {
        const result = creep.build(construction)

        if (result === ERR_NOT_IN_RANGE) {
            creep.moveTo(construction, MOVE_CONFIG)
        } else if (result !== OK) {
            throw result
        }
    } else {
        // no construction sites
        throw ERR_NOT_FOUND
    }
}
