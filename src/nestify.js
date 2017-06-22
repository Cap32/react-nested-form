
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import { isEmpty, ValidationPropType, ErrorMessagePropType } from './utils';
import { CONTEXT_NAME } from './constants';
import { noop, returnsArgument } from 'empty-functions';
import Validation from './Validation';
import Mapper from './Mapper';

export default function nestify(options) {
	const mapper = new Mapper(options, {
		defaultValue: returnsArgument,
		value: returnsArgument,
		onChange: (event) => event.currentTarget.value,
		onKeyPress: (event) => event.key,
		onBlur: noop,
	});

	return function createNestedComponent(WrappedComponent) {
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
					shouldIgnoreEmpty,
					inputFilter,
				} = this.props;

				const initialValue = mapper.getInitialValue(this);
				const value = inputFilter(initialValue, this.props);
				this._mapperHandlers = mapper.getHandlers(this);

				this.nest = {
					isInvalid: false,
					isRequired: false,
					isPristine: true,
					hasAttached: false,
					errorMessage: '',
					value,
				};

				this._validation = new Validation(this.props);

				this.pristineValue = value;
				this._shouldForceRender = false;
				this._shouldValidate = true;
				this._shouldRenew = true;
				this._outputValue = null;

				const { required } = this._validation;
				const outputValue = this._getOutput(value);

				if (required || !isEmpty(outputValue) ||
					!shouldIgnoreEmpty(outputValue, value)
				) {
					this.attach();
				}
			}

			componentWillReceiveProps(nextProps) {
				const { name, map } = mapper.getValueProp();
				const nextValue = nextProps[name];
				if (this.props[name] !== nextValue) {
					this._updateValue(map(nextValue));
				}
			}

			componentWillUnmount() {
				this.context[CONTEXT_NAME].detach(this);
			}

			getValue() {
				this._setPristine(false);
				this._requestRender();

				if (this._shouldRenew) {
					const { nest } = this;
					nest.shouldShowErrorMessage = true;
					this._shouldRenew = false;
					return (this._outputValue = this._getOutput(nest.value));
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

			// should cache result
			_getOutput(value) {
				const { props } = this;
				return props.outputFilter(value, props);
			}

			_shouldAttachEmptyValue(prevValue, nextValue) {
				const {
					nest,
					pristineValue,
					props: { required, shouldIgnoreEmpty }
				} = this;
				if ((required && !nest.hasAttached) ||
					(isEmpty(prevValue) && !isEmpty(nextValue) && !nest.hasAttached)
				) {
					this.attach();
				}
				else if (!required &&
					!isEmpty(prevValue) && isEmpty(nextValue) && nest.hasAttached &&
					shouldIgnoreEmpty(nextValue, pristineValue)
				) {
					this.detach();
				}
			}

			_updateValue(value, shouldSetAsPristine) {
				const { nest, props, context } = this;
				const form = context[CONTEXT_NAME];
				const finalValue = props.inputFilter(value, props);
				const hasChanged = nest.value !== finalValue;

				if (hasChanged) {
					this._shouldRenew = true;
					this._shouldValidate = true;
					this._shouldAttachEmptyValue(
						this._getOutput(nest.value),
						this._getOutput(finalValue),
					);
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

			handlers = {
				onChange: (value) => {
					this.setValue(value);
				},
				onKeyPress: (key) => {
					if (key === 'Enter') {
						this.context[CONTEXT_NAME].submit();
					}
				},
				onBlur: () => {
					this._setPristine(false);
					this._requestRender();
				},
			};

			render() {
				const {
					props: {

						/* eslint-disable */
						defaultValue,
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
					_mapperHandlers,
				} = this;

				return (
					<WrappedComponent
						{...other}
						{..._mapperHandlers}
						{...mapper.getValues(this)}
						nest={{
							...nest,
							setValue: this.setValue,
							attach: this.attach,
							detach: this.detach,
						}}
					/>
				);
			}
		}

		return hoistStatics(Nestify, WrappedComponent);
	};
}
