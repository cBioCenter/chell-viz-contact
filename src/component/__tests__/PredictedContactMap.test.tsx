import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import * as React from 'react';

import { ICouplingScore, SECONDARY_STRUCTURE_CODES } from '../../data/chell-data';
import { PredictedContactMap, PredictedContactMapClass } from '../PredictedContactMap';

describe('PredictedContactMap', () => {
  const emptyData = {
    couplingScores: [],
    secondaryStructures: [],
  };

  const generateCouplingScore = (
    i: number,
    j: number,
    dist: number,
    extra?: Partial<ICouplingScore>,
  ): ICouplingScore => ({
    dist,
    i,
    j,
    ...extra,
  });

  // Translated from example1/coupling_scores.csv
  const sampleCorrectPredictedContacts = [generateCouplingScore(56, 50, 2.4)];
  const sampleIncorrectPredictedContacts = [generateCouplingScore(42, 50, 20.4)];
  const sampleOutOfLinearDistContacts = [
    generateCouplingScore(45, 46, 1.3),
    generateCouplingScore(44, 45, 1.3),
    generateCouplingScore(56, 57, 1.3),
  ];
  const sampleObservedContacts = [...sampleCorrectPredictedContacts, generateCouplingScore(41, 52, 1.3)];

  const uniqueScores = new Set(
    Array.from([
      ...sampleCorrectPredictedContacts,
      ...sampleIncorrectPredictedContacts,
      ...sampleObservedContacts,
      ...sampleOutOfLinearDistContacts,
    ]),
  );

  const sampleData = {
    couplingScores: Array.from(uniqueScores),
    secondaryStructures: [
      { resno: 30, structId: 'C' as keyof typeof SECONDARY_STRUCTURE_CODES },
      { resno: 31, structId: 'C' as keyof typeof SECONDARY_STRUCTURE_CODES },
    ],
  };

  describe('Snapshots', () => {
    test('Should match existing snapshot when given no data.', () => {
      expect(toJson(shallow(<PredictedContactMap />))).toMatchSnapshot();
    });

    test('Should match existing snapshot when given empty data.', () => {
      expect(toJson(shallow(<PredictedContactMap data={emptyData} />))).toMatchSnapshot();
    });

    test('Should match snapshot when locked residues are added.', async () => {
      const wrapper = await shallow(<PredictedContactMap />);
      const expectedSelectedPoints = {
        '37,46': [37, 46],
        '8': [8],
      };
      wrapper.setProps({
        lockedResiduePairs: expectedSelectedPoints,
      });
      await wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
    });
  });

  test('Should update linear distance filter when appropriate slider is updated.', () => {
    const wrapper = shallow(<PredictedContactMap data={sampleData} />);
    const instance = wrapper.instance() as PredictedContactMapClass;
    const expected = 10;
    expect(instance.state.linearDistFilter).not.toBe(expected);
    instance.onLinearDistFilterChange()(expected);
    expect(instance.state.linearDistFilter).toBe(expected);
  });

  test('Should update number of predicted contacts to show when appropriate slider is updated.', () => {
    const wrapper = shallow(<PredictedContactMap data={sampleData} />);
    const instance = wrapper.instance() as PredictedContactMapClass;
    const expectedCount = 50;
    expect(instance.state.numPredictionsToShow).not.toBe(expectedCount);
    instance.onNumPredictionsToShowChange()(expectedCount);
    expect(instance.state.numPredictionsToShow).toBe(expectedCount);
  });

  test('Should update # of predicted contacts to show when appropriate slider is updated.', () => {
    const wrapper = shallow(<PredictedContactMap data={sampleData} />);
    const instance = wrapper.instance() as PredictedContactMapClass;
    const expected = 20;
    expect(instance.state.numPredictionsToShow).not.toBe(expected);
    instance.onNumPredictionsToShowChange()(expected);
    expect(instance.state.numPredictionsToShow).toBe(expected);
  });
});