import { ISearchResultItem } from "./ISearchResultItem";

export interface ISearchResult {
    results: ISearchResultItem[];
    hasNextValues: boolean;
    hasPrevValues: boolean;
}