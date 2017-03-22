
import React, { Component, PropTypes } from 'react';
import submitify from './submitify';

class Submit extends Component {
	static propTypes = {
		nest: PropTypes.object.isRequired,
	};

	render() {
		const {
			nest: { onClick },
			...other,
		} = this.props;

		return (
			<button {...other} onClick={onClick} type="button" />
		);
	}
}

export default submitify(Submit);
