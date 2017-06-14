
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import {
	isFunction, isUndefined, isString, isEmpty,
	ValidationPropType, ErrorMessagePropType, getGlobalDefaultErrorMessages,
} from './utils';
import find from 'array-find';
import { CONTEXT_NAME } from './constants';
import { returnsArgument } from 'empty-functions';

export default function nestify(WrappedComponent/*, options*/) {
	class Nestify extends Component {
		static propTypes = {
			name: PropTypes.string.isRequired,
			defaultValue: PropTypes.any,
			value: PropTypes.any,
			validations: ValidationPropType,
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
					other: ErrorMessagePropType,
				}),
			]),
			onChange: PropTypes.func,
			shouldIgnoreEmpty: PropTypes.func,
			inputFilter: PropTypes.func,
			outputFilter: PropTypes.func,

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
				PropTypes.oneOfType([
					PropTypes.string,
					PropTypes.number,
				]),
			),
		};

		static defaultProps = {
			required: false,
			shouldIgnoreEmpty: (val, pristine) => (!pristine && pristine !== false),
			inputFilter: returnsArgument,
			outputFilter: returnsArgument,
		};

		static contextTypes = {
			[CONTEXT_NAME]: PropTypes.object.isRequired,
		};

		componentWillMount() {
			const {
				value: propValue,
				defaultValue,
				shouldIgnoreEmpty,
				inputFilter,
			} = this.props;

			this.nest = {
				isInvalid: false,
				isRequired: false,
				isPristine: true,
				hasAttached: false,
				errorMessage: '',
				shouldIgnoreEmpty,
				value: inputFilter(
					!isUndefined(defaultValue) ? defaultValue :
						(!isUndefined(propValue) ? propValue : '')
				),
			};

			const { value } = this.nest;

			this._initDefaultErrorMessages();
			this._initValidations();

			this.pristineValue = value;
			this._shouldForceRender = false;
			this._shouldValid = true;
			this._shouldRenew = true;
			this._outputValue = null;

			const isRequired = this._isRequired;

			if (isRequired || !isEmpty(value) || !shouldIgnoreEmpty(value, value)) {
				this.attach();
			}
		}

		componentWillUnmount() {
			this.context[CONTEXT_NAME].detach(this);
		}

		_initDefaultErrorMessages() {
			let { defaultErrorMessage } = this.props;

			if (isString(defaultErrorMessage)) {
				defaultErrorMessage = { other: defaultErrorMessage };
			}

			this._errorMessages = {
				...getGlobalDefaultErrorMessages(),
				...defaultErrorMessage,
			};
		}

		_initValidations() {
			const {
				props: {
					validations: propValidations,
					required,
					maximum,
					exclusiveMaximum,
					minimum,
					exclusiveMinimum,
					maxLength,
					minLength,
					pattern,
					enum: oneOf,
				},
				_errorMessages,
			} = this;

			let validations = [].concat(propValidations);

			if (required) { this._isRequired = true; }
			else {
				const requiredValidation = validations.find((v) => v && v.required);
				if (requiredValidation) {
					this._isRequired = true;
					if (requiredValidation.message) {
						_errorMessages.required = requiredValidation.message;
					}
					delete requiredValidation.required;
				}
			}

			validations = validations
				.filter(Boolean)
				.map((validator) => isFunction(validator) ? { validator } : validator)
			;

			const add = (type, value) => {
				!isUndefined(value) && validations.unshift({
					message: _errorMessages[type],
					[type]: value,
				});
			};

			add('maximum', maximum);
			add('exclusiveMaximum', exclusiveMaximum);
			add('minimum', minimum);
			add('exclusiveMinimum', exclusiveMinimum);
			add('maxLength', maxLength);
			add('minLength', minLength);
			add('pattern', pattern);
			add('oneOf', oneOf);

			this._validations = validations;
		}

		getValue() {
			if (this._shouldRenew) {
				const { props, nest } = this;
				this._shouldRenew = false;
				return (this._outputValue = props.outputFilter(nest.value));
			}
			return this._outputValue;
		}

		attach = () => {
			this.nest.hasAttached = true;
			return this.context[CONTEXT_NAME].attach(this);
		};

		detach = () => {
			this.nest.hasAttached = false;
			return this.context[CONTEXT_NAME].detach(this);
		};

		_shouldAttachEmptyValue(prevValue, nextValue) {
			const { nest, pristineValue, props: { required } } = this;
			if ((required && !nest.hasAttached) ||
				(isEmpty(prevValue) && !isEmpty(nextValue) && !nest.hasAttached)
			) {
				this.attach();
			}
			else if (!isEmpty(prevValue) && isEmpty(nextValue) && nest.hasAttached &&
				nest.shouldIgnoreEmpty(nextValue, pristineValue)
			) {
				this.detach();
			}
		}

		_updateValue(value, shouldSetAsPristine) {
			const { nest, props, context } = this;
			const form = context[CONTEXT_NAME];
			const finalValue = props.inputFilter(value);
			const hasChanged = nest.value !== finalValue;
			if (hasChanged) {
				this._shouldRenew = true;
				this._shouldValid = true;
				this._shouldAttachEmptyValue(nest.value, finalValue);
				nest.value = finalValue;
				this._shouldForceRender = true;
				this._requestRender();
				this._setPristine(shouldSetAsPristine);
				form.onRequestValidate();
				form.onRequestRenew();
			}
			return nest.value;
		}

		setValue = (value) => {
			return this._updateValue(value, false);
		};

		reset = () => {
			return this._updateValue(this.pristineValue, true);
		};

		setAsPristine() {
			if (this.pristineValue !== this.nest.value) {
				this._shouldForceRender = true;
				this.pristineValue = this.nest.value;
			}
			this._setPristine(true);
			this._requestRender();
			return this.nest.value;
		}

		_setRequired(isRequired) {
			if (this.nest.isRequired !== isRequired) {
				this._shouldForceRender = true;
				this.nest.isRequired = isRequired;
			}
		}

		_setInvalid(isInvalid) {
			if (this.nest.isInvalid !== isInvalid) {
				this._shouldForceRender = true;
				this.nest.isInvalid = isInvalid;
			}
		}

		_setPristine(isPristine) {
			if (this.nest.isPristine !== isPristine) {
				this._shouldForceRender = true;
				this.nest.isPristine = isPristine;
			}
		}

		_setErrorMessage(error, name, received, expected) {
			const message = (function () {
				if (!error) { return ''; }
				return isString(error) ? error : error(name, received, expected);
			}());

			if ((message && this.nest.errorMessage !== message) ||
				(!message && this.nest.errorMessage)
			) {
				this._shouldForceRender = true;
				this.nest.errorMessage = message;
			}
		}

		_requestRender() {
			if (this._shouldForceRender) {
				this.forceUpdate();
				this._shouldForceRender = false;
			}
		}

		validate() {
			if (!this._shouldValid) { return; }

			const {
				props: { name },
				nest: { value },
				_errorMessages,
				_validations,
				_isRequired,
			} = this;

			this._shouldValid = true;

			const isEmptyValue = isEmpty(value);
			if (_isRequired && isEmptyValue) {
				this._setErrorMessage(_errorMessages.required, name, value, 'required');
				this._setInvalid(false);
				this._setRequired(true);
			}
			else if (!_isRequired && isEmptyValue) {
				this._setErrorMessage();
				this._setInvalid(false);
				this._setRequired(false);
			}
			else {
				this._setRequired(false);

				const invalid = find(_validations, (valid) => {
					const validator = isFunction(valid) ? valid : valid.validator;
					return !validator(value);
				});

				if (invalid) {
					const message = invalid.message || _errorMessages.other;
					this._setInvalid(true);
					this._setErrorMessage(message, name, value, '[Validator Function]');
				}
				else {
					this._setInvalid(false);
					this._setErrorMessage();
				}
			}

			this._requestRender();
		}

		_handleChange = (ev, ...rest) => {
			const { onChange } = this.props;
			const target = ev && ev.currentTarget;
			const hasTargetValue = target && !isUndefined(target.value);
			const val = hasTargetValue ? target.value : rest[0];
			this.setValue(val);
			if (isFunction(onChange)) { onChange(ev, ...rest); }
		};

		_handleKeyPress = (ev) => {
			const code = ev.keyCode || ev.which;
			if (ev.key === 'Enter' || code === 13) {
				this.context[CONTEXT_NAME].submit();
			}
		};

		render() {
			const {
				props: {

					/* eslint-disable */
					validations,
					defaultErrorMessage,
					shouldIgnoreEmpty,
					inputFilter,
					outputFilter,
					maximum,
					exclusiveMaximum,
					minimum,
					exclusiveMinimum,
					maxLength,
					minLength,
					enum: _,
					/* eslint-enable */

					...other,
				},
				nest,
			} = this;
			return (
				<WrappedComponent
					{...other}
					nest={{
						...nest,
						onChange: this._handleChange,
						onKeyPress: this._handleKeyPress,
						setValue: this.setValue,
						attach: this.attach,
						detach: this.detach,
					}}
				/>
			);
		}
	}

	return hoistStatics(Nestify, WrappedComponent);
}
