
import React, { Component, PropTypes } from 'react';
import submitify from './submitify';

class Reset extends Component {
	static propTypes = {
		nest: PropTypes.object.isRequired,
		onClick: PropTypes.func,
	};

	_handleClick = (ev) => {
		const { onClick, nest } = this.props;
		nest.reset();
		onClick && onClick(ev);
	};

	render() {
		const {
			nest, // eslint-disable-line
			...other,
		} = this.props;

		return (
			<button {...other} onClick={this._handleClick} type="button" />
		);
	}
}

export default submitify(Reset);
