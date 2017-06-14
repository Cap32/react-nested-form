
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import { ValidationPropType, isFunction, isUndefined } from './utils';
import find from 'array-find';
import { CONTEXT_NAME } from './constants';
import { returnsArgument } from 'empty-functions';

const isEmpty = (value) =>
	isUndefined(value) || value === null || value === ''
;

export default function nestify(WrappedComponent/*, options*/) {
	class Nestify extends Component {
		static propTypes = {
			name: PropTypes.string.isRequired,
			defaultValue: PropTypes.any,
			value: PropTypes.any,
			validations: ValidationPropType,
			defaultErrorMessage: PropTypes.string,
			required: PropTypes.bool,
			onChange: PropTypes.func,
			shouldIgnoreEmpty: PropTypes.func,
			inputFilter: PropTypes.func,
			outputFilter: PropTypes.func,
		};

		static defaultProps = {
			required: false,
			defaultErrorMessage: 'Error',
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
				required,
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

			this.pristineValue = value;
			this._shouldForceRender = false;
			this._shouldValid = true;
			this._shouldRenew = true;
			this._outputValue = null;

			if (required || !isEmpty(value) || !shouldIgnoreEmpty(value, value)) {
				this.attach();
			}
		}

		componentWillUnmount() {
			this.context[CONTEXT_NAME].detach(this);
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

		_requestFormValidate() {
			this.context[CONTEXT_NAME].validate();
		}

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

		_checkHasChanged(value) {
			const { nest, props } = this;
			const hasChanged = nest.value !== props.inputFilter(value);
			if (hasChanged) {
				this._shouldRenew = true;
				this._shouldValid = true;
			}
			return hasChanged;
		}

		_updateValue(value, shouldSetAsPristine) {
			const { nest, props } = this;
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
				this.context[CONTEXT_NAME].validate();
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

		_setErrorMessage(errorMessage = '') {
			if ((errorMessage && this.nest.errorMessage !== errorMessage) ||
				(!errorMessage && this.nest.errorMessage)
			) {
				this._shouldForceRender = true;
				this.nest.errorMessage = errorMessage;
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
				props: { validations, defaultErrorMessage, required },
				nest: { value },
			} = this;

			const isEmptyValue = isEmpty(value);
			this._shouldValid = true;

			if (required && isEmptyValue) {
				this._setErrorMessage();
				this._setInvalid(false);
				this._setRequired(true);
			}
			else if (!required && isEmptyValue) {
				this._setErrorMessage();
				this._setInvalid(false);
				this._setRequired(false);
			}
			else {
				this._setRequired(false);

				let errorMessage = '';

				if (validations) {
					const invalidation = find([].concat(validations), (valid) => {
						const fn = isFunction(valid) ? valid : valid.validator;
						return !fn(value);
					});

					if (invalidation) {
						const maybeMsg = invalidation.message || defaultErrorMessage;
						const message = isFunction(maybeMsg) ? maybeMsg(value) : maybeMsg;
						errorMessage = message;
					}
				}

				if (errorMessage) {
					this._setInvalid(true);
					this._setErrorMessage(errorMessage);
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
