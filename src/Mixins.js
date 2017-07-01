
import { createFormatDataTypeFunc } from './DataTypes';

const filterFn = function filterFn(Component, methodName, propName) {
	Component.prototype[methodName] = function (val) {
		const { props, props: { dataType } } = this;
		const filters = props[propName] || [];
		const defaults = dataType ? [createFormatDataTypeFunc(dataType)] : [];
		return defaults.concat(filters).reduce((res, fn) => fn(res, props), val);
	};
};

export function getInput(Component) {
	return filterFn(Component, '_getInput', 'inputFilter');
}

export function getOutput(Component) {
	return filterFn(Component, '_getOutput', 'outputFilter');
}
