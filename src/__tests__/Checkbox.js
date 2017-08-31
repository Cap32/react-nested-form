/* eslint-disable react/prop-types */

import React from 'react';
import { resetBOM } from './utils';
import { mount } from 'enzyme';
import Form, { Checkbox } from '../';

beforeEach(resetBOM);

test('change check state', function () {
	const wrapper = mount(
		<Form>
			<Checkbox name="hello" defaultChecked />
		</Form>
	);
	const input = wrapper.find('input').first();
	expect(input.node.checked).toBe(true);
	input.node.checked = false;
	input.simulate('change');
	expect(input.node.checked).toBe(false);
	input.node.checked = true;
	input.simulate('change');
	expect(input.node.checked).toBe(true);
});

test('submitting with checked', function (done) {
	const handleSubmit = (data) => {
		try {
			expect(data.hello).toBe('world');
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Checkbox name="hello" value="world" defaultChecked />
		</Form>
	);
	wrapper.find(Form).get(0).submit();
});

test('submitting with unchecked', function (done) {
	const handleSubmit = (data) => {
		try {
			expect(typeof data.hello).toBe('undefined');
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Checkbox name="hello" value="world" />
		</Form>
	);
	wrapper.find(Form).get(0).submit();
});

test('should default value be "on"', function (done) {
	const handleSubmit = (data) => {
		try {
			expect(data.hello).toBe('on');
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Checkbox name="hello" defaultChecked />
		</Form>
	);
	wrapper.find(Form).get(0).submit();
});

test('change check state and submit', function (done) {
	const handleSubmit = (data) => {
		try {
			expect(data.hello).toBe('world');
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Checkbox name="hello" value="world" />
		</Form>
	);
	const input = wrapper.find('input').first();
	input.node.checked = true;
	input.simulate('change');
	wrapper.find(Form).get(0).submit();
});
