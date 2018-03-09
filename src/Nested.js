import { Component, createElement } from 'react';
import PropTypes from 'prop-types';
import { CONTEXT_NAME } from './constants';
import Validation from './Validation';
import { DataTypeKeys } from './DataTypes';
import warning from 'warning';
import {
	isEmpty,
	isFunction,
	isValidChild,
	ComponentPropType,
	ValidationPropType,
	ErrorMessagePropType,
	FilterPropType,
} from './utils';

const defaultShouldIgnore = (value, pristineValue) =>
	isEmpty(value) && isEmpty(pristineValue);

export default class Nested extends Component {
	static propTypes = {
		children: PropTypes.func,
		render: PropTypes.func,
		component: ComponentPropType,

		defaultValue: PropTypes.any,
		value: PropTypes.any,
		onChange: PropTypes.func,
		onKeyPress: PropTypes.func,
		onBlur: PropTypes.func,

		name: PropTypes.string,
		isPlainObject: PropTypes.bool,
		shouldIgnore: PropTypes.func,
		validations: ValidationPropType,
		dataType: PropTypes.oneOfType([
			PropTypes.func,
			PropTypes.oneOf(DataTypeKeys),
		]),
		inputFilter: FilterPropType,
		outputFilter: FilterPropType,
		formatEmptyValue: PropTypes.func,

		defaultErrorMessage: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.shape({
				required: ErrorMessagePropType,
				maximum: ErrorMessagePropType,
				exclusiveMaximum: ErrorMessagePropType,
				minimum: ErrorMessagePropType,
				exclusiveMinimum: ErrorMessagePropType,
				maxLength: ErrorMessagePropType,
				minLength: ErrorMessagePropType,
				pattern: ErrorMessagePropType,
				enum: ErrorMessagePropType,
				default: ErrorMessagePropType,
			}),
		]),

		// JSON Schema Validations
		required: PropTypes.bool,
		maximum: PropTypes.number,
		exclusiveMaximum: PropTypes.number,
		minimum: PropTypes.number,
		exclusiveMinimum: PropTypes.number,
		maxLength: PropTypes.number,
		minLength: PropTypes.number,
		pattern: PropTypes.instanceOf(RegExp),
		enum: PropTypes.arrayOf(
			PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		),
	};

	static defaultProps = {
		required: false,
		shouldIgnore: defaultShouldIgnore,
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
		const {
			name,
			component,
			render,
			children,
			value: propVal,
			isPlainObject,
		} = this.props;

		warning(
			!(component && render),
			'You should not use <Nested component> and <Nested render> at the same time; <Nested render> will be ignored',
		);

		warning(
			!(component && children),
			'You should not use <Nested component> and <Nested children> at the same time; <Nested children> will be ignored',
		);

		warning(
			!(render && children),
			'You should not use <Nested render> and <Nested children> at the same time; <Nested children> will be ignored',
		);

		const form = this._getForm();
		const value = form ? form.getValue(name) : propVal;
		this._form = form;

		if (isPlainObject) {
			this._children = [];
		}

		this._validation = this._createValidation(value);
		this.nest = {
			value,
			path: form.getPath(name),
			hasTouched: true,
			isIgnored: false,
			setValue: this.setValue,
			attach: this.attach,
			detach: this.detach,
			...this._validation.state,
		};

		if (form) {
			form.attach(this);
		}
	}

	componentWillUnmount() {
		if (this._form) {
			this._form.detach(this);
		}
	}

	_getForm() {
		return this.props.name && this.context[CONTEXT_NAME];
	}

	_createValidation(value) {
		const {
			required,
			validations,
			maximum,
			exclusiveMaximum,
			minimum,
			exclusiveMinimum,
			maxLength,
			minLength,
			pattern,
			enum: enumRule,
			defaultErrorMessage,
		} = this.props;
		return new Validation(this, required, validations, defaultErrorMessage)
			.addRule('maximum', maximum)
			.addRule('exclusiveMaximum', exclusiveMaximum)
			.addRule('minimum', minimum)
			.addRule('exclusiveMinimum', exclusiveMinimum)
			.addRule('maxLength', maxLength)
			.addRule('minLength', minLength)
			.addRule('pattern', pattern)
			.addRule('enum', enumRule)
			.validate(value);
	}

	_handleChange(value) {
		this._form.emitChange(this.nest.path, value);
	}

	_input(value) {
		this._flow(
			[
				this._performInputFilter,
				this._performDataTypeInput,
				this._performValidate,
				this._performUpdateValue,
				this.emitChange,
			],
			value,
			{ shouldThrowError: true },
		);
	}

	_output() {
		this._flow(
			[
				this._performDataTypeOutput,
				this._performOutputFilter,
				this._performPublish,
			],
			this.nest.value,
		);
	}

	_flow(fns, value, options = {}) {
		try {
			fns.reduce((acc, fn) => fn.call(this, value), value);
		}
		catch (err) {
			if (options.shouldThrowError) {
				this._validation.throw(err);
			}
		}
	}

	_performInputFilter(value) {
		const { inputFilter } = this.props;
		return inputFilter ? inputFilter(value) : value;
	}

	_performOutputFilter(value) {
		const { outputFilter } = this.props;
		return outputFilter ? outputFilter(value) : value;
	}

	_performValidate(value) {
		this._validation.validate(value);
		this.forceUpdate();
		return value;
	}

	_performUpdateValue(value) {
		this.nest.value = value;
		this.forceUpdate();
		return value;
	}

	// TODO
	_performDataTypeInput(value) {
		return value;

		// const { dataType } = this.props;
		// return dataType ? this._performType('input', dataType, value) : value;
	}

	// TODO
	_performDataTypeOutput(value) {
		return value;

		// const { dataType } = this.props;
		// return dataType ? this._performType('output', dataType, value) : value;
	}

	_performPublish(value) {
		const { state } = this._validation;
		return { value, ...state };
	}

	onChange = (value) => {
		this._input(value);
	};

	emitChange = (value) => {
		if (this._form) {
			this._form.emitChange(value);
		}
		else {
			const { onChange } = this.props;
			if (onChange) {
				onChange(value);
			}
		}
	};

	attach = (child) => {
		const { isPlainObject } = this.props;
		if (
			isPlainObject &&
			isValidChild(child) &&
			!~this._children.indexOf(child)
		) {
			this._children.push(child);
			this._updateValidationState();
		}
	};

	detach = (child) => {
		const { isPlainObject } = this.props;
		if (!isPlainObject || !child) {
			return;
		}

		const index = this._children.indexOf(child);
		if (index > -1) {
			this._children.splice(index, 1);
			this._updateValidationState();
		}
	};

	_updateValidationState() {
		if (this.props.isPlainObject) {
			const { nest: { onValid, onInvalid }, nest } = this;
			const ok = this._children.every((child) => child.nest.ok);
			const prevOk = nest.ok;
			if (ok !== prevOk) {
				if (prevOk) {
					isFunction(onInvalid) && onInvalid();
				}
				else {
					isFunction(onValid) && onValid();
				}
			}
		}
	}

	/* * * */

	render() {
		const {
			props: {
				children,
				component,
				render,

				defaultValue,
				validations,
				defaultErrorMessage,
				isPlainObject,
				shouldIgnore,
				formatEmptyValue,
				dataType,
				inputFilter,
				outputFilter,
				maximum,
				exclusiveMaximum,
				minimum,
				exclusiveMinimum,
				maxLength,
				minLength,
				enum: _,

				...otherProps
			},
			nest,
		} = this;
		if (component) return createElement(component, otherProps);
		if (render) return render(nest, otherProps);
		if (children) return children(nest, otherProps);
		return null;
	}
}
