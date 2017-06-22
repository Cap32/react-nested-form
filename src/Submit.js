
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import submittify from './submittify';

@submittify({ onSubmit: 'onClick' })
export default class Submit extends Component {
	static propTypes = {
		nest: PropTypes.object.isRequired,
	};

	render() {
		const { nest, ...other } = this.props;

		return (
			<button {...other} type="button" />
		);
	}
}
