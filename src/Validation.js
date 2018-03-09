import {
	isFunction,
	isUndefined,
	isString,
	isEmpty,
	globalDefaultErrorMessages,
	validationKeys,
} from './utils';
import find from 'array-find';
import warning from 'warning';

const createValidator = (type, expected) =>
	function schemaValidator(received) {
		switch (type) {
			case 'maximum':
				return received <= expected;
			case 'exclusiveMaximum':
				return received < expected;
			case 'minimum':
				return received >= expected;
			case 'exclusiveMinimum':
				return received > expected;
			case 'maxLength':
				return (received + '').length <= expected;
			case 'minLength':
				return (received + '').length >= expected;
			case 'pattern':
				return expected.test(received);
			case 'enum':
				return expected.indexOf(received) > -1;
			default:
				return expected(received);
		}
	};

export default class Validation {
	constructor(reactInstance, required, propValidations, defaultErrorMessage) {
		const validations = [].concat(propValidations);
		this._reactInstance = reactInstance;
		this._errors = this._getErrors(defaultErrorMessage);
		this.state = {
			hasRequiredProp: this._getRequiredProp(required, validations),
			errorMessage: '',
			isValid: true,
			isRequired: false,
			isOk: true,
		};
		this._validations = this._getValidations(validations);
	}

	_getErrors(defaultErrorMessage) {
		if (isString(defaultErrorMessage)) {
			defaultErrorMessage = { other: defaultErrorMessage };
		}

		return {
			...globalDefaultErrorMessages,
			...defaultErrorMessage,
		};
	}

	_getRequiredProp(required, propValidations) {
		if (required) {
			return true;
		}

		const requiredValidation = propValidations.find((v) => v && v.required);
		if (requiredValidation) {
			if (requiredValidation.message) {
				this._errors.required = requiredValidation.message;
			}
			delete requiredValidation.required;
			return true;
		}
		return false;
	}

	_getValidations(validations) {
		const { _errors } = this;

		return validations
			.filter(Boolean)
			.map((validator) => (isFunction(validator) ? { validator } : validator))
			.reduce((flatten, validation) => {
				const { message } = validation;
				Object.keys(validation)
					.filter((key) => key !== 'message')
					.forEach((key) => {
						if (validationKeys.indexOf(key) < 0) {
							const validationKeysText = validationKeys.join(', ');
							warning(
								false,
								`[ReactNestedForm]: Validation key "${key}" is INVALID. Only [${validationKeysText}] or "message" is valid.`,
							);
						}
						else {
							const expected = validation[key];
							flatten.push({
								validator: createValidator(key, expected),
								message: message || _errors[key],
								__expected: expected,
							});
						}
					});
				return flatten;
			}, []);
	}

	addRule(key, expected) {
		if (!isUndefined(expected)) {
			this._validations.unshift({
				message: this._errors[key],
				validator: createValidator(key, expected),
				__expected: expected,
			});
		}
		return this;
	}

	_getErrorMessage(error, expected) {
		if (!error) {
			return '';
		}
		return isString(error) ? error : error(expected);
	}

	_setState(state) {
		const instance = this._reactInstance;
		const { nest } = instance;
		let changed = false;
		const merge = function merge(prop) {
			const val = state[prop];
			if (nest[prop] !== val) {
				changed = true;
				nest[prop] = val;
			}
		};
		Object.keys(state).forEach(merge);
		if (changed) {
			instance.forceUpdate();
		}
	}

	validate(value) {
		const { _errors, _validations, state } = this;
		const isEmptyValue = isEmpty(value);

		state.errorMessage = '';
		state.isValid = true;
		state.isRequired = false;

		if (state.hasRequiredProp && isEmptyValue) {
			state.errorMessage = _errors.required || 'required';
			state.isRequired = true;
		}
		else if (!isEmptyValue) {
			const invalid = find(_validations, ({ validator }) => !validator(value));

			if (invalid) {
				const message = invalid.message;
				const expected = invalid.__expected || '[Validator Function]';
				state.isValid = false;
				state.errorMessage = this._getErrorMessage(message, expected);
			}
		}

		state.ok = state.isValid && !state.isRequired;
		return this;
	}

	throw(error) {
		if (error) {
			this._setState({
				errorMessage: error.reason || error.message,
				isValid: false,
				ok: false,
			});
		}
	}
}
