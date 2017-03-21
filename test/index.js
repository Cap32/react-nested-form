/* eslint-disable react/prop-types */

import React from 'react';
import assert from 'assert';
import jsdom from 'jsdom';
import { mount } from 'enzyme';
import Form, { Input } from '../src';

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
				<button type="submit" />
			</Form>
		);
		const wrapper = mount(<App />);
		const input = wrapper.find('input');
		input.node.value = value;
		input.simulate('change');
		wrapper.find('[type="submit"]').get(0).click();
	});

	it('remove field', function (done) {
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
				<button type="submit" />
			</Form>
		);
		const wrapper = mount(<App />);
		wrapper.setProps({ shouldShowHello: false });
		wrapper.find('[type="submit"]').get(0).click();
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
					<button type="submit" />
				</Form>
			</Form>
		);
		const wrapper = mount(<App />);
		wrapper.find('[type="submit"]').get(0).click();
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
				<button type="submit" />
			</Form>
		);
		const wrapper = mount(<App />);
		wrapper.find('[type="submit"]').get(0).click();
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
				<button type="submit" />
			</Form>
		);
		const wrapper = mount(<App />);
		wrapper.find('[type="submit"]').get(0).click();
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
				<button type="submit" />
			</Form>
		);
		const wrapper = mount(<App />);
		const input = wrapper.find('input');
		input.node.value = '666666';
		input.simulate('change');
		wrapper.find('[type="submit"]').get(0).click();
	});

	it('nested validation', function (done) {
		const handleSubmit = (data, { isInvalid }) => {
			try {
				assert.equal(!isInvalid, data.a === 'a' && data.b.c === 'c');
				done();
			}
			catch (err) {
				done(err);
			}
		};
		const App = () => (
			<Form onSubmit={handleSubmit}>
				<Input
					name="a"
					defaultValue="a"
					validations={[
						{
							validator: (a) => a === 'a',
							message: 'Not "a".',
						},
					]}
				/>
				<Form name="b">
					<Input
						name="c"
						defaultValue="c"
						validations={[
							{
								validator: (c) => c === 'c',
								message: 'Not "c".',
							},
						]}
					/>
				</Form>
				<button type="submit" />
			</Form>
		);
		const wrapper = mount(<App />);
		wrapper.find('[type="submit"]').get(0).click();
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
				<button type="submit" />
			</Form>
		);
		const wrapper = mount(<App />);
		wrapper.find('[type="submit"]').get(0).click();
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
				<button type="submit" />
			</Form>
		);
		const input = wrapper.find('input');
		input.node.value = 'updated';
		input.simulate('change');
		const instance = wrapper.instance();
		instance.reset();
		wrapper.find('[type="submit"]').get(0).click();
	});

	// it('setAsPristine()', function (done) {
	// 	const value = 'world';
	// 	const handleSubmit = (data) => {
	// 		try {
	// 			assert.equal(data.hello, value);
	// 			done();
	// 		}
	// 		catch (err) {
	// 			done(err);
	// 		}
	// 	};
	// 	const wrapper = mount(
	// 		<Form ref="form" onSubmit={handleSubmit}>
	// 			<Input name="hello" defaultValue={value} />
	// 			<button type="submit" />
	// 		</Form>
	// 	);
	// 	const input = wrapper.find('input');
	// 	input.node.value = 'updated';
	// 	input.simulate('change');
	// 	const instance = wrapper.instance();
	// 	instance.setAsPristine();
	// 	wrapper.find('[type="submit"]').get(0).click();
	// });
});
