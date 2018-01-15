import PropTypes from 'prop-types';
import React, { Component } from 'react';
import nestify from './nestify';

const DEFAULT = 'on';

@nestify({
	value: {
		name: 'value',
		get: (value, props) => {
			if (value === false) {
				return;
			}
			if (value === true || props.checked) {
				return props.value || DEFAULT;
			}
		},
	},
	defaultValue: {
		name: 'value',
		get: (value, props) => {
			if (value === false) {
				return;
			}
			if (value === true || props.defaultChecked) {
				return props.value || DEFAULT;
			}
		},
	},
	onChange: (event) => event.currentTarget.checked,
})
export default class Checkbox extends Component {
	static propTypes = {
		nest: PropTypes.object.isRequired,
	};

	render() {
		const { nest, ...other } = this.props;
		return <input {...other} type="checkbox" />;
	}
}
