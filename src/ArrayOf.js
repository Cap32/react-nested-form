
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import nestify from './nestify';
import NestedForm from './NestedForm';
import { isUndefined } from './utils';

@nestify({}, {
	shouldIgnore(value = [], pristineValue) {
		return !value.length && isUndefined(pristineValue);
	},
})
export default class ArrayOf extends Component {
	static propTypes = {
		name: PropTypes.string,
		nest: PropTypes.object,
		value: PropTypes.array,
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
		else {
			items = values.map(this._createItem);
			this._appendName(items);
		}
		this._items = this._createEnhancedArray(items);
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

	_createEnhancedArray = (items) => {
		items.dropAll = () => {
			items.length = 0;
			this._updateValue();
		};

		items.dropByKey = (key) => {
			let index = -1;
			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				if (item.key === key) {
					index = i;
					break;
				}
			}
			if (index > -1) {
				items.splice(index, 1);
				this._updateValue();
			}
		};

		items.pushValue = (...values) => {
			items.push(...values.map(this._createItem));
			this._updateValue();
			return items.length;
		};

		items.unshiftValue = (...values) => {
			items.unshift(...values.map(this._createItem));
			this._updateValue();
			return items.length;
		};

		items.popValue = () => {
			items.pop();
			this._updateValue();
			return items.length;
		};

		items.shiftValue = () => {
			const item = items.shift();
			this._updateValue();
			return item;
		};

		items.spliceValue = (start, deleteCount, ...arr) => {
			const arrItems = arr.map(this._createItem);
			const removed = items.splice(start, deleteCount, ...arrItems);
			this._updateValue();
			return removed;
		};

		return items;
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
		const { render } = this.props;
		return (
			<NestedForm
				ref={(form) => (this._form = form)}
				onRenew={this._setData}
			>
				{render(this._items)}
			</NestedForm>
		);
	}
}
