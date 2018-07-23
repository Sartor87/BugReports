import * as React from 'react';
import { ISearchWebPartProps } from './ISearchWebPartProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { ISearchWebPartState } from './ISearchWebPartState';
import { DocumentCard, DocumentCardLocation, DocumentCardTitle, ActionButton, TextField } from 'office-ui-fabric-react';
import { FileTypeIcon, IconType, ImageSize } from "@pnp/spfx-controls-react/lib/FileTypeIcon";
import { ISearchResultItem } from '../models/ISearchResultItem';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { ISearchResult } from '../models/ISearchResult';

export default class SearchWebPart extends React.Component<ISearchWebPartProps, ISearchWebPartState> {

  private initialSearchValue: string | "";

  constructor(props: ISearchWebPartProps) {
    super(props);

    if (props.initialSearchValue && props.initialSearchValue.length > 0) {
      this.initialSearchValue = props.initialSearchValue;
    }

    this.state = {
      results: props.results,
      hasNextValues: true,
      hasPrevValues: false
    };
  }

  public render(): React.ReactElement<ISearchWebPartProps> {

    let searchResults: JSX.Element[] = this.state.results && this.state.results.length > 0 ? this.state.results.map((v: ISearchResultItem) => {
      let resultItemHighlights: string = v.Highlights.replace(/<c0>/, "").replace(/<\/c0>/, "").replace(/<ddd\/>/, "");
      return (<DocumentCard>
        <FileTypeIcon type={IconType.image} size={ImageSize.medium} path={v.Url} />
        <DocumentCardLocation
          location={v.Title}
          locationHref={v.Url}
        />
        <DocumentCardTitle title={resultItemHighlights} />
      </DocumentCard>);
    }) : [(<div>No results</div>)];

    let searchBox: JSX.Element = (<div><TextField
      label="Search"
      placeholder="Search..."
      defaultValue="Search..."
      onKeyUp={(e) => {
        if (e.keyCode === 13) {
          this.searchTyped((e.target as HTMLInputElement).value);
        }
      }}
    /></div>);

    if (this.initialSearchValue && this.initialSearchValue.length > 0) {
      searchBox = (<div><TextField
        label="Search"
        placeholder="Search..."
        defaultValue="Search..."
        onKeyUp={(e) => {
          if (e.keyCode === 13) {
            this.searchTyped((e.target as HTMLInputElement).value);
          }
        }}
        value={this.initialSearchValue}
      />
      </div>);
    }

    let hiddenStyle = { display: 'none' };

    return (
      <div className={"searchPageContainer"}>
        {searchBox}
        <ActionButton className={"search-page-action-btn"} onClick={(e) => { this.searchTyped((e.target as HTMLElement).nodeValue); }}></ActionButton>
        <div className={"cchbc-promise-search-results"}>
          {searchResults}
        </div>
        <ActionButton iconProps={{ iconName: 'Previous' }} onClick={this.performSearchPrev} style={!this.state.hasPrevValues ? hiddenStyle : {}}>Prev</ActionButton>
        <ActionButton iconProps={{ iconName: 'Next' }} onClick={this.performSearchNext} style={!this.state.hasNextValues ? hiddenStyle : {}}>Next</ActionButton>
      </div>
    );
  }

  @autobind
  private performSearchPrev(): void {
    this.initialSearchValue = "";

    this.props.performSearchPrev().then(this.setStateResults).catch((err: any) => {
      console.error(err);
    });
  }

  @autobind
  private performSearchNext(): void {
    this.initialSearchValue = "";

    this.props.performSearchNext().then(this.setStateResults).catch((err: any) => {
      console.error(err);
    });
  }

  @autobind
  private searchTyped(e): void {
    this.initialSearchValue = "";

    this.props.performSearchHandler(e).then(this.setStateResults).catch((err: any) => {
      console.error(err);
    });
  }

  @autobind
  private setStateResults(response: ISearchResult): void {
    this.setState({
      results: response.results,
      hasNextValues: response.hasNextValues,
      hasPrevValues: response.hasPrevValues
    });
  }
}
