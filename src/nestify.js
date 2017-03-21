
import React, { Component, PropTypes } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import { ValidationPropType, isFunction } from './utils';
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

			isInvalid = false;
			isRequired = false;
			errorMessage: '';

			prevValue = undefined;
			value = this.props.defaultValue;

			_shouldUpdate = false;

			componentWillMount() {
				this.validate();
				this.context[CONTEXT_NAME].attach(this);
			}

			componentWillUnmount() {
				this.context[CONTEXT_NAME].detach(this);
			}

			getValue() {
				return this.value;
			}

			setValue = (value) => {
				if (this.prevValue !== value) {
					this.prevValue = this.value;
					this.value = value;
					this.validate();
				}
				return this.value;
			};

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
						const invalidation = []
							.concat(validations)

							// TODO: should inject `find()` polyfill
							.find((valid) => {
								const fn = isFunction(valid) ? valid : valid.validator;
								return !fn(value);
							})
						;

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

				this._updateState();
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
