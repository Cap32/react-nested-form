
import React, { Component, PropTypes } from 'react';
import nestify from './nestify';

class Input extends Component {
	static propTypes = {
		nest: PropTypes.object.isRequired,
	};

	render() {
		const {
			nest: { onChange, onKeyPress },
			...other,
		} = this.props;

		return (
			<input {...other} onChange={onChange} onKeyPress={onKeyPress} />
		);
	}
}

export default nestify(Input);
