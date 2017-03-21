/* eslint-disable react/prop-types */

import React from 'react';
import assert from 'assert';
import jsdom from 'jsdom';
import { mount } from 'enzyme';
import Form, { Input, Submit } from '../src';

describe('library', function () {
	beforeEach(() => {
		global.document = jsdom.jsdom(
			'<!doctype html><html><body></body></html>'
		);
		if (typeof window === 'undefined') {
			global.window = global.document.defaultView;
			global.navigator = global.window.navigator;
		}
	});

	it('basic', function (done) {
		const value = 'world';
		const handleSubmit = (data) => {
			try {
				assert.equal(data.hello, value);
				done();
			}
			catch (err) {
				done(err);
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

	it('`remove` field', function (done) {
		const handleSubmit = (data) => {
			try {
				assert.deepEqual(data, {});
				done();
			}
			catch (err) {
				done(err);
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
		wrapper.find(Submit).first().simulate('click');
	});

	it('nested data object', function (done) {
		const value = 'world';
		const handleSubmit = (data) => {
			try {
				assert.deepEqual(data, {
					children: { hello: value },
				});
				done();
			}
			catch (err) {
				done(err);
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
				assert.deepEqual(data.list, values);
				done();
			}
			catch (err) {
				done(err);
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
				assert(isInvalid);
				done();
			}
			catch (err) {
				done(err);
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
				assert(!isInvalid);
				done();
			}
			catch (err) {
				done(err);
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

	it('`onValid` and `onInvalid` prop', function (done) {
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
				assert(isInvalid === !data.id);
				done();
			}
			catch (err) {
				done(err);
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
				assert.equal(data.hello, value);
				done();
			}
			catch (err) {
				done(err);
			}
		};
		const wrapper = mount(
			<Form ref="form" onSubmit={handleSubmit}>
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
				assert.deepEqual(data, { b: 'b' });
			}
			catch (err) {
				done(err);
			}
		};

		const handleSubmit = (data) => {
			try {
				assert.deepEqual(data, {
					a: { b: 'b' },
					c: 'c',
				});
				done();
			}
			catch (err) {
				done(err);
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
				assert.deepEqual(data, { b: 'b' });
			}
			catch (err) {
				done(err);
			}
		};

		const handleSubmit = (data) => {
			try {
				assert.deepEqual(data, {
					c: 'c', // note
				});
				done();
			}
			catch (err) {
				done(err);
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
});
