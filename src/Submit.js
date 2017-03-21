
import React, { Component, PropTypes } from 'react';
import { emptyFunction } from 'empty-functions';
import { CONTEXT_NAME } from './constants';

export default class Submit extends Component {
	static propTypes = {
		onClick: PropTypes.func,
		isHidden: PropTypes.bool,
		component: PropTypes.oneOfType([
			PropTypes.func,
			PropTypes.string,
		]),
		style: PropTypes.object,
	};

	static defaultProps = {
		onClick: emptyFunction,
		isHidden: false,
		component: 'span',
		style: {},
	};

	static contextTypes = {
		[CONTEXT_NAME]: PropTypes.object,
	};

	_handleClick = (ev) => {
		const {
			props: { onClick },
			context: { [CONTEXT_NAME]: form },
		} = this;
		form && form.submit();
		onClick(ev);
	};

	render() {
		const {

			/* eslint-disable */
			isHidden,
			component,
			/* eslint-enable */

			...other,
		} = this.props;

		return (
			<input
				{...other}
				onClick={this._handleClick}
				type="submit"
			/>
		);
	}
}
