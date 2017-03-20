
import React, { Component, PropTypes } from 'react';
import { emptyFunction, returnsArgument } from 'empty-functions';
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
		validator: PropTypes.func,
	};

	static defaultProps = {
		onSubmit: emptyFunction,
		onValid: emptyFunction,
		onInvalid: emptyFunction,
		validator: returnsArgument,
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

	_childrens = [];
	_value = undefined;

	hasChanged = false;

	attach(child) {
		if (child && child.props && child.props.name && child.getValue &&
			this._childrens.indexOf(child) < 0
		) {
			this._childrens.push(child);
			this.handleChange();
		}
		else {
			console.warn('"attach()" argument is INVALID');
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
	}

	getValue() {
		if (!this.hasChanged) { return this._value; }

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

		this._value = newValue;
		this.hasChanged = false;

		return newValue;
	}

	_handleSubmit = (ev) => {
		ev.preventDefault();
		const value = this.getValue();
		this.props.onSubmit(ev, value);
		console.log('submit value:', value);
	};

	render() {
		const {
			props: {

				/* eslint-disable */
				onValid,
				onInvalid,
				validator,
				/* eslint-enable */

				...other,
			},
			context,
		} = this;
		const Comp = context[CONTEXT_NAME] ? 'div' : 'form';

		return (
			<Comp {...other} onSubmit={this._handleSubmit} />
		);
	}
}
