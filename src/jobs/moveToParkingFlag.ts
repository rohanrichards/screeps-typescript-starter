const MOVE_CONFIG: MoveToOpts = {
    reusePath: 8,
    visualizePathStyle: { stroke: '#ae34eb' }
}

export const moveToParkingFlag = (creep: Creep) => {
    const target = creep.memory.target
    let flag: Flag | undefined
    if (!target) {
        // nothing targeted currently find a construction site
        [flag] = creep.room.find(FIND_FLAGS, {
            filter: (flag) => flag.name === 'Parking'
        })
        // flags dont have an ID so just set the name to tarket
        creep.memory.target = flag?.name
    } else {
        [flag] = creep.room.find(FIND_FLAGS, {
            filter: (flag) => flag.name === target
        })
    }

    if (flag) {
        const result = creep.moveTo(flag)

        if (result !== OK) {
            throw result
        }
        return result
    } else {
        // no flags with this name in the creeps room
        throw ERR_NOT_FOUND
    }
}
