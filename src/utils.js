
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

export const isFunction = function isFunction(target) {
	return typeof target === 'function';
};

export const isString = function isString(target) {
	return typeof target === 'string';
};

export const isUndefined = function isUndefined(target) {
	return typeof target === 'undefined';
};

export const isEmpty = (value) =>
	isUndefined(value) || value === null || value === ''
;

export const isValidChild = function isValidChild(c) {
	if (c && c.props && c.nest && c.getValue && c.reset && c.setAsPristine) {
		return true;
	}
	else {
		warning(false, '[ReactNestedForm]: child is INVALID.');
		return false;
	}
};

/* eslint-disable max-len */
export const globalDefaultErrorMessages = {
	required: (name) => `"${name}" is required`,

	maximum: (name, received, expected) => `The value of "${name}" MUST less than or exactly equal to \`${expected}\`, but received \`${received}\``,

	exclusiveMaximum: (name, received, expected) => `The value of "${name}" MUST strictly less than (not equal to) \`${expected}\`, but received \`${received}\``,

	minimum: (name, received, expected) => `The value of "${name}" MUST greater than or exactly equal to \`${expected}\`, but received \`${received}\``,

	exclusiveMinimum: (name, received, expected) => `The value of "${name}" MUST strictly greater than (not equal to) \`${expected}\`, but received \`${received}\``,

	maxLength: (name, received, expected) => `The length of "${name}" MUST less than, or equal to \`${expected}\`, but received \`${received}\``,

	minLength: (name, received, expected) => `The length of "${name}" MUST greater than, or equal to \`${expected}\`, but received \`${received}\``,

	pattern: (name, received, expected) => `The value of "${name}" faled to match regular expression \`${expected}\`, which value is \`${received}\``,

	enum: (name, received, expected) => `The value of "${name}" MUST equal to one of [${expected.join(', ')}], but received \`${received}\``,

	validator: (name, received) => `Value \`${received}\` of "${name}" is INVALID`,
};
/* eslint-enable max-len */

export const validationKeys = Object.keys(globalDefaultErrorMessages);
