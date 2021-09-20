export const upgradeController = (creep: Creep) => {
    const target = creep.memory.target
    let controller: StructureController | undefined
    if (!target) {
        // find the appropriate controller, for now we just check the creeps room
        controller = creep.room.controller
        creep.memory.target = creep.room.controller?.id
    } else {
        controller = creep.room.controller
    }

    if (controller) {
        const result = creep.upgradeController(controller)
        if (result === ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller!)
        } else if (result !== OK) {
            throw result
        }
    }
}
