import { ISearchResultItem } from "../models/ISearchResultItem";
import { ISearchResult } from "../models/ISearchResult";

export interface ISearchWebPartProps {
  results: ISearchResultItem[];
  performSearchHandler: ((query: string) => Promise<ISearchResult>);
  performSearchNext: (() => Promise<ISearchResult>);
  performSearchPrev: (() => Promise<ISearchResult>);
  initialSearchValue?: string;
}
