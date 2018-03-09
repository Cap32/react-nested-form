import PropTypes from 'prop-types';
import React, { Component } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import hoistReactInstanceMethods from 'hoist-react-instance-methods';
import { CONTEXT_NAME } from './constants';
import Validation from './Validation';
import {
	isEmpty,
	ValidationPropType,
	ErrorMessagePropType,
	FilterPropType,
} from './utils';
import { DataTypeKeys } from './DataTypes';

const defaultShouldIgnore = (value, pristineValue) =>
	isEmpty(value) && isEmpty(pristineValue);

export default function ne(options = {}) {
	const {
		withRef = false,
		hoistMethods = [],
		valueProp = 'value',
		varProp = 'value',
		defaultProps = {},
	} = options;

	return function createNestedComponent(WrappedComponent) {
		@hoistReactInstanceMethods(
			(instance) => instance.getWrappedInstance(),
			hoistMethods,
		)
		class Nestify extends Component {
			static propTypes = {
				name: PropTypes.string.isRequired,
				defaultValue: PropTypes.any,
				value: PropTypes.any,
				validations: ValidationPropType,
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
				...defaultProps,
			};

			static contextTypes = {
				[CONTEXT_NAME]: PropTypes.object.isRequired,
			};

			static childContextTypes = {
				[CONTEXT_NAME]: PropTypes.object,
			};

			getChildContext() {
				return {
					[CONTEXT_NAME]: {
						data: this.nest.data,
					},
				};
			}

			componentWillMount() {
				const { name } = this.props;
				const form = this._createForm();
				const value = form.getValue(name);
				this._form = form;
				this._validation = this._createValidation(value);
				this.nest = {
					value,
					path: form.getPath(name),
					isTouched: true,
					isIgnored: false,
					...this._validation.state,
				};
			}

			_withRef = withRef ? { ref: (c) => (this.wrappedInstance = c) } : {};

			getWrappedInstance() {
				return this.wrappedInstance;
			}

			_createForm() {
				return this.context[CONTEXT_NAME];
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
				this._inputFlow(
					[
						this._performInputFilter,
						this._performDataTypeInput,
						this._performValidate,
						this._performSetValue,
						this._emitChange,
					],
					value,
				);
			}

			_output() {
				this._outputflow([
					this._performDataTypeOutput,
					this._performOutputFilter,
					this._performPublish,
				]);
			}

			_flow(fns, value) {
				fns.reduce((acc, fn) => fn.call(this, value), value);
			}

			_inputFlow(fns, value) {
				this._tryRun(() => {
					fns.reduce((acc, fn) => fn.call(this, value), value);
				});
			}

			_outputflow(fns) {
				this._flow(fns, this.nest.value);
			}

			_tryRun(fn) {
				try {
					fn();
				}
				catch (err) {
					this._validation.throw(err);
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
			}

			_performSetValue(value) {
				this.nest.value = value;
			}

			_emitChange(value) {

				// TODO
				console.log('changed', value);
			}

			_performDataTypeInput(value) {
				const { dataType } = this.props;
				return dataType ? this._performType('input', dataType, value) : value;
			}

			_performDataTypeOutput(value) {
				const { dataType } = this.props;
				return dataType ? this._performType('output', dataType, value) : value;
			}

			_performPublish(value) {
				const { state } = this._validation;
				return { value, ...state };
			}

			/* * * */

			render() {
				const {
					props: {
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

						...other
					},
					nest,
				} = this;

				return (
					<WrappedComponent
						{...other}
						{...this._withRef}
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
