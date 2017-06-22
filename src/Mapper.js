
import { isFunction, isString, isUndefined } from './utils';
import { noop } from 'empty-functions';

export default class Mapper {
	constructor(options = {}, defaults) {
		this._props = {};
		this._options = options;

		Object
			.keys(defaults)
			.forEach((key) => this._merge(key, defaults[key]))
		;
	}

	getInitialValue(reactInstance) {
		const reactProps = reactInstance.props;

		const valueProp = this._props['value'];
		const value = reactProps[valueProp.name];

		if (!isUndefined(value)) { return valueProp.map(value); }

		const defaultValueProp = this._props['defaultValue'];
		const defaultValue = reactProps[defaultValueProp.name];

		if (!isUndefined(defaultValue)) {
			return defaultValueProp.map(defaultValue);
		}
	}

	getValueProp() {
		return this._props['value'];
	}

	getValues(reactInstance) {
		const { value } = reactInstance.nest;
		const valueProp = this._props['value'];
		const defaultValueProp = this._props['defaultValue'];
		return {
			[valueProp.name]: value || '',
			[defaultValueProp.name]: undefined,
		};
	}

	getHandlers(reactInstance) {
		return Object
			.keys(this._props)
			.reduce((props, key) => {
				const prop = this._props[key];
				if (prop._isHandler) {
					props[prop.name] = this._getHandler(reactInstance, prop);
				}
				return props;
			}, {})
		;
	}

	_getHandler(reactInstance, prop) {
		const { key, name, map } = isString(prop) ? this._props[prop] : prop;
		return (...args) => {
			const { handlers, props } = reactInstance;
			const value = map(...args);
			const res = handlers[key](value);
			isFunction(props[name]) && props[name](...args);
			return res;
		};
	}

	_parseMapValue(name, map = noop) {
		const mapValue = this._options[name];
		const res = { name, map };

		if (!mapValue) { return res; }

		if (isString(mapValue)) { res.name = mapValue; }
		else if (mapValue.name) { res.name = mapValue.name; }

		if (isFunction(mapValue)) { res.map = mapValue; }
		else if (mapValue.map) { res.map = mapValue.map; }

		return res;
	}

	_merge(key, defaultMap) {
		const { _props } = this;
		const { name, map } = this._parseMapValue(key, defaultMap);
		const _isHandler = /^on/.test(key);
		_props[key] = { key, name, map, _isHandler };
	}
}
