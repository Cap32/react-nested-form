
import React, { Component, PropTypes } from 'react';
import { emptyFunction, returnsTrue, returnsArgument } from 'empty-functions';
import { ValidationPropType, isValidChild } from './utils';
import { CONTEXT_NAME } from './constants';

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
				validate: this.validate.bind(this),
			},
		};
	}

	componentWillMount() {
		const contextForm = this.context[CONTEXT_NAME];
		this._contextForm = contextForm || {
			attach: emptyFunction,
			detach: emptyFunction,
			validate: returnsTrue,
		};

		this._contextForm.attach(this);
	}

	componentWillUnmount() {
		this._contextForm.detach(this);
	}

	_childrens = [];

	isInvalid = true;

	value = undefined;

	hasChanged = false;

	attach(child) {
		if (isValidChild(child) && this._childrens.indexOf(child) < 0) {
			this._childrens.push(child);
			this.handleChange();
		}
	}

	detach(child) {
		if (child) {
			const index = this._childrens.indexOf(child);
			if (index > -1) {
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

	validate() {
		const isInvalid = this._childrens.every(
			(child) => child.isInvalid || child.isRequired
		);
		if (isInvalid !== this.isInvalid) {
			this.isInvalid = isInvalid;
			this._contextForm.validate();
			this.forceUpdate();
		}
	}

	_handleSubmit = (ev) => {
		ev.preventDefault();
		const { isInvalid } = this;
		const value = this.getValue();
		this.props.onSubmit(value, {
			isInvalid,
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
