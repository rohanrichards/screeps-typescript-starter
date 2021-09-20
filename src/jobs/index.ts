import { getStoredEnergy } from './getStoredEnergy'
import { harvestEnergy } from './harvestEnergy'
import { storeEnergy } from './storeEnergy'

export enum JOBS {
    HARVEST_ENERGY,
    STORE_ENERGY,
    GET_STORED_ENERGY
}

export const jobs = {
    [JOBS.HARVEST_ENERGY]: harvestEnergy,
    [JOBS.STORE_ENERGY]: storeEnergy,
    [JOBS.GET_STORED_ENERGY]: getStoredEnergy
}
