import { Datum } from 'plotly.js';
import { IPlotlyData } from '../component/chart/PlotlyChart';
import { SECONDARY_STRUCTURE, SECONDARY_STRUCTURE_KEYS, SECONDARY_STRUCTURE_SECTION } from './chell-data';

export interface IAxisMapping {
  x: Partial<IPlotlyData>;
  y: Partial<IPlotlyData>;
}

/**
 * Class to represent the x and y axis for a secondary structure on a Plotly graph.
 *
 * @export
 */
export default class SecondaryStructureAxis {
  protected axes: Map<SECONDARY_STRUCTURE_KEYS, IAxisMapping> = new Map();

  public get axis() {
    return this.axes;
  }

  /**
   * Creates an instance of SecondaryStructureAxis.
   * @param sequence Sequence of secondary structures.
   * @param [colorMap={
   *       C: 'red',
   *       E: 'green',
   *       H: 'blue',
   *     }] How to color the different secondary structure types.
   */
  constructor(
    sequence: SECONDARY_STRUCTURE,
    index: number = 0,
    readonly colorMap: { [key: string]: string } = {
      C: 'red',
      E: 'green',
      H: 'blue',
    },
  ) {
    this.setupSecondaryStructureAxes(sequence, index + 2);
  }

  protected derivePointsInAxis = (section: SECONDARY_STRUCTURE_SECTION) => {
    const result = {
      main: [section.start],
      opposite: [null] as Array<number | null>,
    };
    for (let i = section.start; i <= section.end; ++i) {
      result.main.push(i);
      result.opposite.push(1);

      // Creating diagonals for alpha helix.
      if (section.label === 'H') {
        result.main.push(i + 0.5);
        result.opposite.push(i % 2 ? 0 : 2);
      }
    }

    result.main.push(section.end);
    result.opposite.push(null);

    return result;
  };

  protected deriveSymbolsInAxis = (section: SECONDARY_STRUCTURE_SECTION) => {
    const result = new Array();
    const blankSymbol = 'line-ne';
    result.push(blankSymbol);
    for (let i = section.start; i < section.end; ++i) {
      result.push(blankSymbol);
    }

    return result;
  };

  protected setupSecondaryStructureAxes = (sections: SECONDARY_STRUCTURE, index: number): void => {
    for (const chellSection of sections) {
      const { label } = chellSection;
      if (!this.axes.get(label)) {
        this.axes.set(label, {
          x: this.generateXAxisSecStructSegment(label, index),
          y: this.generateYAxisSecStructSegment(label, index),
        });
      }

      const points = this.derivePointsInAxis(chellSection);
      (this.axes.get(label)!.x.x! as Datum[]).push(...points.main);
      (this.axes.get(label)!.x.y! as Datum[]).push(...points.opposite);
      (this.axes.get(label)!.y.y! as Datum[]).push(...points.main);
      (this.axes.get(label)!.y.x! as Datum[]).push(...points.opposite);

      if (chellSection.label === 'E') {
        const symbols = new Array<string>(this.axes.get(label)!.x.x!.length);
        for (let i = 0; i < symbols.length - 2; ++i) {
          symbols[i] = 'line-ne';
        }

        this.axes.get(label)!.x.mode = 'lines+markers';
        this.axes.get(label)!.x.marker = {
          color: this.colorMap[chellSection.label],
          size: 10,
          symbol: [
            ...this.axes.get(label)!.x.marker!.symbol,
            ...this.deriveSymbolsInAxis(chellSection),
            'triangle-right',
            'line-ne',
          ],
        };
        this.axes.get(label)!.y.mode = 'lines+markers';
        this.axes.get(label)!.y.marker = {
          color: this.colorMap[chellSection.label],
          size: 10,
          symbol: [
            ...this.axes.get(label)!.y.marker!.symbol,
            ...this.deriveSymbolsInAxis(chellSection),
            'triangle-down',
            'line-ne',
          ],
        };
      }
    }
  };

  /**
   * Generate a Plotly data object to represent the secondary structure on the X axis.
   *
   * @param entry A Single residue-secondary structure element.
   */
  protected generateXAxisSecStructSegment = (code: SECONDARY_STRUCTURE_KEYS, index: number): Partial<IPlotlyData> => ({
    ...this.secondaryStructureAxisDefaults(code),
    orientation: 'h',
    xaxis: 'x',
    yaxis: `y${index}`,
  });

  /**
   * Generate a Plotly data object to represent the secondary structure on the Y axis.
   *
   * @param entry A Single residue-secondary structure element.
   */
  protected generateYAxisSecStructSegment = (code: SECONDARY_STRUCTURE_KEYS, index: number): Partial<IPlotlyData> => ({
    ...this.secondaryStructureAxisDefaults(code),
    orientation: 'v',
    xaxis: `x${index}`,
    yaxis: 'y',
  });

  protected secondaryStructureAxisDefaults = (code: SECONDARY_STRUCTURE_KEYS): Partial<IPlotlyData> => ({
    connectgaps: false,
    hoverinfo: 'name',
    line: {
      color: this.colorMap[code],
      shape: 'spline',
      smoothing: 1.3,
      width: code === 'H' ? 1 : 5,
    },
    marker: {
      symbol: [],
    },
    mode: 'lines',
    name: code,
    showlegend: false,
    type: 'scatter',
    x: [],
    y: [],
  });
}

export { SecondaryStructureAxis };
