
import { PropTypes } from 'react';
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

export const isFunction = function isFunction(target) {
	return typeof target === 'function';
};

export const isUndefined = function isUndefined(target) {
	return typeof target === 'undefined';
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
