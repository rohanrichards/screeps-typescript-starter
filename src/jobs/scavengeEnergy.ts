import { findScavengeSource, findScavengeSourceFromId } from "utils/behaviors"

const MOVE_CONFIG: MoveToOpts = {
    reusePath: 8,
    visualizePathStyle: { stroke: '#ae34eb' }
}

export const scavengeEnergy = (creep: Creep) => {
    const target = creep.memory.target
    let source: Tombstone | Ruin | Resource<RESOURCE_ENERGY> | undefined
    if (!target) {
        // nothing targeted currently find some energy laying about
        // dropped energy is top priority
        [source] = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: (resource) => {
                return resource.resourceType === RESOURCE_ENERGY
            }
        }) as Resource<RESOURCE_ENERGY>[]

        if (!source) {
            // we found no dropped energy so try find a scavenge source
            source = findScavengeSource(creep)
        }
        // set the target to our source
        creep.memory.target = source?.id
    } else {
        source = findScavengeSourceFromId(creep, target)
    }

    if (source) {
        let result
        if (source instanceof Resource) {
            result = creep.pickup(source)
        } else if (source instanceof Tombstone || source instanceof Ruin) {
            result = creep.withdraw(source, RESOURCE_ENERGY)
        }

        if (result === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, MOVE_CONFIG)
        } else if (result !== OK) {
            throw result
        }
    } else {
        // no sources available
        throw ERR_NOT_FOUND
    }
}
