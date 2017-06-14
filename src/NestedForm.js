
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { emptyFunction, returnsArgument } from 'empty-functions';
import warning from 'warning';
import { ValidationPropType, ComponentPropType, isValidChild } from './utils';
import { CONTEXT_NAME } from './constants';

const parseName = (name = '') => {
	const regExp = /\[\]$/;
	let isArray = false;
	name = (name + '').replace(regExp, () => {
		isArray = true;
		return '';
	});
	return { isArray, realName: name };
};

export default class NestedForm extends Component {
	static propTypes = {
		name: PropTypes.string,
		component: ComponentPropType,
		onSubmit: PropTypes.func,
		onReset: PropTypes.func,
		onValid: PropTypes.func,
		onInvalid: PropTypes.func,
		validations: ValidationPropType,
		outputFilter: PropTypes.func,
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
				onRequestValidate: this._requestValid,
				onRequestRenew: this._requestRenew,
			},
		};
	}

	componentWillMount() {
		const { props: { name }, context } = this;

		this.nest = {
			value: {},
		};

		this._outputValue = null;
		this._shouldRenew = true;
		this._shouldValid = true;

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

			if (this._hasParent()) { this._contextForm.attach(this); }
			else { this.validate(); }
		}
	};

	detach = (child) => {
		if (!child) { return; }

		const index = this._children.indexOf(child);
		if (index > -1) {
			this._children.splice(index, 1);
			if (this._hasParent()) { this._contextForm.detach(this); }
			else { this.validate(); }
		}
	};

	_requestRenew = () => {
		this._shouldRenew = true;
	};

	_requestValid = () => {
		this._shouldValid = true;
		if (this._hasParent()) { this._contextForm.onRequestValidate(); }
		else { this.validate(); }
	};

	getValue() {
		const {
			props: { outputFilter },
			nest,
			_shouldRenew,
			_outputValue,
		} = this;

		if (!_shouldRenew) { return _outputValue; }

		this._shouldRenew = false;

		const newValue = this._children.reduce((data, child) => {
			const { props: { name } } = child;

			if (!name) { return data; }

			const { isArray, realName } = parseName(name);
			const value = child.getValue();
			const dataValue = data[realName];
			if (isArray) {
				if (dataValue) { dataValue.push(value); }
				else { data[realName] = [value]; }
			}
			else {
				warning(!dataValue,
					`[ReactNestedForm]: Multi names called \`${realName}\`! ` +
					`If you wanna use array, please use \`${realName}[]\` instead.`
				);
				data[realName] = value;
			}
			return data;
		}, {});

		nest.value = newValue;
		return (this._outputValue = outputFilter(newValue));
	}

	validate() {
		const { nest } = this;

		if (!this._shouldValid) { return; }

		this._shouldValid = false;

		const errors = this._children.filter((child) => {
			child.validate();
			return child.nest.isInvalid || child.nest.isRequired;
		});
		const isInvalid = !!errors.length;

		if (isInvalid !== nest.isInvalid) {
			const { onValid, onInvalid } = this.props;
			nest.isInvalid = isInvalid;

			if (isInvalid) { onInvalid(); }
			else { onValid(); }
		}
	}

	setAsPristine() {
		this._children.forEach((child) => child.setAsPristine());
	}

	_getEventState() {
		const { isInvalid } = this.nest;
		const state = {
			isInvalid,
			isStoppedPropagation: false,
			stopPropagation() {
				state.isStoppedPropagation = true;
			},
		};
		return state;
	}

	reset = (callback = emptyFunction) => {
		this._children.forEach((child) => child.reset());

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
				validations,
				outputFilter,
				/* eslint-enable */

				...other,
			},
		} = this;

		return (
			<Comp {...other} />
		);
	}
}
