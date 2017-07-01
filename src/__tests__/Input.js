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

test('inputFilter', function () {
	const value = '1';
	const double = (n) => n * 2;
	const wrapper = mount(
		<Form>
			<Input name="n" defaultValue={value} inputFilter={double} />
		</Form>
	);
	const inputValue = wrapper.find('input').props().value;
	expect(inputValue).toBe(1 * 2);
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
	expect(input.props().value).toBe('hello, world');
	input.node.value = 'webb';
	input.simulate('change');
	expect(input.props().value).toBe('hello, webb');
});

test('multi inputFilters', function () {
	const value = '1';
	const double = (n) => n * 2;
	const triple = (n) => n * 3;
	const wrapper = mount(
		<Form>
			<Input name="n" defaultValue={value} inputFilter={[double, triple]} />
		</Form>
	);
	const inputValue = wrapper.find('input').props().value;
	expect(inputValue).toBe(1 * 2 * 3);
});

test('multi outputFilters', function (done) {
	const value = '1';

	const handleSubmit = (data) => {
		try {
			expect(data.n).toBe(1 * 2 * 3);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const double = (n) => n * 2;
	const triple = (n) => n * 3;
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="n" defaultValue={value} outputFilter={[double, triple]} />
		</Form>
	);
	wrapper.find(Form).get(0).submit();
});
