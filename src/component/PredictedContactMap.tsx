import * as React from 'react';
import { initialResidueContext } from '../context/ResidueContext';
import { IContactMapData } from '../data/chell-data';
import { CouplingContainer } from '../data/CouplingContainer';
import { withDefaultProps } from '../helper/ReactHelper';
import { generateChartDataEntry, IContactMapChartData } from './chart/ContactMapChart';
import ContactMap, { IContactMapConfiguration } from './ContactMap';

export const defaultPredictedContactMapProps = {
  correctColor: '#ff0000',
  data: {
    couplingScores: new CouplingContainer(),
    secondaryStructures: [],
  } as IContactMapData,
  height: 400,
  incorrectColor: '#000000',
  ...initialResidueContext,
  observedColor: '#0000ff',
  padding: 0,
  width: 400,
};

export const initialPredictedContactMapState = {
  chainLength: -1,
  linearDistFilter: 5,
  measuredContactDistFilter: 5,
  numPredictionsToShow: -1,
  pointsToPlot: [] as IContactMapChartData[],
};

export type PredictedContactMapProps = {} & typeof defaultPredictedContactMapProps;
export type PredictedContactMapState = Readonly<typeof initialPredictedContactMapState>;

export class PredictedContactMapClass extends React.Component<PredictedContactMapProps, PredictedContactMapState> {
  /**
   * Determine which contacts in a set of coupling scores are observed.
   *
   * @param contacts Set of contacts, usually generated from coupling_scores.csv.
   * @param [actualDistFilter=5] For each score, if dist <= linearDistFilter, it is considered observed.
   * @returns Contacts that should be considered observed int he current data set.
   */

  /**
   * Determine which contacts in a set of coupling scores are predicted as well as which are correct.
   *
   * @param contacts Set of contacts, usually generated from coupling_scores.csv.
   * @param totalPredictionsToShow How many predictions, max, to return.
   * @param [linearDistFilter=5] For each score, if |i - j| >= linearDistFilter, it will be a candidate for being correct/incorrect.
   * @param [measuredContactDistFilter=5]  If the dist for the contact is less than predictionCutoffDist, it is considered correct.
   * @returns The list of correct and incorrect contacts.
   */

  public readonly state: PredictedContactMapState = initialPredictedContactMapState;

  constructor(props: PredictedContactMapProps) {
    super(props);
  }

  public onLinearDistFilterChange = () => (value: number) => {
    this.setState({
      linearDistFilter: value,
    });
  };

  public onNumPredictionsToShowChange = () => (value: number) => {
    this.setState({
      numPredictionsToShow: value,
    });
  };

  public componentDidUpdate(prevProps: PredictedContactMapProps, prevState: PredictedContactMapState) {
    const { correctColor, data, incorrectColor, observedColor } = this.props;
    const { linearDistFilter, measuredContactDistFilter, numPredictionsToShow } = this.state;

    const isRecomputeNeeded =
      data.couplingScores !== prevProps.data.couplingScores ||
      linearDistFilter !== prevState.linearDistFilter ||
      measuredContactDistFilter !== prevState.measuredContactDistFilter ||
      numPredictionsToShow !== prevState.numPredictionsToShow;
    if (isRecomputeNeeded) {
      const { chainLength } = data.couplingScores;
      const observedContacts = data.couplingScores.getObservedContacts(measuredContactDistFilter);

      const allPredictions = data.couplingScores.getPredictedContacts(numPredictionsToShow, linearDistFilter);

      const correctPredictionPercent = (
        (allPredictions.correct.length / allPredictions.predicted.length) *
        100
      ).toFixed(2);
      const newPoints = [
        generateChartDataEntry(
          'x+y',
          { start: observedColor, end: 'rgb(100,177,200)' },
          'Known Structure Contact',
          '(from PDB structure)',
          4,
          observedContacts,
        ),
        generateChartDataEntry(
          'x+y',
          incorrectColor,
          'Predicted Contact',
          `(N=${numPredictionsToShow}, L=${chainLength})`,
          4,
          allPredictions.predicted,
        ),
        generateChartDataEntry(
          'x+y',
          correctColor,
          'Correct Prediction',
          `(N=${allPredictions.correct.length}, ${correctPredictionPercent}%)`,
          6,
          allPredictions.correct,
        ),
      ] as IContactMapChartData[];

      this.setState({
        chainLength,
        numPredictionsToShow:
          data.couplingScores !== prevProps.data.couplingScores ? Math.floor(chainLength / 2) : numPredictionsToShow,
        pointsToPlot: newPoints,
      });
    }
  }

  public render() {
    const { data, ...passThroughProps } = this.props;
    const { chainLength, pointsToPlot } = this.state;
    return (
      <div id="PredictedContactMapComponent">
        <ContactMap
          chainLength={chainLength}
          configurations={this.getContactMapConfigs()}
          data={{ computedPoints: pointsToPlot, secondaryStructures: data.secondaryStructures }}
          {...passThroughProps}
        />
      </div>
    );
  }

  protected getContactMapConfigs = (): IContactMapConfiguration[] => [
    {
      name: 'Linear Distance Filter (|i - j|)',
      onChange: this.onLinearDistFilterChange(),
      values: {
        current: this.state.linearDistFilter,
        max: 10,
        min: 1,
      },
    },
    {
      name: 'Top N Predictions to Show',
      onChange: this.onNumPredictionsToShowChange(),
      values: {
        current: this.state.numPredictionsToShow,
        max: this.state.chainLength,
        min: 1,
      },
    },
  ];
}

export const PredictedContactMap = withDefaultProps(defaultPredictedContactMapProps, PredictedContactMapClass);

export default PredictedContactMap;
