export enum CREEP_STATES {
    FILL,
    EMPTY,
    IDLE
}

export interface ICReepJobs { [job: string]: string }

export const CREEP_JOB_ICONS: ICReepJobs = {
    HARVEST: '⛏',
    PICKUP: '🔼',
    TRANSFER: '🔁',
    SCAVENGE: '🦅',
    STORE: '🔽',
    BUILD: '🔨',
    REPAIR: '🔧',
    UPGRADE: '🛠',
    IDLE: '⌚',
    THINK: '❓'
}

export enum CREEP_JOBS {
    HARVEST = 'HARVEST',
    PICKUP = 'PICKUP',
    TRANSFER = 'TRANSFER',
    SCAVENGE = 'SCAVENGE',
    STORE = 'STORE',
    BUILD = 'BUILD',
    REPAIR = 'REPAIR',
    UPGRADE = 'UPGRADE',
    IDLE = 'IDLE',
    THINK = 'THINK'
}
