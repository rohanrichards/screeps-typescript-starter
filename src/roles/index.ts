import { builderRole } from "./builder";
import { harvesterRole } from "./harvester"
import { haulerRole } from "./hauler";
import { upgraderRole } from "./upgrader";
import { utilityRole } from "./utility";

export enum ROLES {
    HARVESTER,
    BUILDER,
    HAULER,
    UPGRADER,
    UTILITY
}

export const roles = {
    [ROLES.HARVESTER]: harvesterRole,
    [ROLES.BUILDER]: builderRole,
    [ROLES.HAULER]: haulerRole,
    [ROLES.UPGRADER]: upgraderRole,
    [ROLES.UTILITY]: utilityRole
};

