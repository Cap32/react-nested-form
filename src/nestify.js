
import React, { Component, PropTypes } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import { ValidationPropType, isFunction, isUndefined } from './utils';
import find from 'array-find';
import { CONTEXT_NAME } from './constants';

export default function nestify(WrappedComponent/*, options*/) {
	class Nestify extends Component {
		static propTypes = {
			name: PropTypes.string.isRequired,
			defaultValue: PropTypes.any,
			validations: ValidationPropType,
			defaultErrorMessage: PropTypes.string,
			required: PropTypes.bool,
			onChange: PropTypes.func,
		};

		static defaultProps = {
			defaultValue: '',
			required: false,
			defaultErrorMessage: 'Error',
		};

		static contextTypes = {
			[CONTEXT_NAME]: PropTypes.object.isRequired,
		};

		componentWillMount() {
			this.nest = {
				isInvalid: false,
				isRequired: false,
				isPristine: true,
				errorMessage: '',
				value: this.props.defaultValue,
			};

			this.pristineValue = this.nest.value;

			this.validate();
			this._shouldUpdate = false;

			this.context[CONTEXT_NAME].attach(this);
		}

		componentWillUnmount() {
			this.context[CONTEXT_NAME].detach(this);
		}

		getValue() {
			return this.nest.value;
		}

		_requestFormValidate() {
			this.context[CONTEXT_NAME].validate();
		}

		_updateValue(value, isReset = false) {
			this.nest.value = value;
			this.validate();
			this._setPristine(isReset);
			this._updateState();
		}

		setValue = (value) => {
			if (this.nest.value !== value) {
				this._updateValue(value);
			}
			return this.nest.value;
		};

		reset = () => {
			this._updateValue(this.pristineValue, true);
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

		// TODO: should use bounce/throttle
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

			const isEmpty = !value && value !== 0;

			if (required && isEmpty) {
				this._setErrorMessage();
				this._setInvalid(false);
				this._setRequired(true);
			}
			else if (!required && isEmpty) {
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
			const val = isUndefined(target.value) ? value : target.value;
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
					required,
					/* eslint-enable */

					...other,
				},
				context: {
					[CONTEXT_NAME]: form,
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
						attach: form.attach,
						detach: form.detach,
					}}
				/>
			);
		}
	}

	return hoistStatics(Nestify, WrappedComponent);
}
