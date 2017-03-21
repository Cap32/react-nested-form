
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
				isRequired: PropTypes.bool,
			};

			static defaultProps = {
				isRequired: false,
				defaultErrorMessage: 'Error',
			};

			static contextTypes = {
				[CONTEXT_NAME]: PropTypes.object.isRequired,
			};

			isValid = true;
			errorMessage: '';

			prevValue = undefined;
			value = this.props.defaultValue;

			componentWillMount() {
				if (this.value) { this.validate(); }
				this.context[CONTEXT_NAME].attach(this);
			}

			componentWillUnmount() {
				this.context[CONTEXT_NAME].detach(this);
			}

			getValue() {
				return this.value;
			}

			setValue(value) {
				if (this.prevValue !== value) {
					this.prevValue = this.value;
					this.value = value;
					this.validate();
				}
				return this.value;
			}

			// TODO: should use bounce/throttle
			_setStateSync(state) {

				// TODO: should use `assign()` polyfill
				Object.assign(this, state);

				this.forceUpdate();
			}

			_setErrorMessage(errorMessage) {
				if (errorMessage && this.errorMessage !== errorMessage) {
					this._setStateSync({ errorMessage, isValid: false });
				}
			}

			_clearErrorMessage() {
				if (this.errorMessage) {
					this._setStateSync({ errorMessage: '', isValid: true });
				}
			}

			validate() {
				const {
					props: { validations, defaultErrorMessage, isRequired },
					context: { [CONTEXT_NAME]: form },
					value, isValid,
				} = this;

				const getErrorMessage = () => {
					if (!validations) { return ''; }

					const invalidation = []
						.concat(validations)

						// TODO: should polyfill `find()`
						.find((valid) => {
							const fn = isFunction(valid) ? valid : valid.validator;
							return !fn(value);
						})
					;

					if (invalidation) {
						const maybeMsg = invalidation.message || defaultErrorMessage;
						const message = isFunction(maybeMsg) ? maybeMsg(value) : maybeMsg;
						return message;
					}

					return '';
				};

				const errorMessage = getErrorMessage();

				if (errorMessage) {
					if (isValid && form) { form.validate(); }
					this._setErrorMessage(errorMessage);
					return false;
				}
				else {
					if (!isValid && form) { form.validate(); }
					this._clearErrorMessage();
					return true;
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
						isRequired,
						/* eslint-enable */

						...other,
					},
					errorMessage,
					isValid,
				} = this;
				return (
					<WrappedComponent
						{...other}
						errorMessage={errorMessage}
						isValid={isValid}
						onChange={this._handleChange}
					/>
				);
			}
		}

		return hoistStatics(Nestable, WrappedComponent);
	};
}
