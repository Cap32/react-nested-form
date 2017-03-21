
import React, { Component, PropTypes } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import { ValidationPropType, isFunction } from './utils';
import find from 'array-find';
import { emptyFunction, returnsTrue, returnsArgument } from 'empty-functions';
import { CONTEXT_NAME } from './constants';

export default function nestify(options) {
	return (WrappedComponent) => {
		class Nestable extends Component {
			static propTypes = {
				name: PropTypes.string.isRequired,
				defaultValue: PropTypes.any,
				validations: ValidationPropType,
				defaultErrorMessage: PropTypes.string,
				required: PropTypes.bool,
			};

			static defaultProps = {
				required: false,
				defaultErrorMessage: 'Error',
			};

			static contextTypes = {
				[CONTEXT_NAME]: PropTypes.object.isRequired,
			};

			componentWillMount() {
				this.isInvalid = false;
				this.isRequired = false;
				this.isPristine = true;
				this.errorMessage = '';

				this.prevValue = undefined;
				this.value = this.props.defaultValue;
				this.pristineValue = this.value;

				this.validate();
				this._shouldUpdate = false;

				this.context[CONTEXT_NAME].attach(this);
			}

			componentWillUnmount() {
				this.context[CONTEXT_NAME].detach(this);
			}

			getValue() {
				return this.value;
			}

			_updateValue(value, isReset = false) {
				this.prevValue = this.value;
				this.value = value;
				this.validate();
				this._setPristine(isReset);
				this._updateState();
			}

			setValue = (value) => {
				if (this.prevValue !== value) {
					this._updateValue(value);
				}
				return this.value;
			};

			reset = () => {
				this._updateValue(this.pristineValue, true);
				return this.value;
			};

			setAsPristine() {
				if (this.pristineValue !== this.value) {
					this._shouldUpdate = true;
					this.pristineValue = this.value;
				}
				this._setPristine(true);
				this._updateState();
				return this.value;
			}

			_setRequired(isRequired) {
				if (this.isRequired !== isRequired) {
					this._shouldUpdate = true;
					this.isRequired = isRequired;
				}
			}

			_setInvalid(isInvalid) {
				if (this.isInvalid !== isInvalid) {
					this._shouldUpdate = true;
					this.isInvalid = isInvalid;
				}
			}

			_setPristine(isPristine) {
				if (this.isPristine !== isPristine) {
					this._shouldUpdate = true;
					this.isPristine = isPristine;
				}
			}

			_setErrorMessage(errorMessage = '') {
				if ((errorMessage && this.errorMessage !== errorMessage) ||
					(!errorMessage && this.errorMessage)
				) {
					this._shouldUpdate = true;
					this.errorMessage = errorMessage;
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
					value, isInvalid,
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
						if (!isInvalid) { form.validate(); }
					}
					else {
						this._setInvalid(false);
						this._setErrorMessage();
						if (isInvalid) { form.validate(); }
					}
				}

			}

			_handleChange = (ev, value) => {
				this.setValue(value);
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
					errorMessage,
					isInvalid,
				} = this;
				return (
					<WrappedComponent
						{...other}
						errorMessage={errorMessage}
						isInvalid={isInvalid}
						onChange={this._handleChange}
						setValue={this.setValue}
					/>
				);
			}
		}

		return hoistStatics(Nestable, WrappedComponent);
	};
}
