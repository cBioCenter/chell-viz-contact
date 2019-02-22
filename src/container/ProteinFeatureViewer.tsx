import * as React from 'react';
import { CheckboxProps, Form, FormProps, GridColumn, GridRow, InputOnChangeData } from 'semantic-ui-react';

import { FeatureViewer } from '~bioblocks-viz~/component';
import { IPlotlyData, IProtein, TintedBioblocks1DSection } from '~bioblocks-viz~/data';
import { ColorMapper } from '~bioblocks-viz~/helper';

export interface IProteinFeatureViewerProps {
  initialProteinId: string;
}

export interface IProteinFeatureViewerState {
  data: Array<Partial<IPlotlyData>>;
  domainData: Array<TintedBioblocks1DSection<string>>;
  protein?: IProtein;
  proteinId: string;
  showGrouped: boolean;
}

export const SAMPLE_PROTEIN_IDS = {
  '3Domains': 'Q8TDF5',
  '5Domains': 'Q96L73',
  DLL3_HUMAN: 'Q9NYJ7',
  SMAD4_HUMAN: 'Q13485',
};

export class ProteinFeatureViewer extends React.Component<IProteinFeatureViewerProps, IProteinFeatureViewerState> {
  public static defaultProps = {
    initialProteinId: SAMPLE_PROTEIN_IDS.DLL3_HUMAN,
  };

  constructor(props: IProteinFeatureViewerProps) {
    super(props);
    this.state = {
      data: [],
      domainData: [],
      proteinId: props.initialProteinId,
      showGrouped: true,
    };
  }

  public async componentDidMount() {
    await this.deriveProteinData();
  }

  public render() {
    const { domainData, protein, proteinId, showGrouped } = this.state;

    return (
      <div className={'protein-feature-viewer'}>
        <GridRow centered={true} stretched={false}>
          <GridColumn>
            <FeatureViewer
              data={domainData}
              getTextForHover={this.renderAnnotationText}
              title={protein ? protein.id : ''}
              showGrouped={showGrouped}
            />
          </GridColumn>
          <GridColumn>
            <Form onSubmit={this.onProteinInputSubmit}>
              <Form.Input onChange={this.onProteinInputChange} value={proteinId} fluid={false} width={'three'} />
              <Form.Button>Submit Protein ID</Form.Button>
              <Form.Checkbox defaultChecked={true} label={'Show grouped?'} onChange={this.onShowGroupedChange} />
            </Form>
          </GridColumn>
        </GridRow>
      </div>
    );
  }

  protected onProteinInputChange = (event: React.SyntheticEvent<HTMLInputElement>, data: InputOnChangeData) => {
    this.setState({
      proteinId: data.value,
    });
  };

  protected async deriveProteinData() {
    try {
      const result = await fetch(`https://www.ebi.ac.uk/proteins/api/proteins/${this.state.proteinId}`);
      if (result && result.ok) {
        const protein = (await result.json()) as IProtein;
        const domains = protein.features.filter(feature => feature.type === 'DOMAIN');
        const colorMapper = new ColorMapper<string>();

        const domainData = domains.map((domain, index) => {
          const { begin, description = '', end } = domain;
          // This matches domains that do and do not have other of the same domain in the protein.
          const domainName = description.split('-like')[0];

          return new TintedBioblocks1DSection(
            domainName,
            begin ? Number.parseInt(begin, 10) : -1,
            end ? Number.parseInt(end, 10) : -1,
            colorMapper.getColorFor(domainName),
          );
        });

        this.setState({
          domainData,
          protein,
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  protected onProteinInputSubmit = async (event: React.FormEvent<HTMLFormElement>, data: FormProps) => {
    await this.deriveProteinData();
  };

  protected onShowGroupedChange = (event: React.FormEvent<HTMLInputElement>, data: CheckboxProps) => {
    this.setState({
      showGrouped: data.checked !== undefined ? data.checked : this.state.showGrouped,
    });
  };

  protected renderAnnotationText = (proteinId: string, index: number) => {
    const { domainData, protein } = this.state;
    const pFamIds = protein
      ? protein.dbReferences
          .filter(dbRef => dbRef.type === 'Pfam')
          .filter(pFamRef => {
            const { properties } = pFamRef;
            const entryName = properties ? properties['entry name'] : null;

            return entryName && (entryName === proteinId || entryName.localeCompare(`${proteinId}-like ${index}`));
          })
      : [];

    return pFamIds.length >= 1
      ? `${proteinId}: ${proteinId} domain (${domainData[index].start} - ${
          domainData[index].end
        })<br /><a href="http://pfam.xfam.org/family/${
          pFamIds[0].id
        }">PFAM</a> <a href="http://mutationaligner.org/domains/${pFamIds[0].id}">Mutagen Aligner</a>`
      : '';
  };
}