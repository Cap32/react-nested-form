
import React, { Component, PropTypes } from 'react';
import { emptyFunction, returnsTrue } from 'empty-functions';
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

export default class NestedForm extends Component {
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
				submit: this.submit.bind(this),
			},
		};
	}

	componentWillMount() {
		const { props: { name }, context } = this;

		this.nest = {
			isInvalid: false,
			value: undefined,
		};

		this._contextForm = (name && context[CONTEXT_NAME]) || {
			attach: emptyFunction,
			detach: emptyFunction,
			validate: returnsTrue,
			submit: returnsTrue,
		};

		this._contextForm.attach(this);
	}

	componentWillUnmount() {
		this._contextForm.detach(this);
	}

	_childrens = [];

	_hasChanged = false;

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
		this._hasChanged = true;
		this.validate();
	}

	getValue() {
		if (!this._hasChanged) { return this.nest.value; }

		const newValue = this._childrens.reduce((data, child) => {
			const { props: { name } } = child;

			if (!name) { return data; }

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
						`[ReactNestedForm]: Multi names called \`${realName}\`! ` +
						`If you wanna use array, please use \`${realName}[]\` instead.`
					);
				}
				data[realName] = value;
			}
			return data;
		}, {});

		this.nest.value = newValue;
		this._hasChanged = false;

		return newValue;
	}

	validate() {
		const { nest } = this;
		const isInvalid = this._childrens.every(
			(child) => child.nest.isInvalid || child.nest.isRequired
		);

		if (isInvalid !== nest.isInvalid) {
			const { onValid, onInvalid } = this.props;
			nest.isInvalid = isInvalid;
			this._contextForm.validate();
			this.forceUpdate();

			if (isInvalid) { onInvalid(); }
			else { onValid(); }
		}
	}

	reset() {
		this._childrens.forEach((child) => child.reset());
	}

	setAsPristine() {
		this._childrens.forEach((child) => child.setAsPristine());
	}

	submit(callback = emptyFunction) {
		const { isInvalid } = this.nest;
		const value = this.getValue();
		const state = {
			isInvalid,
			isStoppedPropagation: false,
			stopPropagation() {
				state.isStoppedPropagation = true;
			},
		};
		this.props.onSubmit(value, state);
		callback(value, state);

		if (!state.isStoppedPropagation) {
			this._contextForm.submit();
		}
	}

	_handleSubmit = (ev) => {
		ev.preventDefault();
		// this.submit();
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
