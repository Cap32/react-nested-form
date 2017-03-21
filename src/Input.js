
import React, { Component, PropTypes } from 'react';
import nestify from './nestify';

class Input extends Component {
	static propTypes = {
		onChange: PropTypes.func.isRequired,
	};

	_handleChange = (ev) => {
		const { value } = ev.currentTarget;
		this.props.onChange(ev, value);
	};

	render() {
		const {

			/* eslint-disable */
			setValue,
			errorMessage,
			isInvalid,
			isRequired,
			/* eslint-enable */

			...other,
		} = this.props;

		return (
			<input {...other} onChange={this._handleChange} />
		);
	}
}

export default nestify()(Input);
