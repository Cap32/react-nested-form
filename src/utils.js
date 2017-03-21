
import { PropTypes } from 'react';

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

export const isFunction = function isFunction(target) {
	return typeof target === 'function';
};

export const isValidChild = function isValidChild(c) {
	if (c && c.props && c.getValue && c.reset && c.setAsPristine) {
		return true;
	}
	else {
		console.warn('[ReactNestedForm]: child is INVALID.');
		return false;
	}
};
