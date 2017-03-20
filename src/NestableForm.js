
import React, { Component, PropTypes } from 'react';
import { emptyFunction, returnsArgument } from 'empty-functions';
import { ValidationPropType, isValidChild } from './utils';
import Emitter from 'emit-lite';
import { CONTEXT_NAME, VALIDATION_STATE_CHANGE } from './constants';

const parseName = (name = '') => {
	const regExp = /\[\]$/;
	let isArray = false;
	name = (name + '').replace(regExp, () => {
		isArray = true;
		return '';
	});
	return { isArray, realName: name };
};

export default class NestableForm extends Component {
	static propTypes = {
		name: PropTypes.string,
		onSubmit: PropTypes.func,
		onValid: PropTypes.func,
		onInvalid: PropTypes.func,
		validations: ValidationPropType,
	};

	static defaultProps = {
		onSubmit: emptyFunction,
		onValid: emptyFunction,
		onInvalid: emptyFunction,
	};

	static contextTypes = {
		[CONTEXT_NAME]: PropTypes.object,
	};

	static childContextTypes = {
		[CONTEXT_NAME]: PropTypes.object,
	};

	getChildContext() {
		return {
			[CONTEXT_NAME]: {
				attach: this.attach.bind(this),
				detach: this.detach.bind(this),
			},
		};
	}

	componentWillMount() {
		const form = this.context[CONTEXT_NAME];
		form && form.attach(this);
	}

	componentWillUnmount() {
		const form = this.context[CONTEXT_NAME];
		form && form.detach(this);
	}

	_emitter = new Emitter();

	_childrens = [];

	isValid = true;

	value = undefined;

	hasChanged = false;

	attach(child) {
		if (isValidChild(child) && this._childrens.indexOf(child) < 0) {
			this._childrens.push(child);
			this._offChildValidStateChange =
				child.onValidStateChange(this._handleChildValidStateChange)
			;
			this.handleChange();
		}
	}

	detach(child) {
		if (child) {
			const index = this._childrens.indexOf(child);
			if (index > -1) {
				this._offChildValidStateChange();
				this._childrens.splice(index, 1);
				this.handleChange();
			}
		}
	}

	handleChange() {
		this.hasChanged = true;
		this.validate();
	}

	getValue() {
		if (!this.hasChanged) { return this.value; }

		const newValue = this._childrens.reduce((data, child) => {
			const { props: { name } } = child;
			const { isArray, realName } = parseName(name);
			const value = child.getValue();
			const dataValue = data[realName];
			if (isArray) {
				if (dataValue) { dataValue.push(value); }
				else { data[realName] = [value]; }
			}
			else {
				if (dataValue) {
					console.warn(
						`[ReactNestableForm]: Multi names called \`${realName}\`! ` +
						`If you wanna use array, please use \`${realName}[]\` instead.`
					);
				}
				data[realName] = value;
			}
			return data;
		}, {});

		this.value = newValue;
		this.hasChanged = false;

		return newValue;
	}

	_handleChildValidStateChange = ({ isValid }) => {
		this.validate();
	};

	onValidStateChange(fn) {
		this._emitter.on(VALIDATION_STATE_CHANGE, fn);
	}

	validate() {
		const isValid = this._childrens.every((child) => child.isValid);
		if (isValid !== this.isValid) {
			this.isValid = isValid;
			this._emitter.emit(VALIDATION_STATE_CHANGE, { isValid });
			this.forceUpdate();
		}
	}

	_handleSubmit = (ev) => {
		ev.preventDefault();
		const { isValid } = this;
		const value = this.getValue();
		this.props.onSubmit(ev, value, {
			isValid,
		});
		console.log('submit value:', value);
	};

	render() {
		const {
			props: {

				/* eslint-disable */
				onValid,
				onInvalid,
				validations,
				/* eslint-enable */

				...other,
			},
			context,
		} = this;
		const Comp = context[CONTEXT_NAME] ? 'div' : 'form';

		return (
			<Comp
				{...other}
				onSubmit={this._handleSubmit}
			/>
		);
	}
}
