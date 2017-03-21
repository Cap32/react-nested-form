
import React, { Component, PropTypes } from 'react';
import submitify from './submitify';

class Submit extends Component {
	static propTypes = {
		nest: PropTypes.object.isRequired,
	};

	render() {
		const {
			nest,
			...other,
		} = this.props;

		return (
			<input {...other} {...nest} type="submit" />
		);
	}
}

export default submitify(Submit);
