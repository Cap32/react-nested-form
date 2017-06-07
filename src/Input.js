
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import nestify from './nestify';

class Input extends Component {
	static propTypes = {
		nest: PropTypes.object.isRequired,
		value: PropTypes.any,
		defaultValue: PropTypes.any,
	};

	componentWillMount() {
		const { defaultValue, nest } = this.props;
		if (defaultValue) { nest.setValue(defaultValue); }
	}

	componentWillReceiveProps({ value }) {
		if (this.props.value !== value) {
			this.props.nest.setValue(value);
		}
	}

	render() {
		const {
			nest: { onChange, onKeyPress, value },

			defaultValue, // omit

			...other,
		} = this.props;

		return (
			<input
				{...other}
				value={value}
				onChange={onChange}
				onKeyPress={onKeyPress}
			/>
		);
	}
}

export default nestify(Input);
