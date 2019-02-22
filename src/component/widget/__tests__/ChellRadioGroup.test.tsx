import { shallow } from 'enzyme';
import * as React from 'react';
import { Form } from 'semantic-ui-react';

import { BioblocksRadioGroup, IBioblocksRadioGroupProps } from '~bioblocks-viz~/component';

describe('BioblocksRadioGroup', () => {
  const sampleBioblocksSlider = (props: Partial<IBioblocksRadioGroupProps> = {}) => (
    <BioblocksRadioGroup id="Sample" options={['first']} {...props} />
  );

  it('Should match existing snapshot when given simple data.', () => {
    const wrapper = shallow(sampleBioblocksSlider());
    expect(wrapper).toMatchSnapshot();
  });

  it('Should handle change events.', () => {
    const onChangeSpy = jest.fn();
    const wrapper = shallow(sampleBioblocksSlider({ options: ['sandor', 'gregor'], onChange: onChangeSpy }));
    const expected = 1;
    expect(wrapper.state('selectedIndex')).not.toBe(expected);
    wrapper
      .find(Form.Radio)
      .at(1)
      .simulate('change');
    expect(wrapper.state('selectedIndex')).toBe(expected);
    expect(onChangeSpy).toHaveBeenCalled();
  });
});
