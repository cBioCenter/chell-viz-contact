import { mount, shallow } from 'enzyme';
import * as React from 'react';
import { Form } from 'semantic-ui-react';

import { FeatureViewer, IFeatureViewerState } from '~bioblocks-viz~/component';
import { ProteinFeatureViewer } from '~bioblocks-viz~/container';
import { IProtein } from '~bioblocks-viz~/data';
import { dispatchPlotlyEvent } from '~bioblocks-viz~/test';

describe('ProteinFeatureViewer', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  // tslint:disable-next-line:mocha-no-side-effect-code no-require-imports
  const sampleProtein = require('./Q13485.json') as IProtein;

  it('Should match the default snapshot.', () => {
    const wrapper = shallow(<ProteinFeatureViewer />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Should show protein information when successfully retrieved.', () => {
    fetchMock.mockResponseOnce(JSON.stringify(sampleProtein));
    const wrapper = shallow(<ProteinFeatureViewer />);
    expect(wrapper).toMatchSnapshot();
  });

  it('Should default to an invalid range if there is a problem with the response JSON.', async () => {
    const mh1Domain = sampleProtein.features.find(
      feature => feature.type === 'DOMAIN' && feature.description === 'MH1',
    );
    fetchMock.mockResponseOnce(
      JSON.stringify({
        ...sampleProtein,
        features: [
          ...sampleProtein.features,
          {
            ...mh1Domain,
            begin: '',
            end: '',
          },
        ],
      }),
    );
    const wrapper = shallow(<ProteinFeatureViewer initialProteinId={sampleProtein.accession} />);
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('Should toggle the grouping flag when the appropriate control is clicked.', () => {
    fetchMock.mockResponseOnce(JSON.stringify(sampleProtein));
    const wrapper = shallow(<ProteinFeatureViewer initialProteinId={''} />);
    expect(wrapper.state('showGrouped')).toEqual(true);
    wrapper
      .find(Form.Checkbox)
      .at(0)
      .simulate('change', {}, { checked: false });
    expect(wrapper.state('showGrouped')).toEqual(false);

    wrapper
      .find(Form.Checkbox)
      .at(0)
      .simulate('change', {}, { checked: true });
    expect(wrapper.state('showGrouped')).toEqual(true);

    wrapper
      .find(Form.Checkbox)
      .at(0)
      .simulate('change', {}, {});
    expect(wrapper.state('showGrouped')).toEqual(true);
  });

  it('Should update the proteinId as the user enters text into the input field.', async () => {
    const wrapper = shallow(<ProteinFeatureViewer initialProteinId={''} />);
    expect(wrapper.state('proteinId')).toEqual('');
    const expectedId = 'Q13485';
    fetchMock.mockResponseOnce(JSON.stringify(sampleProtein));
    wrapper
      .find(Form.Input)
      .at(0)
      .simulate('change', {}, { value: expectedId });
    expect(wrapper.state('proteinId')).toEqual(expectedId);
  });

  it('Should fetch a new protein with a user-supplied protein ID when the user submits it.', done => {
    const wrapper = shallow(<ProteinFeatureViewer initialProteinId={''} />);
    expect(wrapper.state('proteinId')).toEqual('');
    expect(wrapper.state('protein')).toBeUndefined();
    wrapper.setState({
      proteinId: 'Q13485',
    });

    fetchMock.mockResponseOnce(JSON.stringify(sampleProtein));
    wrapper
      .find(Form)
      .at(0)
      .simulate('submit', {});

    // To test asynchronous render code - https://www.leighhalliday.com/testing-asynchronous-components-mocks-jest
    setTimeout(() => {
      wrapper.update();
      expect(wrapper.state('protein')).toEqual(sampleProtein);
      done();
    });
  });

  it('Should generate annotation text when a hover event is fired.', done => {
    fetchMock.mockResponseOnce(JSON.stringify(sampleProtein));
    const wrapper = mount(<ProteinFeatureViewer />);
    wrapper.update();

    setTimeout(async () => {
      wrapper.update();
      expect(wrapper.state('protein')).toEqual(sampleProtein);
      await dispatchPlotlyEvent(wrapper, 'plotly_hover', { x: [42], y: [1] });
      const featureViewerState = wrapper
        .find(FeatureViewer)
        .at(0)
        .instance().state as IFeatureViewerState;
      expect(featureViewerState.hoverAnnotationText).toMatchSnapshot();
      done();
    });
  });

  it('Should generate empty annotation text when a hover event is fired and the protein information is not available.', done => {
    const mh1Domain = sampleProtein.features.find(
      feature => feature.type === 'DOMAIN' && feature.description === 'MH1',
    );
    fetchMock.mockResponseOnce(
      JSON.stringify({
        ...sampleProtein,
        dbReferences: [],
        features: [
          ...sampleProtein.features,
          {
            ...mh1Domain,
            begin: '',
            end: '',
          },
        ],
      }),
    );
    const wrapper = mount(<ProteinFeatureViewer />);
    wrapper.update();

    setTimeout(async () => {
      wrapper.update();
      await dispatchPlotlyEvent(wrapper, 'plotly_hover', { x: [42], y: [0] });
      const featureViewerState = wrapper
        .find(FeatureViewer)
        .at(0)
        .instance().state as IFeatureViewerState;
      const expected = '';
      expect(featureViewerState.hoverAnnotationText).toEqual(expected);
      done();
    });
  });

  it('Should generate empty annotation text when a hover event is fired but the PFam information is not available.', done => {
    const dbRefs = sampleProtein.dbReferences
      .filter(dbRef => dbRef.type === 'Pfam')
      .map(pFamRef => ({
        ...pFamRef,
        properties: null,
      }));

    fetchMock.mockResponseOnce(
      JSON.stringify({
        ...sampleProtein,
        dbReferences: dbRefs,
      }),
    );
    const wrapper = mount(<ProteinFeatureViewer />);
    wrapper.update();

    setTimeout(async () => {
      wrapper.update();
      await dispatchPlotlyEvent(wrapper, 'plotly_hover', { x: [42], y: [0] });
      const featureViewerState = wrapper
        .find(FeatureViewer)
        .at(0)
        .instance().state as IFeatureViewerState;
      const expected = '';
      expect(featureViewerState.hoverAnnotationText).toEqual(expected);
      done();
    });
  });

  it('Should generate empty annotation text when a hover event is fired but no protein was fetched.', done => {
    fetchMock.mockResponseOnce(JSON.stringify(sampleProtein));
    const wrapper = mount(<ProteinFeatureViewer />);
    wrapper.update();

    setTimeout(async () => {
      wrapper.update();
      wrapper.setState({
        protein: undefined,
      });
      await dispatchPlotlyEvent(wrapper, 'plotly_hover', { x: [42], y: [0] });
      const featureViewerState = wrapper
        .find(FeatureViewer)
        .at(0)
        .instance().state as IFeatureViewerState;
      const expected = '';
      expect(featureViewerState.hoverAnnotationText).toEqual(expected);
      done();
    });
  });

  it('Should handle when there is an error fetching.', done => {
    fetchMock.mockReject();
    const wrapper = mount(<ProteinFeatureViewer initialProteinId={''} />);
    expect(wrapper.state('proteinId')).toEqual('');
    expect(wrapper.state('protein')).toBeUndefined();
    wrapper.setState({
      proteinId: 'Q13485',
    });

    wrapper
      .find(Form)
      .at(0)
      .simulate('submit', {});

    // To test asynchronous render code - https://www.leighhalliday.com/testing-asynchronous-components-mocks-jest
    setTimeout(() => {
      wrapper.update();
      expect(wrapper.state('protein')).toBeUndefined();
      done();
    });
  });
});
