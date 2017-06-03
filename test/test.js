/* eslint-disable react/prop-types */

import React from 'react';
import jsdom from 'jsdom';
import { mount } from 'enzyme';
import Form, { Input, Submit, Reset } from '../src';

const resetBOM = () => {
	global.document = jsdom.jsdom(
		'<!doctype html><html><body></body></html>'
	);
	if (typeof window === 'undefined') {
		global.window = global.document.defaultView;
		global.navigator = global.window.navigator;
	}
};

describe('<NestedForm />', function () {
	beforeEach(resetBOM);

	it('basic', function (done) {
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

	it('update input value prop', function (done) {
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

	it('submit by pressed `enter` key', function (done) {
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

	it('`remove` field', function (done) {
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
				{shouldShowHello && <Input name="hello" />}
				<Submit />
			</Form>
		);
		const wrapper = mount(<App />);
		wrapper.setProps({ shouldShowHello: false });
		process.nextTick(() => {
			wrapper.find(Submit).first().simulate('click');
		});
	});

	it('nested data object', function (done) {
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

	it('array', function (done) {
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

	it('validation', function (done) {
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

	it('validation with typing', function (done) {
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

	it('`onValid` if initial state is valid', function (done) {
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


	it('`onInalid` if initial state is invalid', function (done) {
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

	it('`onValid` after typed', function (done) {
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

	it('required field', function (done) {
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

	it('reset()', function (done) {
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

	it('nested forms', function (done) {
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

	it('nested form with `name` prop', function (done) {
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

	it('click <Reset />', function (done) {
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

	it('click <Reset /> and submit', function (done) {
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
});

describe('other components', function () {
	beforeEach(resetBOM);

	it('<Input /> typing', function () {
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

});
