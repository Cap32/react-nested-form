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
			<Input name="hello" defaultValue="" />
			<Submit />
		</Form>
	);
	const wrapper = mount(<App />);
	const input = wrapper.find('input').first();
	input.node.value = value;
	input.simulate('change');
	wrapper
		.find(Submit)
		.first()
		.simulate('click');
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
	const wrapper = mount(<App value="" />);
	wrapper
		.setProps({ value })
		.find(Submit)
		.first()
		.simulate('click');
});

test('update multi values', function (done) {
	const foo = 'foo';
	const bar = 'bar';
	const handleSubmit = (data) => {
		try {
			expect(data.foo).toBe(foo);
			expect(data.bar).toBe(bar);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const App = ({ foo, bar }) => (
		<Form onSubmit={handleSubmit}>
			<Input name="foo" value={foo} />
			<Input name="bar" value={bar} />
			<Submit />
		</Form>
	);
	const wrapper = mount(<App foo="" bar="" />);
	wrapper
		.setProps({ foo })
		.setProps({ bar })
		.find(Submit)
		.first()
		.simulate('click');
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
			<Input name="hello" defaultValue="" />
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
		wrapper
			.find(Submit)
			.first()
			.simulate('click');
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
	wrapper
		.find(Submit)
		.first()
		.simulate('click');
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
	wrapper
		.find(Submit)
		.first()
		.simulate('click');
});

test('should ignore empty fields if pristine value is empty', function (done) {
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
			<Input name="hello" defaultValue="" />
			<Submit />
		</Form>
	);
	const wrapper = mount(<App />);
	wrapper
		.find(Submit)
		.first()
		.simulate('click');
});

test('format empty value', function (done) {
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
	const App = () => (
		<Form onSubmit={handleSubmit}>
			<Input name="hello" formatEmptyValue={() => value} />
			<Submit />
		</Form>
	);
	const wrapper = mount(<App />);
	wrapper
		.find(Submit)
		.first()
		.simulate('click');
});

test('should not ignore empty fields if pristine value is not empty', function (done) {
	const handleSubmit = (data) => {
		try {
			expect(data).toEqual({ hello: '' });
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const App = () => (
		<Form onSubmit={handleSubmit}>
			<Input name="hello" value="hello" />
			<Submit />
		</Form>
	);
	const wrapper = mount(<App />);
	const input = wrapper.find('input').first();
	input.node.value = '';
	input.simulate('change');
	wrapper
		.find(Submit)
		.first()
		.simulate('click');
});

test('should not ignore empty fields if required', function (done) {
	const handleSubmit = (data) => {
		try {
			expect(data).toEqual({ hello: '' });
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const App = () => (
		<Form onSubmit={handleSubmit}>
			<Input name="hello" defaultValue="" required />
			<Submit />
		</Form>
	);
	const wrapper = mount(<App />);
	const input = wrapper.find('input').first();
	input.node.value = 'world';
	input.simulate('change');
	input.node.value = '';
	input.simulate('change');
	wrapper
		.find(Submit)
		.first()
		.simulate('click');
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
	wrapper
		.find(Submit)
		.first()
		.simulate('click');
});

test('validation after typed', function (done) {
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
	wrapper
		.find(Submit)
		.first()
		.simulate('click');
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
		</Form>,
	);
});

test('`onInalid` if initial state is invalid', function (done) {
	mount(
		<Form onInvalid={done}>
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
		</Form>,
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
		</Form>,
	);
	const input = wrapper.find('input').first();
	input.node.value = '666666';
	input.simulate('change');
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
		</Form>,
	);
	const input = wrapper.find('input').first();
	input.node.value = 'updated';
	input.simulate('change');
	const instance = wrapper.instance();
	instance.reset();
	wrapper
		.find(Submit)
		.first()
		.simulate('click');
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
		</Form>,
	);
	wrapper
		.find(Submit)
		.first()
		.simulate('click');
	wrapper
		.find(Submit)
		.last()
		.simulate('click');
});

test('should ignore nested form if no `name` prop', function (done) {
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
			expect(data).toEqual({ c: 'c' }); // notice
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};

	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Form onSubmit={handleSubFormSubmit}>
				{' '}
				{/* no `name` */}
				<Input name="b" defaultValue="b" />
				<Submit />
			</Form>
			<Input name="c" defaultValue="c" />
			<Submit />
		</Form>,
	);
	wrapper
		.find(Submit)
		.first()
		.simulate('click');
	wrapper
		.find(Submit)
		.last()
		.simulate('click');
});

test('`onReset()` prop', function (done) {
	const value = 'world';
	const handleReset = (data) => {
		try {
			expect(data.hello).toEqual(value);
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onReset={handleReset}>
			<Input name="hello" value={value} />
			<Reset />
		</Form>,
	);
	const input = wrapper.find('input').first();
	input.node.value = 'updated';
	input.simulate('change');
	expect(input.node.value).toBe('updated');
	wrapper
		.find(Reset)
		.first()
		.simulate('click');
});

test('`onReset()` if original props are empty', function (done) {
	const handleSubmit = (data) => {
		try {
			expect(typeof data.foo).toBe('undefined');
			expect(typeof data.bar).toBe('undefined');
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<Input name="foo" defaultValue="" />
			<Input name="bar" defaultValue="" />
			<Submit />
		</Form>,
	);
	const first = wrapper.find('input').first();
	first.node.value = 'updated';
	first.simulate('change');
	const last = wrapper.find('input').last();
	last.node.value = 'updated';
	last.simulate('change');
	const instance = wrapper.instance();
	instance.reset();
	wrapper
		.find(Submit)
		.first()
		.simulate('click');
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
		</Form>,
	);
	const input = wrapper.find('input').first();
	input.node.value = 'updated';
	input.simulate('change');
	wrapper
		.find(Reset)
		.first()
		.simulate('click');
	wrapper
		.find(Submit)
		.first()
		.simulate('click');
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
	const toNumber = (data) => {
		return {
			...data,
			hello: parseInt(data.hello, 10),
		};
	};
	const wrapper = mount(
		<Form onSubmit={handleSubmit} outputFilter={toNumber}>
			<Input name="hello" defaultValue={value} />
			<Submit />
		</Form>,
	);
	wrapper
		.find(Submit)
		.first()
		.simulate('click');
});

test('should work after submitted and changed', function (done) {
	let submitCounter = 0;
	const handleSubmit = (data) => {
		if (submitCounter === 0) {
			expect(data.hello).toBe('1');
			submitCounter++;
		}
		else {
			expect(data.hello).toBe('2');
			done();
		}
	};
	const App = () => (
		<Form onSubmit={handleSubmit}>
			<Input name="hello" defaultValue="" />
			<Submit />
		</Form>
	);
	const wrapper = mount(<App />);
	const input = wrapper.find('input').first();
	input.node.value = '1';
	input.simulate('change');
	wrapper
		.find(Submit)
		.first()
		.simulate('click');
	input.node.value = '2';
	input.simulate('change');
	wrapper
		.find(Submit)
		.first()
		.simulate('click');
});

test('should `isPristine` be `false` after submitted', function (done) {
	const wrapper = mount(
		<Form>
			<Input name="hello" value="world" />
			<Submit />
		</Form>,
	);
	const input = wrapper.find('Input').first();
	expect(input.props().nest.isPristine).toBe(true);
	wrapper
		.find(Submit)
		.first()
		.simulate('click');
	process.nextTick(() => {
		expect(input.props().nest.isPristine).toBe(false);
		done();
	});
});

test('should ignore empty fields with outputFilter', function (done) {
	const handleSubmit = (data) => {
		try {
			expect(data).toEqual({});
			done();
		}
		catch (err) {
			done.fail(err);
		}
	};
	const outputFilter = () => {};
	const App = () => (
		<Form onSubmit={handleSubmit}>
			<Input name="hello" value="world" outputFilter={outputFilter} />
			<Submit />
		</Form>
	);
	const wrapper = mount(<App />);
	wrapper
		.find(Submit)
		.first()
		.simulate('click');
});

test('should `onChange` work', async () => {
	const handleChange = jest.fn();
	const wrapper = mount(
		<Form onChange={handleChange}>
			<Input name="test" defaultValue="hello" />
		</Form>,
	);
	const input = wrapper.find('input').first();
	input.node.value = 'world';
	input.simulate('change');
	const value = handleChange.mock.calls[1][0];
	expect(value).toEqual({ test: 'world' });
});

test('should nested `onChange` work', async () => {
	const handleChange = jest.fn();
	const handleNestedChange = jest.fn();
	const wrapper = mount(
		<Form onChange={handleChange}>
			<Form name="nested" onChange={handleNestedChange}>
				<Input name="test" defaultValue="hello" />
			</Form>
		</Form>,
	);
	const input = wrapper.find('input').first();
	input.node.value = 'world';
	input.simulate('change');
	const value = handleChange.mock.calls[2][0];
	expect(value).toEqual({ nested: { test: 'world' } });
	const nestedValue = handleNestedChange.mock.calls[1][0];
	expect(nestedValue).toEqual({ test: 'world' });
});
