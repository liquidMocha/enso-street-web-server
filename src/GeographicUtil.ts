import {Coordinates} from "./location/Coordinates";

export const getGeographicLocationFrom = (coordinates?: Coordinates): string | null => {
    if (coordinates === undefined) {
        return null;
    }
    return `ST_GeomFromEWKT('SRID=4326;POINT(${coordinates.longitude} ${coordinates.latitude})')`
};
