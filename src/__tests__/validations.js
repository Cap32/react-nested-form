/* eslint-disable react/prop-types */

import React from 'react';
import { mount } from 'enzyme';
import { resetBOM } from './utils';
import Form, { Input, Submit, setGlobalErrorMessages } from '../';

beforeEach(resetBOM);

test('`required` error', function (done) {
	const handleSubmit = (data, { isInvalid, errorMessages }) => {
		try {
			expect(errorMessages).toEqual(['Required']);
			expect(isInvalid).toBe(true);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" required />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('`required` success', function (done) {
	const handleSubmit = (data, { isInvalid }) => {
		try {
			expect(isInvalid).toBe(false);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" required value="a" />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('`maximum` error', function (done) {
	const handleSubmit = (data, { isInvalid, errorMessages }) => {
		try {
			expect(errorMessages).toEqual([
				'Must less than or exactly equal to `10`'
			]);
			expect(isInvalid).toBe(true);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" maximum={10} value={11} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('`maximum` success', function (done) {
	const handleSubmit = (data, { isInvalid }) => {
		try {
			expect(isInvalid).toBe(false);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" maximum={10} value={10} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('`exclusiveMaximum` error', function (done) {
	const handleSubmit = (data, { isInvalid, errorMessages }) => {
		try {
			expect(errorMessages).toEqual([
				'Must strictly less than (not equal to) `10`'
			]);
			expect(isInvalid).toBe(true);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" exclusiveMaximum={10} value={10} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('`exclusiveMaximum` success', function (done) {
	const handleSubmit = (data, { isInvalid }) => {
		try {
			expect(isInvalid).toBe(false);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" exclusiveMaximum={10} value={9} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('`minimum` error', function (done) {
	const handleSubmit = (data, { isInvalid, errorMessages }) => {
		try {
			expect(errorMessages).toEqual([
				'Must greater than or exactly equal to `10`'
			]);
			expect(isInvalid).toBe(true);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" minimum={10} value={9} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('`minimum` success', function (done) {
	const handleSubmit = (data, { isInvalid }) => {
		try {
			expect(isInvalid).toBe(false);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" minimum={10} value={10} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('`exclusiveMinimum` error', function (done) {
	const handleSubmit = (data, { isInvalid, errorMessages }) => {
		try {
			expect(errorMessages).toEqual([
				'Must strictly greater than (not equal to) `10`'
			]);
			expect(isInvalid).toBe(true);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" exclusiveMinimum={10} value={10} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('`exclusiveMinimum` success', function (done) {
	const handleSubmit = (data, { isInvalid }) => {
		try {
			expect(isInvalid).toBe(false);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" exclusiveMinimum={10} value={11} />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('`maxLength` error', function (done) {
	const handleSubmit = (data, { isInvalid, errorMessages }) => {
		try {
			expect(errorMessages).toEqual([
				'The length of value must less than, or equal to `2`'
			]);
			expect(isInvalid).toBe(true);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" maxLength={2} value="abc" />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('`maxLength` success', function (done) {
	const handleSubmit = (data, { isInvalid }) => {
		try {
			expect(isInvalid).toBe(false);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" maxLength={2} value="ab" />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('`minLength` error', function (done) {
	const handleSubmit = (data, { isInvalid, errorMessages }) => {
		try {
			expect(errorMessages).toEqual([
				'The length of value must greater than, or equal to `2`'
			]);
			expect(isInvalid).toBe(true);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" minLength={2} value="a" />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('`minLength` success', function (done) {
	const handleSubmit = (data, { isInvalid }) => {
		try {
			expect(isInvalid).toBe(false);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" minLength={2} value="ab" />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('`pattern` error', function (done) {
	const handleSubmit = (data, { isInvalid, errorMessages }) => {
		try {
			expect(errorMessages).toEqual(['Illegal']);
			expect(isInvalid).toBe(true);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" pattern={/a/} value="b" />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('`pattern` success', function (done) {
	const handleSubmit = (data, { isInvalid }) => {
		try {
			expect(isInvalid).toBe(false);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" pattern={/a/} value="a" />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('`enum` error', function (done) {
	const handleSubmit = (data, { isInvalid, errorMessages }) => {
		try {
			expect(errorMessages).toEqual(['Must equal to one of [a, b]']);
			expect(isInvalid).toBe(true);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" enum={['a', 'b']} value="c" />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('`enum` success', function (done) {
	const handleSubmit = (data, { isInvalid }) => {
		try {
			expect(isInvalid).toBe(false);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" enum={['a', 'b']} value="a" />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});

test('`setGlobalErrorMessages`', function (done) {
	setGlobalErrorMessages({
		'required': 'required!!!',
	});
	const resetGlobalErrorMessages = () => {
		setGlobalErrorMessages({ required: 'Required' });
	};
	const handleSubmit = (data, { isInvalid, errorMessages }) => {
		try {
			expect(errorMessages).toEqual(['required!!!']);
			expect(isInvalid).toBe(true);
			resetGlobalErrorMessages();
			done();
		}
		catch (err) {
			resetGlobalErrorMessages();
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="test" required />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
});
