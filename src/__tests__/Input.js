/* eslint-disable react/prop-types */

import React from 'react';
import { resetBOM } from './utils';
import { mount } from 'enzyme';
import Form, { Input } from '../';

beforeEach(resetBOM);

test('typing', function () {
	const wrapper = mount(
		<Form>
			<Input name="hello" />
		</Form>
	);
	const input = wrapper.find('input').first();
	input.node.value += 'o';
	input.simulate('change');
	expect(input.node.value).toBe('o');
	input.node.value += 'k';
	input.simulate('change');
	expect(input.node.value).toBe('ok');
});

test('outputFilter', function (done) {
	const value = '1';

	const handleSubmit = (data) => {
		try {
			expect(typeof data.hello).toBe('number');
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const toNumber = (value) => parseInt(value, 10);
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="hello" defaultValue={value} outputFilter={toNumber} />
		</Form>
	);
	wrapper.find(Form).get(0).submit();
});

test('inputFilter', function (done) {
	const value = Date.now();

	const handleSubmit = (data) => {
		try {
			expect(data.createdAt).toEqual(new Date(value).toString());
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const toDateString = (value) => new Date(value).toString();
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="createdAt" defaultValue={value} inputFilter={toDateString} />
		</Form>
	);
	const inputValue = wrapper.find('input').props().value;
	expect(typeof inputValue).toBe('string');
	expect(inputValue).toEqual(new Date(value).toString());
	wrapper.find(Form).get(0).submit();
});

test('inputFilter and typing', function () {
	const value = 'world';
	const filter = (value) => {
		if (/^hello, /.test(value)) { return value; }
		return `hello, ${value}`;
	};
	const wrapper = mount(
		<Form>
			<Input name="say" defaultValue={value} inputFilter={filter} />
		</Form>
	);
	const input = wrapper.find('input');
	expect(input.props().value).toEqual('hello, world');

	input.node.value = 'webb';
	input.simulate('change');

	expect(input.props().value).toEqual('hello, webb');
});
