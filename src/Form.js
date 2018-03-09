import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { emptyFunction, returnsArgument } from 'empty-functions';
import warning from 'warning';
import { CONTEXT_NAME } from './constants';
import Validation from './Validation';
import {
	ValidationPropType,
	ErrorMessagePropType,
	ComponentPropType,
	isValidChild,
	FilterPropType,
	isFunction,
	isUndefined,
} from './utils';

export default class Form extends Component {
	static propTypes = {
		name: PropTypes.string,
		value: PropTypes.object,
		defaultValue: PropTypes.object,
		component: ComponentPropType,
		onSubmit: PropTypes.func,
		onReset: PropTypes.func,
		onValid: PropTypes.func,
		onInvalid: PropTypes.func,
		onChange: PropTypes.func,
		inputFilter: FilterPropType,
		outputFilter: FilterPropType,

		defaultErrorMessage: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.shape({
				required: ErrorMessagePropType,
				default: ErrorMessagePropType,
			}),
		]),

		validations: ValidationPropType,
		required: PropTypes.bool,
	};

	static defaultProps = {
		component: 'div',
		onSubmit: emptyFunction,
		onReset: emptyFunction,
		onValid: emptyFunction,
		onInvalid: emptyFunction,
		inputFilter: returnsArgument,
		outputFilter: returnsArgument,
	};

	static contextTypes = {
		[CONTEXT_NAME]: PropTypes.object,
	};

	static childContextTypes = {
		[CONTEXT_NAME]: PropTypes.object,
	};

	getChildContext() {
		const { getValue, setValue, getPath, attach, detach, emitChange } = this;
		return {
			[CONTEXT_NAME]: {
				getValue,
				setValue,
				getPath,
				attach,
				detach,
				emitChange,
			},
		};
	}

	componentWillMount() {
		this._form = this.context[CONTEXT_NAME];
		const { name } = this.props;
		const value = this.getValue(name);
		this._validation = this._createValidation(value);
		this._children = [];
		this.nest = {
			path: this.getPath(name),
			value,
			isTouched: true,
			isIgnored: false,
			...this._validation.state,
		};
	}

	getValue = (name) => {
		let data;
		if (!this._form) {
			const { value, defaultValue } = this.props;
			data = isUndefined(value) ? defaultValue : value;
		}
		else {
			data = this._form.getValue(this.props.name);
		}
		return name && data ? data[name] : data;
	};

	setValue = (name, val) => {
		return (this.nest.value[name] = val);
	};

	getPath = (...paths) => {
		if (this._form) {
			return this._form.getPath(this.props.name, ...paths);
		}
		return paths;
	};

	attach = (child) => {
		if (isValidChild(child) && !~this._children.indexOf(child)) {
			this._children.push(child);
			this._updateValidationState();
		}
	};

	detach = (child) => {
		if (!child) {
			return;
		}

		const index = this._children.indexOf(child);
		if (index > -1) {
			this._children.splice(index, 1);
			this._updateValidationState();
		}
	};

	emitChange = (path, value) => {
		if (this._form) {
			this._form.emitChange(path, value);
		}
		else {
			const { onChange } = this.props;
			if (onChange) {
				onChange({ path, value });
			}
		}
	};

	_createValidation(value) {
		const { required, validations, defaultErrorMessage } = this.props;
		return new Validation(
			this,
			required,
			validations,
			defaultErrorMessage,
		).validate(value);
	}

	_updateValidationState() {
		const { props: { onValid, onInvalid }, nest } = this;
		const ok = this._children.every((child) => child.nest.ok);
		const prevOk = nest.ok;
		if (ok !== prevOk) {
			if (prevOk) {
				onInvalid();
			}
			else {
				onValid();
			}
		}
	}

	render() {
		const {
			props: {
				component: Comp,

				onValid,
				onInvalid,
				onChange,
				validations,
				outputFilter,

				...other
			},
		} = this;

		return <Comp {...other} />;
	}
}
