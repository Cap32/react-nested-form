
import React, { Component, PropTypes } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import { CONTEXT_NAME } from './constants';

export default function submitify(WrappedComponent/*, options*/) {
	class Submitify extends Component {
		static propTypes = {
			onClick: PropTypes.func,
		};

		static contextTypes = {
			[CONTEXT_NAME]: PropTypes.object.isRequired,
		};

		_handleClick = (...args) => {
			const {
				props: { onClick },
				context: { [CONTEXT_NAME]: form },
			} = this;
			form.submit();
			onClick && onClick(...args);
		};

		render() {
			const { props, context: { [CONTEXT_NAME]: form } } = this;
			return (
				<WrappedComponent
					{...props}
					nest={{
						onClick: this._handleClick,
						submit: form.submit,
						reset: form.reset,
					}}
				/>
			);
		}
	}

	return hoistStatics(Submitify, WrappedComponent);
}
