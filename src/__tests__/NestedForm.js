/* eslint-disable react/prop-types */

import React from 'react';
import { mount } from 'enzyme';
import { resetBOM } from './utils';
import Form, { Input, Submit, Reset } from '../';

beforeEach(resetBOM);

test('basic', function (done) {
	const value = 'world';
	const handleSubmit = (data) => {
		try {
			expect(data.hello).toBe(value);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const App = () => (
		<Form onSubmit={handleSubmit}>
			<Input name="hello" />
			<Submit />
		</Form>
	);
	const wrapper = mount(<App />);
	const input = wrapper.find('input').first();
	input.node.value = value;
	input.simulate('change');
	wrapper.find(Submit).first().simulate('click');
});

test('update input value prop', function (done) {
	const value = 'world';
	const handleSubmit = (data) => {
		try {
			expect(data.hello).toBe(value);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const App = ({ value }) => (
		<Form onSubmit={handleSubmit}>
			<Input name="hello" value={value} />
			<Submit />
		</Form>
	);
	const wrapper = mount(<App />);
	wrapper.setProps({ value });
	process.nextTick(() => {
		wrapper.find(Submit).first().simulate('click');
	});
});

test('submit by pressed `enter` key', function (done) {
	const value = 'world';
	const handleSubmit = (data) => {
		try {
			expect(data.hello).toBe(value);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const App = () => (
		<Form onSubmit={handleSubmit}>
			<Input name="hello" />
		</Form>
	);
	const wrapper = mount(<App />);
	const input = wrapper.find('input').first();
	input.node.value = value;
	input.simulate('change');
	input.simulate('keyPress', { key: 'Enter' });
});

test('`remove` field', function (done) {
	const handleSubmit = (data) => {
		try {
			expect(data).toEqual({});
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const App = ({ shouldShowHello = true }) => (
		<Form onSubmit={handleSubmit}>
			{shouldShowHello && <Input name="hello" value="hello" />}
			<Submit />
		</Form>
	);
	const wrapper = mount(<App />);
	wrapper.setProps({ shouldShowHello: false });
	process.nextTick(() => {
		wrapper.find(Submit).first().simulate('click');
	});
});

test('nested data object', function (done) {
	const value = 'world';
	const handleSubmit = (data) => {
		try {
			expect(data).toEqual({
				children: { hello: value },
			});
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const App = () => (
		<Form onSubmit={handleSubmit}>
			<Form name="children">
				<Input name="hello" defaultValue={value} />
				<Submit />
			</Form>
		</Form>
	);
	const wrapper = mount(<App />);
	wrapper.find(Submit).first().simulate('click');
});

test('array', function (done) {
	const values = ['hello', 'world'];
	const handleSubmit = (data) => {
		try {
			expect(data.list).toEqual(values);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const App = () => (
		<Form onSubmit={handleSubmit}>
			<Input name="list[]" defaultValue={values[0]} />
			<Input name="list[]" defaultValue={values[1]} />
			<Submit />
		</Form>
	);
	const wrapper = mount(<App />);
	wrapper.find(Submit).first().simulate('click');
});

test('should ignore empty fields', function (done) {
	const handleSubmit = (data) => {
		try {
			expect(data).toEqual({});
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const App = () => (
		<Form onSubmit={handleSubmit}>
			<Input name="hello" />
			<Submit />
		</Form>
	);
	const wrapper = mount(<App />);
	wrapper.find(Submit).first().simulate('click');
});

test('validation', function (done) {
	const handleSubmit = (data, { isInvalid }) => {
		try {
			expect(isInvalid).toBe(true);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const App = () => (
		<Form onSubmit={handleSubmit}>
			<Input
				name="numbers"
				defaultValue="hello"
				validations={[
					{
						validator: (val) => /^\d*$/.test(val),
						message: 'Not a number.',
					},
				]}
			/>
			<Submit />
		</Form>
	);
	const wrapper = mount(<App />);
	wrapper.find(Submit).first().simulate('click');
});

test('validation with typing', function (done) {
	const handleSubmit = (data, { isInvalid }) => {
		try {
			expect(isInvalid).toBe(false);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const App = () => (
		<Form onSubmit={handleSubmit}>
			<Input
				name="numbers"
				defaultValue="hello"
				validations={[
					{
						validator: (val) => /^\d*$/.test(val),
						message: 'Not a number.',
					},
				]}
			/>
			<Submit />
		</Form>
	);
	const wrapper = mount(<App />);
	const input = wrapper.find('input').first();
	input.node.value = '666666';
	input.simulate('change');
	wrapper.find(Submit).first().simulate('click');
});

test('`onValid` if initial state is valid', function (done) {
	mount(
		<Form onValid={done}>
			<Input
				name="numbers"
				defaultValue="23333"
				validations={[
					{
						validator: (val) => /^\d*$/.test(val),
						message: 'Not a number.',
					},
				]}
			/>
			<Submit />
		</Form>
	);
});


test('`onInalid` if initial state is invalid', function (done) {
	mount(
		<Form onValid={done}>
			<Input
				name="numbers"
				defaultValue="hello"
				validations={[
					{
						validator: (val) => /^\d*$/.test(val),
						message: 'Not a number.',
					},
				]}
			/>
			<Submit />
		</Form>
	);
});

test('`onValid` after typed', function (done) {
	let hasCallInvalid = false;

	const handleValid = () => {
		hasCallInvalid && done();
	};

	const handleInvalid = () => {
		hasCallInvalid = true;
	};

	const wrapper = mount(
		<Form onValid={handleValid} onInvalid={handleInvalid}>
			<Input
				name="numbers"
				defaultValue="hello"
				validations={[
					{
						validator: (val) => /^\d*$/.test(val),
						message: 'Not a number.',
					},
				]}
			/>
			<Submit />
		</Form>
	);
	const input = wrapper.find('input').first();
	input.node.value = '666666';
	input.simulate('change');
});

test('required field', function (done) {
	const handleSubmit = (data, { isInvalid }) => {
		try {
			expect(isInvalid).toBe(!data.id);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const App = () => (
		<Form onSubmit={handleSubmit}>
			<Input
				name="id"
				required
			/>
			<Submit />
		</Form>
	);
	const wrapper = mount(<App />);

	wrapper.find(Submit).first().simulate('click');
});

test('reset()', function (done) {
	const value = 'world';
	const handleSubmit = (data) => {
		try {
			expect(data.hello).toEqual(value);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="hello" defaultValue={value} />
			<Submit />
		</Form>
	);
	const input = wrapper.find('input').first();
	input.node.value = 'updated';
	input.simulate('change');
	const instance = wrapper.instance();
	instance.reset();
	wrapper.find(Submit).first().simulate('click');
});

test('nested forms', function (done) {
	const handleSubFormSubmit = (data, state) => {
		try {
			state.stopPropagation();
			expect(data).toEqual({ b: 'b' });
		}
		catch (err) {
			done.fail(err);
		}
	};

	const handleSubmit = (data) => {
		try {
			expect(data).toEqual({
				a: { b: 'b' },
				c: 'c',
			});
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};

	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Form name="a" onSubmit={handleSubFormSubmit}>
				<Input name="b" defaultValue="b" />
				<Submit />
			</Form>
			<Input name="c" defaultValue="c" />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
	wrapper.find(Submit).last().simulate('click');
});

test('nested form with `name` prop', function (done) {
	const handleSubFormSubmit = (data, state) => {
		try {
			state.stopPropagation();
			expect(data).toEqual({ b: 'b' });
		}
		catch (err) {
			done.fail(err);
		}
	};

	const handleSubmit = (data) => {
		try {
			expect(data).toEqual({
				c: 'c', // notice
			});
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};

	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Form onSubmit={handleSubFormSubmit}> {/* no `name` */}
				<Input name="b" defaultValue="b" />
				<Submit />
			</Form>
			<Input name="c" defaultValue="c" />
			<Submit />
		</Form>
	);
	wrapper.find(Submit).first().simulate('click');
	wrapper.find(Submit).last().simulate('click');
});

test('click <Reset />', function (done) {
	const wrapper = mount(
		<Form>
			<Input name="hello" />
			<Reset />
			<Submit />
		</Form>
	);
	const input = wrapper.find('input').first();
	input.node.value = 'updated';
	input.simulate('change');
	expect(input.node.value).toBe('updated');
	wrapper.find(Reset).first().simulate('click');

	process.nextTick(() => {
		try {
			expect(input.node.value).toBe('');
			done();
		}
		catch (err) {
			done.fail(err);
		}
	});
});

test('click <Reset /> and submit', function (done) {
	const value = 'world';
	const handleSubmit = (data) => {
		try {
			expect(data.hello).toEqual(value);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="hello" defaultValue={value} />
			<Reset />
			<Submit />
		</Form>
	);
	const input = wrapper.find('input').first();
	input.node.value = 'updated';
	input.simulate('change');
	wrapper.find(Reset).first().simulate('click');
	wrapper.find(Submit).first().simulate('click');
});
