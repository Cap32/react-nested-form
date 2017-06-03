/* eslint-disable react/prop-types */

import React from 'react';
import jsdom from 'jsdom';
import { mount } from 'enzyme';
import Form, { Input } from '../';

const resetBOM = () => {
	global.document = jsdom.jsdom(
		'<!doctype html><html><body></body></html>'
	);
	if (typeof window === 'undefined') {
		global.window = global.document.defaultView;
		global.navigator = global.window.navigator;
	}
};

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
