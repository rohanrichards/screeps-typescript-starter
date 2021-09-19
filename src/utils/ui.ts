export const ui = {
    run: (roomName: string) => {
        const roomVisual = new RoomVisual(roomName)
        let startX = 30
        let startY = 10
        roomVisual.text('Creep Status:', startX, startY, { align: 'left' })

        const creeps = new Map()
        _.forEach(Game.creeps, (creep) => {
            let count = creeps.get(creep.memory.role) ?? 0
            creeps.set(creep.memory.role, ++count)
        })

        creeps.forEach((value, key) => {
            roomVisual.text(`${key}: ${value}`, startX, ++startY, { align: 'left' })
        })
    }
}
