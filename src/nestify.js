
import React, { Component, PropTypes } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import { CONTEXT_NAME } from './constants';

export default function nestify(options) {
	return (WrappedComponent) => {
		class Nestable extends Component {
			static propTypes = {
				name: PropTypes.string.isRequired,
				defaultValue: PropTypes.any,
			};

			static contextTypes = {
				[CONTEXT_NAME]: PropTypes.object.isRequired,
			};

			value = this.props.defaultValue;

			componentWillMount() {
				this.context[CONTEXT_NAME].attach(this);
			}

			componentWillUnmount() {
				this.context[CONTEXT_NAME].detach(this);
			}

			getValue() {
				return this.value;
			}

			setValue(value) {
				return this.value = value;
			}

			_handleChange = (ev, value) => {
				this.setValue(value);
			};

			render() {
				const { props, state } = this;
				return (
					<WrappedComponent
						{...props}
						{...state}
						onChange={this._handleChange}
					/>
				);
			}
		}

		return hoistStatics(Nestable, WrappedComponent);
	};
}
