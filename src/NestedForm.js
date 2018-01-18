import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { emptyFunction, returnsArgument } from 'empty-functions';
import warning from 'warning';
import { CONTEXT_NAME } from './constants';
import {
	ValidationPropType,
	ComponentPropType,
	isValidChild,
	FilterPropType,
	isFunction,
} from './utils';
import { getOutput } from './Mixins';

const parseName = (name = '') => {
	const regExp = /\[(\d*)\]$/;
	let isArray = false;
	let index = -1;
	name = (name + '').replace(regExp, (m, i) => {
		isArray = true;
		if (/\d/.test(i)) {
			index = +i;
		}
		return '';
	});
	return { isArray, realName: name, index };
};

@getOutput
export default class NestedForm extends Component {
	static propTypes = {
		name: PropTypes.string,
		component: ComponentPropType,
		onSubmit: PropTypes.func,
		onReset: PropTypes.func,
		onValid: PropTypes.func,
		onInvalid: PropTypes.func,
		onChange: PropTypes.func,
		validations: ValidationPropType,
		outputFilter: FilterPropType,
	};

	static defaultProps = {
		component: 'div',
		onSubmit: emptyFunction,
		onReset: emptyFunction,
		onValid: emptyFunction,
		onInvalid: emptyFunction,
		outputFilter: returnsArgument,
	};

	static contextTypes = {
		[CONTEXT_NAME]: PropTypes.object,
	};

	static childContextTypes = {
		[CONTEXT_NAME]: PropTypes.object,
	};

	getChildContext() {
		return {
			[CONTEXT_NAME]: {
				attach: this.attach,
				detach: this.detach,
				submit: this.submit,
				reset: this.reset,

				// onRequestValidate: this._requestValid,
				// onRequestRenew: this._requestRenew,
				requestChange: this._requestChange,
				requestValidate: this._requestValidate,
				requestRenew: this._requestRenew,
			},
		};
	}

	componentWillMount() {
		const { props: { name }, context } = this;

		this.nest = {
			value: {},
			errorMessages: [],
		};

		this._outputValue = null;
		this._shouldRenew = true;
		this._shouldValidate = true;

		this._contextForm = (name && context[CONTEXT_NAME]) || {
			attach: emptyFunction,
			detach: emptyFunction,
			submit: emptyFunction,
			reset: emptyFunction,
		};

		this._contextForm.attach(this);
	}

	componentWillUnmount() {
		this._contextForm.detach(this);
	}

	_children = [];

	_hasParent() {
		const { props, context } = this;
		return !!(props.name && context[CONTEXT_NAME]);
	}

	_attachChild(child, wrapper) {
		if (isValidChild(child) && wrapper.indexOf(child) < 0) {
			wrapper.push(child);
			return true;
		}
		return false;
	}

	_detachChild(child, wrapper) {
		if (child) {
			const index = wrapper.indexOf(child);
			if (index > -1) {
				wrapper.splice(index, 1);
				return true;
			}
		}
		return false;
	}

	attach = (child) => {
		if (isValidChild(child) && this._children.indexOf(child) < 0) {
			this._children.push(child);
			this._requestChange();
			if (this._hasParent()) {
				this._contextForm.attach(this);
			}
			else {
				this.validate();
			}
		}
	};

	detach = (child) => {
		if (!child) {
			return;
		}

		const index = this._children.indexOf(child);

		if (index > -1) {
			this._children.splice(index, 1);
			this._requestChange();
			if (this._hasParent()) {
				this._contextForm.detach(this);
			}
			else {
				this.validate();
			}
		}
	};

	_requestChange = () => {
		this._requestRenew();
		this._requestValidate();
	};

	_requestValidate = () => {
		this._shouldValidate = true;
		if (this._hasParent()) {
			this._contextForm.requestValidate();
		}
		else {
			this.validate();
		}
	};

	_requestRenew = () => {
		const { onChange } = this.props;
		this._shouldRenew = true;
		if (isFunction(onChange)) {
			onChange(this.getValue());
		}
		if (this._hasParent()) {
			this._contextForm.requestRenew();
		}
	};

	getValue() {
		const { nest, _shouldRenew, _outputValue } = this;

		if (!_shouldRenew) {
			return _outputValue;
		}

		this._shouldRenew = false;

		const newValue = this._children.slice().reduce((data, child) => {
			const { props: { name } } = child;

			if (!name) {
				return data;
			}

			const { isArray, realName, index } = parseName(name);
			const value = child.getValue();
			let dataValue = data[realName];
			if (isArray) {
				if (!dataValue) {
					dataValue = data[realName] = [];
				}

				if (index < 0) {
					dataValue.push(value);
				}
				else {
					dataValue.splice(index, 0, value);
				}
			}
			else {
				warning(
					!dataValue,
					`[ReactNestedForm]: Multi names called \`${realName}\`! ` +
						`If you wanna use array, please use \`${realName}[]\` instead.`,
				);
				data[realName] = value;
			}
			return data;
		}, {});

		nest.value = newValue;
		return (this._outputValue = this._getOutput(newValue));
	}

	validate() {
		const { nest } = this;

		if (!this._shouldValidate) {
			return;
		}

		this._shouldValidate = false;

		nest.errorMessages = this._children
			.filter((child) => {
				child.validate();
				return child.nest.isInvalid || child.nest.isRequired;
			})
			.map(({ nest }) => nest.errorMessage);

		const isInvalid = !!nest.errorMessages.length;
		if (isInvalid !== nest.isInvalid) {
			const { onValid, onInvalid } = this.props;
			nest.isInvalid = isInvalid;

			if (isInvalid) {
				onInvalid();
			}
			else {
				onValid();
			}
		}
	}

	setAsPristine() {
		this._eachChildren((child) => child.setAsPristine());
	}

	setAsNotPristine() {
		this._eachChildren((child) => child.setAsNotPristine());
	}

	_getEventState() {
		const { isInvalid, errorMessages } = this.nest;
		const state = {
			isInvalid,
			errorMessages,
			isStoppedPropagation: false,
			stopPropagation() {
				state.isStoppedPropagation = true;
			},
		};
		return state;
	}

	_eachChildren(iterator) {

		// prevent detach
		const children = this._children.slice();
		children.forEach(iterator);
	}

	reset = (callback = emptyFunction) => {
		this._eachChildren((child) => child.reset());

		const eventState = this._getEventState();
		const value = this.getValue();
		this.props.onReset(value, eventState);
		callback(value, eventState);

		if (!eventState.isStoppedPropagation) {
			this._contextForm.reset();
		}
	};

	submit = (callback = emptyFunction) => {
		const eventState = this._getEventState();
		const value = this.getValue();
		this._eachChildren((child) => child.setAsNotPristine());
		this.props.onSubmit(value, eventState);
		callback(value, eventState);

		if (!eventState.isStoppedPropagation) {
			this._contextForm.submit();
		}
	};

	render() {
		const {
			props: {
				component: Comp,

				/* eslint-disable */
				onValid,
				onInvalid,
				onChange,
				validations,
				outputFilter,
				/* eslint-enable */

				...other
			},
		} = this;

		return <Comp {...other} />;
	}
}
