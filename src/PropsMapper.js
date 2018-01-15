/*
 * PropsMapper
 *
 * PropsMapper#constructor(reactInstance, options, defaultsOptions)
 *
 * `options` example:
 *
 * options = {
 * 	value: {
 * 		name: 'value',
 * 		get: (val) => val,
 * 	},
 * 	defaultValue: {
 * 		name: 'value',
 * 		get: (val) => val,
 * 	},
 * 	on[Handler]: (event) => event.currentTarget...
 * }
 *
 *
 * <Checkbox /> `options` example:
 *
 * options = {
 * 	defaultValue: {
 * 		name: 'defaultChecked',
 * 		get: (checked) => !!checked,
 * 	},
 * 	...
 * }
 */

import { isFunction, isString, isUndefined } from './utils';
import { noop } from 'empty-functions';

export default class PropsMapper {
	constructor(reactInstance, options = {}, defaults) {
		this._reactInstance = reactInstance;
		this._props = {};
		this._options = options;

		Object.keys(defaults).forEach((key) => this._merge(key, defaults[key]));
	}

	getInitialValue() {
		const reactProps = this._reactInstance.props;

		const valueProp = this._props.value;
		const reactPropValue = reactProps[valueProp.name];
		const value = valueProp.get(reactPropValue, reactProps);

		if (!isUndefined(value)) {
			return value;
		}

		const defaultValueProp = this._props.defaultValue;
		const defaultValue = reactProps[defaultValueProp.name];
		return defaultValueProp.get(defaultValue, reactProps);
	}

	getValue(originalValue) {
		return this._props.value.get(originalValue, this._reactInstance.props);
	}

	getValueProp() {
		return this._props.value;
	}

	getValues() {
		const { value } = this._reactInstance.nest;
		const valueProp = this._props.value;
		const defaultValueProp = this._props.defaultValue;
		return {
			[valueProp.name]: value,
			[defaultValueProp.name]: undefined,
		};
	}

	getHandlers() {
		return Object.keys(this._props).reduce((props, key) => {
			const prop = this._props[key];
			if (prop._isHandler) {
				props[prop.name] = this._getHandler(prop);
			}
			return props;
		}, {});
	}

	_getHandler(prop) {
		const { key, name, get } = isString(prop) ? this._props[prop] : prop;
		return (...args) => {
			const { handlers, props } = this._reactInstance;
			const value = get(...args);
			const res = handlers[key](value);
			isFunction(props[name]) && props[name](...args);
			return res;
		};
	}

	_parseMapValue(name, get = noop) {
		const mapValue = this._options[name];
		const res = { name, get };

		if (!mapValue) {
			return res;
		}

		if (isString(mapValue)) {
			res.name = mapValue;
		} else if (mapValue.name) {
			res.name = mapValue.name;
		}

		if (isFunction(mapValue)) {
			res.get = mapValue;
		} else if (mapValue.get) {
			res.get = mapValue.get;
		}

		return res;
	}

	_merge(key, defaultMap) {
		const { _props } = this;
		const { name, get } = this._parseMapValue(key, defaultMap);
		const _isHandler = /^on/.test(key);
		_props[key] = { key, name, get, _isHandler };
	}
}
