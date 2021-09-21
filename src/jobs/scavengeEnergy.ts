import { findScavengeSource, findScavengeSourceFromId } from "utils/behaviors"

const MOVE_CONFIG: MoveToOpts = {
    visualizePathStyle: { stroke: '#4284ed', strokeWidth: 0.03, opacity: 0.7, lineStyle: "dotted" }
}

export const scavengeEnergy = (creep: Creep) => {
    console.log('creep role attempting to scavenge: role, id, target', creep.memory.role, creep.id, creep.memory.target)
    const target = creep.memory.target
    let source: Tombstone | Ruin | Resource<RESOURCE_ENERGY> | undefined | null
    if (!target) {
        // nothing targeted currently find some energy laying about
        // dropped energy is top priority
        [source] = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: (resource) => {
                return resource.resourceType === RESOURCE_ENERGY
            }
        }) as Resource<RESOURCE_ENERGY>[]

        console.log('dropped resources found: ', source)

        if (!source) {
            // we found no dropped energy so try find a scavenge source
            source = findScavengeSource(creep)
            console.log('ruin/tomb found: ', source)
        }
        // set the target to our source
        creep.memory.target = source?.id
    } else {
        // find the target
        source = Game.getObjectById(target as Id<Tombstone>)
    }

    if (source) {
        console.log('currently set source: ', source)
        let result
        // use the correct method depending on what the source is
        if (source instanceof Resource) {
            console.log('determined to be resource, pickup called')
            result = creep.pickup(source)
        } else if (source instanceof Tombstone || source instanceof Ruin) {
            console.log('determined to be ruin or tomb, withdraw called')
            result = creep.withdraw(source, RESOURCE_ENERGY)
        } else {
            console.log('unknown source type? ', source)
            throw ERR_NOT_FOUND
        }

        console.log('result is: ', result)

        if (result === ERR_NOT_IN_RANGE) {
            console.log('trying to move to the source')
            creep.moveTo(source, MOVE_CONFIG)
        } else if (result !== OK) {
            console.log('failed in move call: ', result)
            throw result
        } else {
            throw ERR_NOT_FOUND
        }
    } else {
        // no sources available
        console.log('found no source so throwing -5')
        throw ERR_NOT_FOUND
    }
}
