const MOVE_CONFIG: MoveToOpts = {
    visualizePathStyle: { stroke: '#b7ed42', strokeWidth: 0.01, opacity: 0.2, lineStyle: "solid" }
}

export const moveToParkingFlag = (creep: Creep) => {
    const target = creep.memory.target
    let flag: Flag | null
    if (!target) {
        // nothing targeted currently find a construction site
        [flag] = creep.room.find(FIND_FLAGS, {
            filter: (flag) => flag.name === 'Parking'
        })
        // flags dont have an ID so just set the name to tarket
        creep.memory.target = flag?.name
    } else {
        flag = Game.flags['Parking']
    }

    if (flag) {
        const result = creep.moveTo(flag, MOVE_CONFIG)

        if (result !== OK) {
            throw result
        }
        return result
    } else {
        // no flags with this name in the creeps room
        throw ERR_NOT_FOUND
    }
}
