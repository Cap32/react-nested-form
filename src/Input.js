
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import nestify from './nestify';

@nestify()
class Input extends Component {
	static propTypes = {
		nest: PropTypes.object.isRequired,
	};

	render() {
		const { nest, ...other } = this.props;
		return (
			<input {...other} />
		);
	}
}

export default Input;
