
import {
	isFunction, isUndefined, isString, isEmpty, getGlobalDefaultErrorMessages,
} from './utils';
import find from 'array-find';

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
			...getGlobalDefaultErrorMessages(),
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
				enum: oneOf,
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
		;

		const add = (type, value) => {
			!isUndefined(value) && validations.unshift({
				message: _errors[type],
				[type]: value,
			});
		};

		add('maximum', maximum);
		add('exclusiveMaximum', exclusiveMaximum);
		add('minimum', minimum);
		add('exclusiveMinimum', exclusiveMinimum);
		add('maxLength', maxLength);
		add('minLength', minLength);
		add('pattern', pattern);
		add('oneOf', oneOf);

		return validations;
	}

	_getErrorMessage(error, name, received, expected) {
		if (!error) { return ''; }
		return isString(error) ? error : error(name, received, expected);
	}

	validate(name, value) {
		const {
			_errorMessages,
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
				_errorMessages.required, name, value, 'required',
			);
			result.isRequired = true;
		}
		else if (!isEmptyValue) {
			const invalid = find(_validations, (valid) => {
				const validator = isFunction(valid) ? valid : valid.validator;
				return !validator(value);
			});

			if (invalid) {
				const message = invalid.message || _errorMessages.other;
				result.isInvalid = true;
				result.errorMessage = this._getErrorMessage(
					message, name, value, '[Validator Function]',
				);
			}
		}

		return result;
	}
}
