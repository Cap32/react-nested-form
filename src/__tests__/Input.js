/* eslint-disable react/prop-types */

import React from 'react';
import { resetBOM } from './utils';
import { mount } from 'enzyme';
import Form, { Input } from '../';

beforeEach(resetBOM);

test('<Input /> typing', function () {
	const App = () => (
		<Form>
			<Input name="hello" />
		</Form>
	);
	const wrapper = mount(<App />);
	const input = wrapper.find('input').first();
	input.node.value += 'o';
	input.simulate('change');
	expect(input.node.value).toBe('o');
	input.node.value += 'k';
	input.simulate('change');
	expect(input.node.value).toBe('ok');
});
