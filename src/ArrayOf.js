
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import nestify from './nestify';
import NestedForm from './NestedForm';
import { isUndefined, isFunction } from './utils';
import warning from 'warning';

@nestify({}, {
	defaultProps: {
		shouldIgnore(value = [], pristineValue) {
			return !value.length && isUndefined(pristineValue);
		},
	},
	withRef: true,
	hoistMethods: ['dropAll', 'dropByKey', 'push', 'pop', 'shift', 'unshift', 'splice'],
})
export default class ArrayOf extends Component {
	static propTypes = {
		name: PropTypes.string,
		nest: PropTypes.object,
		value: PropTypes.any,
		render: PropTypes.func,
	};

	_keyIndex = 0;

	componentWillMount() {
		const { nest, nest: { value: values } } = this.props;
		let items = [];
		if (isUndefined(values)) {
			items = [];
			nest.setValue([]);
		}
		else if (isFunction(values.map)) {
			items = values.map(this._createItem);
			this._appendName(items);
		}
		else {
			warning(false, '[ArrayOf]: value should be array, but received', values);
		}
		this._items = items;
	}

	_appendName(items) {
		return items.forEach((item, index) => {
			item.name = `${this.props.name}[${index}]`;
		});
	}

	_createItem = (value) => {
		return {
			value,
			key: ++this._keyIndex,
		};
	};

	dropAll = () => {
		this._items.length = 0;
		this._updateValue();
	};

	dropByKey = (key) => {
		let index = -1;
		for (let i = 0; i < this._items.length; i++) {
			const item = this._items[i];
			if (item.key === key) {
				index = i;
				break;
			}
		}
		if (index > -1) {
			this._items.splice(index, 1);
			this._updateValue();
		}
	};

	push = (...values) => {
		this._items.push(...values.map(this._createItem));
		this._updateValue();
		return this._items.length;
	};

	unshift = (...values) => {
		this._items.unshift(...values.map(this._createItem));
		this._updateValue();
		return this._items.length;
	};

	pop = () => {
		this._items.pop();
		this._updateValue();
		return this._items.length;
	};

	shift = () => {
		const item = this._items.shift();
		this._updateValue();
		return item;
	};

	splice = (start, deleteCount, ...arr) => {
		const arrItems = arr.map(this._createItem);
		const removed = this._items.splice(start, deleteCount, ...arrItems);
		this._updateValue();
		return removed;
	};

	_updateValue = () => {
		this._appendName(this._items);
		this.forceUpdate(() => {
			this._form.submit(this._setData);
		});
	};

	_setData = (data) => {
		const { name, nest } = this.props;
		nest.setValue(data[name] || []);
	}

	render() {
		const { render, name, value, nest, ...other } = this.props;
		return (
			<NestedForm
				{...other}
				ref={(form) => (this._form = form)}
				onChange={this._setData}
			>
				{render(this._items, this)}
			</NestedForm>
		);
	}
}
