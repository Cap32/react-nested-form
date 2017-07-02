/* eslint max-len:0 */

import PropTypes from 'prop-types';
import warning from 'warning';

const ValidationPropTypeShape = PropTypes.shape({
	validator: PropTypes.func.isRequired,
	message: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.func,
	]),
});

export const ValidationPropType = PropTypes.oneOfType([
	ValidationPropTypeShape,
	PropTypes.arrayOf(ValidationPropTypeShape),
	PropTypes.func,
]);

export const ComponentPropType = PropTypes.oneOfType([
	PropTypes.string,
	PropTypes.func,
]);

export const ErrorMessagePropType = PropTypes.oneOfType([
	PropTypes.string,
	PropTypes.func,
]);

export const FilterPropType = PropTypes.oneOfType([
	PropTypes.arrayOf(PropTypes.func),
	PropTypes.func,
]);

export const isFunction = function isFunction(target) {
	return typeof target === 'function';
};

export const isObject = function isObject(target) {
	return typeof target === 'object';
};

export const isString = function isString(target) {
	return typeof target === 'string';
};

export const isNumber = function isNumber(target) {
	return typeof target === 'number';
};

export const isUndefined = function isUndefined(target) {
	return typeof target === 'undefined';
};

export const isDate = function isDate(target) {
	return target && isFunction(target.toISOString);
};

export const isByte = function isByte(target) {
	return /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/.test(target);
};

export const isEmpty = (target) =>
	isUndefined(target) || target === null || target === ''
;

export const padEnd = function padEnd(target, length, fillString) {
	while (target.length < length) { target += fillString; }
	return target;
};

export const isValidChild = function isValidChild(c) {
	if (c && c.props && c.nest && c.getValue && c.reset && c.setAsPristine) {
		return true;
	}
	else {
		warning(false, '[ReactNestedForm]: child is INVALID.');
		return false;
	}
};

export const createFormatEmptyFunc = (formatEmptyValue) => {
	return function formatEmpty(val) {
		return isEmpty(val) && formatEmptyValue ? formatEmptyValue(val) : val;
	};
};

export const globalDefaultErrorMessages = {
	required: 'Required',

	maximum: (expected) => `Must less than or exactly equal to \`${expected}\``,

	exclusiveMaximum: (expected) => `Must strictly less than (not equal to) \`${expected}\``,

	minimum: (expected) => `Must greater than or exactly equal to \`${expected}\``,

	exclusiveMinimum: (expected) => `Must strictly greater than (not equal to) \`${expected}\``,

	maxLength: (expected) => `The length of value must less than, or equal to \`${expected}\``,

	minLength: (expected) => `The length of value must greater than, or equal to \`${expected}\``,

	enum: (expected) => `Must equal to one of [${expected.join(', ')}]`,

	pattern: 'Illegal',

	validator: 'Illegal',
};

export const validationKeys = Object.keys(globalDefaultErrorMessages);

export function setGlobalErrorMessages(messages) {
	if (isObject(messages)) {
		Object.keys(messages).forEach((key) => {
			if (validationKeys.indexOf(key) < 0) {
				warning(false, `[ReactNestedForm]: key "${key}" is INVALID.`);
			}
			else {
				globalDefaultErrorMessages[key] = messages[key];
			}
		});
	}
	else {
		warning(
			false,
			`[ReactNestedForm]: "messages" MUST be object, but received "${typeof messages}"`,
		);
	}
}
