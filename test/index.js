
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
		const handleSubmit = (ev, data) => {
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

	it('nested', function (done) {
		const value = 'world';
		const handleSubmit = (ev, data) => {
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
		const handleSubmit = (ev, data) => {
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
		const handleSubmit = (ev, data, { isValid }) => {
			try {
				assert(!isValid);
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
});
