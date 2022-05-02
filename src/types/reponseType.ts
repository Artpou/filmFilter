import { FilmType } from "./filmType";

export interface filmResponseType {
    data: FilmType[],
    itemPerPage: number,
    totalItems: number,
    totalPages: number
}
