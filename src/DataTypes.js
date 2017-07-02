
import { isEmpty, isDate, isString, isNumber, isByte, padEnd } from './utils';
import warning from 'warning';

const tsToDate = (n) => new Date(+padEnd(n, 13, '0')).toISOString();

const toInt = (val) => isEmpty(val) ? 0 : (parseInt(val, 10) || 0);
const toNumber = (val) => isEmpty(val) ? 0 : (+val || 0);
const toStr = (val) => isEmpty(val) ? '' : (val + '');
const toBoolean = (val) => isEmpty(val) ? false : !!val;
const toByte = (val) => {
	const formated = toStr(val);
	warning(isByte(formated), `${val} is NOT a valid Byte type`);
	return formated;
};

const toDateTime = (val) => {
	if (isEmpty(val)) { return; }

	if (isString(val) && val.includes(',')) {
		return val.split(',').map(toDateTime);
	}
	else if (Array.isArray(val)) {
		return val.map(toDateTime);
	}

	if (isDate(val)) { return val.toISOString(); }
	else if (isNumber(val)) { return tsToDate(val); }
	else if (isString(val)) {
		if (/^\d*$/.test(val)) { return tsToDate(val); }
		return new Date(val).toISOString();
	}
	warning(false, `${val} is NOT a valid dateTime type`);
	return val;
};

const toDate = (val) => {
	if (isEmpty(val)) { return; }

	if (isString(val) && val.includes(',')) {
		return val.split(',').map(toDate);
	}
	else if (Array.isArray(val)) {
		return val.map(toDate);
	}

	const dateTime = toDateTime(val);
	if (isString(dateTime)) {
		const [date] = dateTime.split('T');
		warning(date, `${val} is NOT a valid date type`);
		return date;
	}
	return val;
};

const DataTypes = {
	integer: toInt,
	long: toInt,
	float: toNumber,
	double: toNumber,
	string: toStr,
	byte: toByte,
	boolean: toBoolean,
	date: toDate,
	dateTime: toDateTime,
	password: toStr,
};

export default DataTypes;

export const DataTypeKeys = Object.keys(DataTypes);

export function createFormatDataTypeFunc(type) {
	return function formatDataType(val) {
		return isString(type) ? DataTypes[type](val) : type(val);
	};
}
