import { createFormatDataTypeFunc as createFormator } from './DataTypes';
import { createFormatEmptyFunc } from './utils';

const filterFn = function filterFn(Component, methodName, propName) {
	Component.prototype[methodName] = function (val) {
		const { props, props: { dataType, formatEmptyValue } } = this;
		const ioFilters = props[propName] || [];
		const isInputDate = propName === 'inputFilter' && dataType === 'date';
		const finalDataType = isInputDate ? 'dateTime' : dataType;
		const headFilter = finalDataType ? [createFormator(finalDataType)] : [];
		const lastFilter = createFormatEmptyFunc(formatEmptyValue);
		const filters = headFilter.concat(ioFilters).concat(lastFilter);
		return filters.reduce((res, fn) => fn(res, props), val);
	};
};

export function getInput(Component) {
	return filterFn(Component, '_getInput', 'inputFilter');
}

export function getOutput(Component) {
	return filterFn(Component, '_getOutput', 'outputFilter');
}
