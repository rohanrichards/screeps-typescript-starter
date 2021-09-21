const MOVE_CONFIG: MoveToOpts = {
    visualizePathStyle: { stroke: '#e34d12', strokeWidth: 0.05, opacity: 0.5, lineStyle: "dotted" }
}


export const buildConstruction = (creep: Creep) => {
    const target = creep.memory.target
    let construction: ConstructionSite | null
    if (!target) {
        // nothing targeted currently find a construction site
        [construction] = creep.room.find(FIND_MY_CONSTRUCTION_SITES)
        creep.memory.target = construction?.id
    } else {
        construction = Game.getObjectById(target as Id<ConstructionSite>)
    }

    if (construction instanceof ConstructionSite) {
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
