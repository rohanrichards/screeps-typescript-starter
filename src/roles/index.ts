import { builderRole } from "./builder";
import { harvesterRole } from "./harvester"
import { haulerRole } from "./hauler";
import { upgraderRole } from "./upgrader";

export enum ROLES {
    HARVESTER,
    BUILDER,
    HAULER,
    UPGRADER
}

export const roles = {
    [ROLES.HARVESTER]: harvesterRole,
    [ROLES.BUILDER]: builderRole,
    [ROLES.HAULER]: haulerRole,
    [ROLES.UPGRADER]: upgraderRole
};

