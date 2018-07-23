import { ISearchResultItem } from "../models/ISearchResultItem";

export interface ISearchWebPartState {
    results: ISearchResultItem[];
    hasNextValues: boolean;
    hasPrevValues: boolean;
}