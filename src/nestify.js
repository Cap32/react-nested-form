
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import { CONTEXT_NAME } from './constants';
import { noop, returnsArgument } from 'empty-functions';
import Validation from './Validation';
import Mapper from './Mapper';
import { isEmpty, ValidationPropType, ErrorMessagePropType, FilterPropType } from './utils';
import { DataTypeKeys } from './DataTypes';
import { getInput, getOutput } from './Mixins';

const defaultShouldIgnore = (value, pristineValue) =>
	isEmpty(value) && isEmpty(pristineValue)
;

export default function nestify(options) {
	const mapper = new Mapper(options, {
		defaultValue: returnsArgument,
		value: returnsArgument,
		onChange: (event) => event.currentTarget.value,
		onKeyPress: (event) => event.key,
		onBlur: noop,
	});

	return function createNestedComponent(WrappedComponent) {

		@getInput
		@getOutput
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
				shouldIgnore: PropTypes.func,

				dataType: PropTypes.oneOfType([
					PropTypes.func,
					PropTypes.oneOf(DataTypeKeys),
				]),
				inputFilter: FilterPropType,
				outputFilter: FilterPropType,
				formatEmptyValue: PropTypes.func,

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
				shouldIgnore: defaultShouldIgnore,
			};

			static contextTypes = {
				[CONTEXT_NAME]: PropTypes.object.isRequired,
			};

			componentWillMount() {
				const {
					props,
					props: { shouldIgnore },
				} = this;

				const initialValue = mapper.getInitialValue(this);
				const value = this._getInput(initialValue);
				this._mapperHandlers = mapper.getHandlers(this);

				this.nest = {
					isInvalid: false,
					isRequired: false,
					isPristine: true,
					hasAttached: false,
					errorMessage: '',
					value,
				};

				this._validation = new Validation(props);

				this.pristineValue = value;
				this._shouldForceRender = false;
				this._shouldValidate = true;
				this._shouldRenew = true;
				this._outputValue = null;

				const { required } = this._validation;
				const outputValue = this._getOutput(value);

				if (required || !shouldIgnore(outputValue, value, props)) {
					this.attach();
				}
			}

			componentWillReceiveProps(nextProps) {
				const { name, get } = mapper.getValueProp();
				const nextValue = nextProps[name];
				if (this.props[name] !== nextValue) {
					this._updateValue(get(nextValue));
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

			_shouldAttach(nextValue) {
				const {
					nest,
					pristineValue,
					props,
					props: { required, shouldIgnore },
				} = this;
				if (!nest.hasAttached &&
					(required || !shouldIgnore(nextValue, pristineValue, props))
				) {
					this.attach();
				}
				else if (nest.hasAttached && !required &&
					shouldIgnore(nextValue, pristineValue, props)
				) {
					this.detach();
				}
			}

			_updateValue(value, shouldSetAsPristine) {
				const { nest, context } = this;
				const form = context[CONTEXT_NAME];
				const nextValue = this._getInput(value);
				const hasChanged = nest.value !== nextValue;

				if (hasChanged) {
					this._shouldRenew = true;
					this._shouldValidate = true;
					this._shouldAttach(this._getOutput(nextValue));
					nest.value = nextValue;
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
