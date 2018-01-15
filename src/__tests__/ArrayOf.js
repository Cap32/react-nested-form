/* eslint-disable react/prop-types */

import React from 'react';
import { resetBOM } from './utils';
import { mount } from 'enzyme';
import Form, { ArrayOf, Input } from '../';

beforeEach(resetBOM);

test('should work', async () => {
	const value = ['a', 'b'];
	const handleSubmit = jest.fn();
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<ArrayOf
				name="array"
				value={value}
				render={(items) =>
					items.map(({ value, key, name }) => (
						<Input name={name} value={value} key={key} />
					))
				}
			/>
		</Form>
	);
	wrapper
		.find(Form)
		.get(0)
		.submit();
	const data = handleSubmit.mock.calls[0][0];
	expect(data.array).toEqual(value);
});

test('should work with object', async () => {
	const value = [
		{ hello: 'HELLO', world: 'WORLD' },
		{ hello: '你好', world: '师姐' },
	];
	const handleSubmit = jest.fn();
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<ArrayOf
				name="array"
				value={value}
				render={(items) =>
					items.map(({ value, key, name }) => (
						<Form name={name} key={key}>
							<Input name="hello" value={value.hello} />
							<Input name="world" value={value.world} />
						</Form>
					))
				}
			/>
		</Form>
	);
	wrapper
		.find(Form)
		.get(0)
		.submit();
	const data = handleSubmit.mock.calls[0][0];
	expect(data.array).toEqual(value);
});

test('should work after value changed', async () => {
	const value = ['a', 'b'];
	const handleSubmit = jest.fn();
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<ArrayOf
				name="array"
				value={value}
				render={(items) =>
					items.map(({ value, key, name }) => (
						<Input name={name} value={value} key={key} />
					))
				}
			/>
		</Form>
	);
	const input = wrapper.find('input').first();
	input.node.value = 'c';
	input.simulate('change');
	wrapper
		.find(Form)
		.get(0)
		.submit();
	const data = handleSubmit.mock.calls[0][0];
	expect(data.array).toEqual(['c', 'b']);
});

test('should `push` work', async () => {
	const value = ['a', 'b'];
	const handleSubmit = jest.fn();
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<ArrayOf
				name="array"
				value={value}
				render={(items, instance) => (
					<div>
						{items.map(({ value, key, name }) => (
							<Input name={name} value={value} key={key} />
						))}
						<span onClick={() => instance.push('c')} />
					</div>
				)}
			/>
		</Form>
	);
	wrapper
		.find('span')
		.first()
		.simulate('click');
	wrapper
		.find(Form)
		.get(0)
		.submit();
	const data = handleSubmit.mock.calls[0][0];
	expect(data.array).toEqual(['a', 'b', 'c']);
});

test('should `push` work if defaults to empty array', async () => {
	const value = [];
	const handleSubmit = jest.fn();
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<ArrayOf
				name="array"
				value={value}
				render={(items, instance) => (
					<div>
						{items.map(({ value, key, name }) => (
							<Input name={name} value={value} key={key} />
						))}
						<span onClick={() => instance.push('c')} />
					</div>
				)}
			/>
		</Form>
	);
	wrapper
		.find('span')
		.first()
		.simulate('click');
	wrapper
		.find(Form)
		.get(0)
		.submit();
	const data = handleSubmit.mock.calls[0][0];
	expect(data.array).toEqual(['c']);
});

test('should `pop` work', async () => {
	const value = ['a', 'b'];
	const handleSubmit = jest.fn();
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<ArrayOf
				name="array"
				value={value}
				render={(items, instance) => (
					<div>
						{items.map(({ value, key, name }) => (
							<Input name={name} value={value} key={key} />
						))}
						<span onClick={instance.pop} />
					</div>
				)}
			/>
		</Form>
	);
	wrapper
		.find('span')
		.first()
		.simulate('click');
	wrapper
		.find(Form)
		.get(0)
		.submit();
	const data = handleSubmit.mock.calls[0][0];
	expect(data.array).toEqual(['a']);
});

test('should `shift` work', async () => {
	const value = ['a', 'b'];
	const handleSubmit = jest.fn();
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<ArrayOf
				name="array"
				value={value}
				render={(items, instance) => (
					<div>
						{items.map(({ value, key, name }) => (
							<Input name={name} value={value} key={key} />
						))}
						<span onClick={instance.shift} />
					</div>
				)}
			/>
		</Form>
	);
	wrapper
		.find('span')
		.first()
		.simulate('click');
	wrapper
		.find(Form)
		.get(0)
		.submit();
	const data = handleSubmit.mock.calls[0][0];
	expect(data.array).toEqual(['b']);
});

test('should `unshift` work', async () => {
	const value = ['a', 'b'];
	const handleSubmit = jest.fn();
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<ArrayOf
				name="array"
				value={value}
				render={(items, instance) => (
					<div>
						{items.map(({ value, key, name }) => (
							<Input name={name} value={value} key={key} />
						))}
						<span onClick={() => instance.unshift('c')} />
					</div>
				)}
			/>
		</Form>
	);
	wrapper
		.find('span')
		.first()
		.simulate('click');
	wrapper
		.find(Form)
		.get(0)
		.submit();
	const data = handleSubmit.mock.calls[0][0];
	expect(data.array).toEqual(['c', 'a', 'b']);
});

test('should `splice` work', async () => {
	const value = ['a', 'b', 'c'];
	const handleSubmit = jest.fn();
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<ArrayOf
				name="array"
				value={value}
				render={(items, instance) => (
					<div>
						{items.map(({ value, key, name }) => (
							<Input name={name} value={value} key={key} />
						))}
						<span onClick={() => instance.splice(1, 2, 'd', 'e')} />
					</div>
				)}
			/>
		</Form>
	);
	wrapper
		.find('span')
		.first()
		.simulate('click');
	wrapper
		.find(Form)
		.get(0)
		.submit();
	const data = handleSubmit.mock.calls[0][0];
	expect(data.array).toEqual(['a', 'd', 'e']);
});

test('should `dropAll` work', async () => {
	const value = ['a', 'b'];
	const handleSubmit = jest.fn();
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<ArrayOf
				name="array"
				value={value}
				render={(items, instance) => (
					<div>
						{items.map(({ value, key, name }) => (
							<Input name={name} value={value} key={key} />
						))}
						<span onClick={instance.dropAll} />
					</div>
				)}
			/>
		</Form>
	);
	wrapper
		.find('span')
		.first()
		.simulate('click');
	wrapper
		.find(Form)
		.get(0)
		.submit();
	const data = handleSubmit.mock.calls[0][0];
	expect(data.array).toEqual([]);
});

test('should value be an empty array if pristine value is an empty array', async () => {
	const handleSubmit = jest.fn();
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<ArrayOf
				name="array"
				value={[]}
				render={(items) => (
					<div>
						{items.map(({ value, key, name }) => (
							<Input name={name} value={value} key={key} />
						))}
					</div>
				)}
			/>
		</Form>
	);
	wrapper
		.find(Form)
		.get(0)
		.submit();
	const data = handleSubmit.mock.calls[0][0];
	expect(data.array).toEqual([]);
});
test('should ignore value if pristine value is undefined', async () => {
	const handleSubmit = jest.fn();
	const wrapper = mount(
		<Form onSubmit={handleSubmit}>
			<ArrayOf
				name="array"
				render={(items) => (
					<div>
						{items.map(({ value, key, name }) => (
							<Input name={name} value={value} key={key} />
						))}
					</div>
				)}
			/>
		</Form>
	);
	wrapper
		.find(Form)
		.get(0)
		.submit();
	const data = handleSubmit.mock.calls[0][0];
	expect(typeof data.array).toBe('undefined');
});
