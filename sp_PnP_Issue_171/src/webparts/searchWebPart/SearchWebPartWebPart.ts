import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration
} from '@microsoft/sp-webpart-base';

import SearchWebPart from './components/SearchWebPart';
import { ISearchWebPartProps } from './components/ISearchWebPartProps';
import { sp, SearchResults, SearchResult, SearchQuery } from "@pnp/sp";
import { ISearchResultItem } from './models/ISearchResultItem';
import { ISearchResult } from './models/ISearchResult';
import { UrlQueryParameterCollection } from '@microsoft/sp-core-library';
import { autobind } from '../../../node_modules/@uifabric/utilities';

export interface ISearchWebPartWebPartProps {
  description: string;
}

export default class SearchWebPartWebPart extends BaseClientSideWebPart<ISearchWebPartWebPartProps> {

  private defaultKql: string = "";
  private searchPage: number = 0;
  private currentResults: SearchResults = null;

  public async render(): Promise<void> {

    sp.setup({
      spfxContext: this.context
    });

    this.defaultKql = `Path:"${this.context.pageContext.site.absoluteUrl}"`;

    let queryParameters: UrlQueryParameterCollection = new UrlQueryParameterCollection(window.location.href);

    let initialSearchValue: string = null;

    let initialResults: ISearchResultItem[] = [];

    if (queryParameters.getValue("k")) {
      initialSearchValue = queryParameters.getValue("k");
      let initialResult: ISearchResult = await this.performSearch(initialSearchValue);
      initialResults = initialResult.results;
    }

    const element: React.ReactElement<ISearchWebPartProps> = React.createElement(
      SearchWebPart,
      {
        results: initialResults,
        performSearchHandler: this.performSearch,
        performSearchNext: this.nextSearchPage,
        performSearchPrev: this.prevSearchPage,
        initialSearchValue: initialSearchValue
      }
    );

    ReactDom.render(element, this.domElement);
  }


  @autobind
  private async nextSearchPage(): Promise<ISearchResult> {
    this.searchPage++;
    this.currentResults = await this.currentResults.getPage(this.searchPage);

    return await this.processResults();
  }

  @autobind
  private async prevSearchPage(): Promise<ISearchResult> {
    --this.searchPage;
    this.currentResults = await this.currentResults.getPage(this.searchPage);

    return await this.processResults();
  }

  @autobind
  private async performSearch(query: string): Promise<ISearchResult> {

    this.searchPage = 0;

    let q: SearchQuery = {
      Querytext: `${this.defaultKql} ${query}`,
      StartRow: 0 // Removing StartRow and setting searchPage to 1 from 0 seems to address the issue
    };

    this.currentResults = await sp.search(q);

    return await this.processResults();
  }

  private async processResults(): Promise<ISearchResult> {
    let result: ISearchResultItem[] = [];

    let nextPage = this.searchPage + 1;
    let hasNextPageResults = await this.currentResults.getPage(nextPage);
    let hasNextPage: boolean = hasNextPageResults && hasNextPageResults.PrimarySearchResults && hasNextPageResults.PrimarySearchResults.length > 0;

    let hasPrevPage: boolean = this.searchPage > 1;

    this.currentResults.PrimarySearchResults.forEach((v: SearchResult) => {
      result.push({
        Title: v.Title,
        Highlights: v.HitHighlightedSummary,
        Url: v.Path
      });
    });

    return {
      results: result,
      hasNextValues: hasNextPage,
      hasPrevValues: hasPrevPage
    };
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: ''
          },
          groups: [
            {
              groupName: '',
              groupFields: [
              ]
            }
          ]
        }
      ]
    };
  }
}
