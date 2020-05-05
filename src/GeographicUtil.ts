import {Coordinates} from "./location/Coordinates";

export const getGeographicLocationFrom = (coordinates: Coordinates) => {
    return `ST_GeomFromEWKT('SRID=4326;POINT(${coordinates.longitude} ${coordinates.latitude})')`
};
