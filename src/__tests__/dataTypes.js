/* eslint-disable react/prop-types */

import React from 'react';
import { mount } from 'enzyme';
import { resetBOM } from './utils';
import Form, { Input, Submit } from '../';

beforeEach(resetBOM);

test('dataType="integer"', function (done) {
	const value = 32;
	const handleSubmit = (data) => {
		try {
			expect(data.test).toBe(value);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" dataType="integer" defaultValue={`${value}`} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('dataType="integer" when value is empty string', function () {
	const wrapper = mount(
		<Form>
			<Input name="test" dataType="integer" value="" />
		</Form>
	);
	expect(typeof wrapper.find('input').prop('value')).toBe('number');
});

test('dataType="long"', function (done) {
	const value = 32;
	const handleSubmit = (data) => {
		try {
			expect(data.test).toBe(value);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" dataType="long" defaultValue={`${value}`} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('dataType="float"', function (done) {
	const value = 3.2;
	const handleSubmit = (data) => {
		try {
			expect(data.test).toBe(value);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" dataType="float" defaultValue={`${value}`} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('dataType="double"', function (done) {
	const value = 3.2;
	const handleSubmit = (data) => {
		try {
			expect(data.test).toBe(value);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" dataType="double" defaultValue={`${value}`} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('dataType="string"', function (done) {
	const value = '32';
	const handleSubmit = (data) => {
		try {
			expect(data.test).toBe(value);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" dataType="string" defaultValue={+value} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('dataType="byte"', function (done) {
	const value = 'bWFudXRk';
	const handleSubmit = (data) => {
		try {
			expect(data.test).toBe(value);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" dataType="byte" defaultValue={value} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('dataType="boolean"', function (done) {
	const handleSubmit = (data) => {
		try {
			expect(data.test).toBe(false);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" dataType="boolean" defaultValue={0} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('dataType="date" from date object', function (done) {
	const date = new Date();
	const value = date.toISOString().split('T')[0];
	const handleSubmit = (data) => {
		try {
			expect(data.test).toBe(value);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" dataType="date" defaultValue={date} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('dataType="date" from date string', function (done) {
	const date = new Date();
	const value = date.toISOString().split('T')[0];
	const handleSubmit = (data) => {
		try {
			expect(data.test).toBe(value);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" dataType="date" defaultValue={date.toISOString()} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('dataType="date" from timestamp', function (done) {
	const date = new Date();
	const value = date.toISOString().split('T')[0];
	const handleSubmit = (data) => {
		try {
			expect(data.test).toBe(value);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" dataType="date" defaultValue={date.getTime()} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('dataType="dateTime" from date object', function (done) {
	const date = new Date();
	const value = date.toISOString();
	const handleSubmit = (data) => {
		try {
			expect(data.test).toBe(value);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" dataType="dateTime" defaultValue={date} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('dataType="dateTime" from date string', function (done) {
	const date = new Date();
	const value = date.toISOString();
	const handleSubmit = (data) => {
		try {
			expect(data.test).toBe(value);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" dataType="dateTime" defaultValue={date.toISOString()} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('dataType="dateTime" from timestamp', function (done) {
	const date = new Date();
	const value = date.toISOString();
	const handleSubmit = (data) => {
		try {
			expect(data.test).toBe(value);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" dataType="dateTime" defaultValue={date.getTime()} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('dataType="password"', function (done) {
	const value = '32';
	const handleSubmit = (data) => {
		try {
			expect(data.test).toBe(value);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" dataType="password" defaultValue={+value} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('dataType={customFunction}', function (done) {
	const customFunction = (val) => !!val;
	const handleSubmit = (data) => {
		try {
			expect(data.test).toBe(true);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" dataType={customFunction} defaultValue="test" />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});
