
import {
	isFunction, isUndefined, isString, isEmpty,
	globalDefaultErrorMessages, validationKeys,
} from './utils';
import find from 'array-find';
import warning from 'warning';

const createValidator = (type, expected) => function schemaValidator(received) {
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
	constructor(props) {
		this._props = props;
		this.required = false;
		this._errors = this._initErrors();
		this._validations = this._initValidations();
	}

	_initErrors() {
		let { defaultErrorMessage } = this._props;

		if (isString(defaultErrorMessage)) {
			defaultErrorMessage = { other: defaultErrorMessage };
		}

		return {
			...globalDefaultErrorMessages,
			...defaultErrorMessage,
		};
	}

	_initValidations() {
		const {
			_props: {
				validations: propValidations,
				required,
				maximum,
				exclusiveMaximum,
				minimum,
				exclusiveMinimum,
				maxLength,
				minLength,
				pattern,
				enum: _enum,
			},
			_errors,
		} = this;

		let validations = [].concat(propValidations);

		if (required) { this.required = true; }
		else {
			const requiredValidation = validations.find((v) => v && v.required);
			if (requiredValidation) {
				this.required = true;
				if (requiredValidation.message) {
					_errors.required = requiredValidation.message;
				}
				delete requiredValidation.required;
			}
		}

		validations = validations
			.filter(Boolean)
			.map((validator) => isFunction(validator) ? { validator } : validator)
			.reduce((flatten, validation) => {
				const { message } = validation;
				Object
					.keys(validation)
					.filter((key) => key !== 'message')
					.forEach((key) => {
						if (validationKeys.indexOf(key) < 0) {
							warning(
								false,
								`[ReactNestedForm]: Validation key "${key}" is INVALID. Only [${validationKeys.join(', ')}] or "message" is valid.`
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
					})
				;
				return flatten;
			}, [])
		;

		const add = (key, expected) => {
			!isUndefined(expected) && validations.unshift({
				message: _errors[key],
				validator: createValidator(key, expected),
				__expected: expected,
			});
		};

		add('maximum', maximum);
		add('exclusiveMaximum', exclusiveMaximum);
		add('minimum', minimum);
		add('exclusiveMinimum', exclusiveMinimum);
		add('maxLength', maxLength);
		add('minLength', minLength);
		add('pattern', pattern);
		add('enum', _enum);

		return validations;
	}

	_getErrorMessage(error, expected) {
		if (!error) { return ''; }
		return isString(error) ? error : error(expected);
	}

	validate(name, value) {
		const {
			_errors,
			_validations,
			required,
		} = this;

		const result = {
			errorMessage: '',
			isInvalid: false,
			isRequired: false,
		};

		const isEmptyValue = isEmpty(value);

		if (required && isEmptyValue) {
			result.errorMessage = this._getErrorMessage(
				_errors.required, name, value, 'required',
			);
			result.isRequired = true;
		}
		else if (!isEmptyValue) {
			const invalid = find(_validations, ({ validator }) => !validator(value));

			if (invalid) {
				const message = invalid.message;
				const expected = invalid.__expected || '[Validator Function]';
				result.isInvalid = true;
				result.errorMessage = this._getErrorMessage(message, expected);
			}
		}

		return result;
	}
}
