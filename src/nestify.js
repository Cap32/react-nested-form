
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import { ValidationPropType, isFunction, isUndefined } from './utils';
import find from 'array-find';
import { CONTEXT_NAME } from './constants';

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
		};

		static defaultProps = {
			defaultValue: '',
			required: false,
			defaultErrorMessage: 'Error',
			shouldIgnoreEmpty: (value, pristineValue) =>
				!pristineValue && pristineValue !== false
			,
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
			} = this.props;

			this.nest = {
				isInvalid: false,
				isRequired: false,
				isPristine: true,
				hasAttached: false,
				errorMessage: '',
				shouldIgnoreEmpty,
				value: defaultValue || propValue || '',
			};

			const { value } = this.nest;

			this.pristineValue = value;
			this.validate();
			this._shouldUpdate = false;

			if (required || !isEmpty(value) || !shouldIgnoreEmpty(value, value)) {
				this.attach();
			}
		}

		componentWillUnmount() {
			this.context[CONTEXT_NAME].detach(this);
		}

		getValue() {
			return this.nest.value;
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
			const { nest, props: { required } } = this;
			if ((required && !nest.hasAttached) ||
				(isEmpty(prevValue) && !isEmpty(nextValue) && !nest.hasAttached)
			) {
				this.attach();
			}
			else if (!isEmpty(prevValue) && isEmpty(nextValue) && nest.hasAttached &&
				nest.shouldIgnoreEmpty(nextValue, nest.pristineValue)
			) {
				this.detach();
			}
		}

		_updateValue(value) {
			const { nest } = this;
			if (nest.value !== value) {
				this._shouldAttachEmptyValue(nest.value, value);
				nest.value = value;
				this._shouldUpdate = true;
				this.validate();
				this._updateState();
				return true;
			}
			return false;
		}

		setValue = (value) => {
			const hasChanged = this._updateValue(value);
			if (hasChanged) { this._setPristine(false); }
			return this.nest.value;
		};

		reset = () => {
			this._updateValue(this.pristineValue);
			this._setPristine(true);
			return this.nest.value;
		};

		setAsPristine() {
			if (this.pristineValue !== this.nest.value) {
				this._shouldUpdate = true;
				this.pristineValue = this.nest.value;
			}
			this._setPristine(true);
			this._updateState();
			return this.nest.value;
		}

		_setRequired(isRequired) {
			if (this.nest.isRequired !== isRequired) {
				this._shouldUpdate = true;
				this.nest.isRequired = isRequired;
			}
		}

		_setInvalid(isInvalid) {
			if (this.nest.isInvalid !== isInvalid) {
				this._shouldUpdate = true;
				this.nest.isInvalid = isInvalid;
			}
		}

		_setPristine(isPristine) {
			if (this.nest.isPristine !== isPristine) {
				this._shouldUpdate = true;
				this.nest.isPristine = isPristine;
			}
		}

		_setErrorMessage(errorMessage = '') {
			if ((errorMessage && this.nest.errorMessage !== errorMessage) ||
				(!errorMessage && this.nest.errorMessage)
			) {
				this._shouldUpdate = true;
				this.nest.errorMessage = errorMessage;
			}
		}

		_updateState() {
			if (this._shouldUpdate) {
				this.forceUpdate();
				this._shouldUpdate = false;
			}
		}

		validate() {
			const {
				props: { validations, defaultErrorMessage, required },
				context: { [CONTEXT_NAME]: form },
				nest: { value },
			} = this;

			const isEmptyValue = isEmpty(value);

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

			form.validate();
		}

		_handleChange = (ev, value, ...rest) => {
			const { onChange } = this.props;
			const target = ev && ev.currentTarget;
			const hasTargetValue = target && !isUndefined(target.value);
			const val = hasTargetValue ? target.value : value;
			this.setValue(val);
			if (isFunction(onChange)) { onChange(ev, value, ...rest); }
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
