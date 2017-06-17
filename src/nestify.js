
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import {
	isFunction, isUndefined, isEmpty, ValidationPropType, ErrorMessagePropType,
} from './utils';
import { CONTEXT_NAME } from './constants';
import { returnsArgument } from 'empty-functions';
import Validation from './Validation';

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
					default: ErrorMessagePropType,
				}),
			]),
			onChange: PropTypes.func,
			onKeyPress: PropTypes.func,
			onBlur: PropTypes.func,
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
			shouldIgnoreEmpty: (val, pristineValue) => isEmpty(pristineValue),
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

			this._validation = new Validation(this.props);

			this.pristineValue = value;
			this._shouldForceRender = false;
			this._shouldValidate = true;
			this._shouldRenew = true;
			this._outputValue = null;

			const { required } = this._validation;

			if (required || !isEmpty(value) || !shouldIgnoreEmpty(value, value)) {
				this.attach();
			}

		}

		componentWillUnmount() {
			this.context[CONTEXT_NAME].detach(this);
		}

		getValue() {
			this._setPristine(false);

			if (this._shouldRenew) {
				const { props, nest } = this;
				nest.shouldShowErrorMessage = true;
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
				this._shouldValidate = true;
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

		_setPristine(isPristine) {
			if (this.nest.isPristine !== isPristine) {
				this._shouldForceRender = true;
				this.nest.isPristine = isPristine;
			}
		}

		_requestRender() {
			if (this._shouldForceRender) {
				this.forceUpdate();
				this._shouldForceRender = false;
			}
		}

		validate() {
			if (!this._shouldValidate) { return; }

			const {
				props: { name },
				nest: { value },
				nest,
			} = this;

			const {
				errorMessage,
				isInvalid,
				isRequired,
			} = this._validation.validate(name, value);

			this._shouldValidate = true;

			if (nest.isRequired !== isRequired) {
				this._shouldForceRender = true;
				nest.isRequired = isRequired;
			}

			if (nest.isInvalid !== isInvalid) {
				this._shouldForceRender = true;
				nest.isInvalid = isInvalid;
			}

			if ((errorMessage && nest.errorMessage !== errorMessage) ||
				(!errorMessage && nest.errorMessage)
			) {
				this._shouldForceRender = true;
				nest.errorMessage = errorMessage;
			}

			this._requestRender();
		}

		_handleChange = (ev, ...rest) => {
			const { onChange } = this.props;
			const target = ev && ev.currentTarget;
			const hasTargetValue = target && !isUndefined(target.value);
			const val = hasTargetValue ? target.value : rest[0];
			this.setValue(val);
			if (isFunction(onChange)) { return onChange(ev, ...rest); }
		};

		_handleKeyPress = (ev, ...rest) => {
			const { onKeyPress } = this.props;
			const code = ev.keyCode || ev.which;
			if (ev.key === 'Enter' || code === 13) {
				this.context[CONTEXT_NAME].submit();
			}
			if (isFunction(onKeyPress)) { return onKeyPress(ev, ...rest); }
		};

		_handleBlur = (...args) => {
			const { onBlur } = this.props;
			this._setPristine(false);
			if (isFunction(onBlur)) { return onBlur(...args); }
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
