
import React, { Component, PropTypes } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import { isFunction } from './utils';
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
			if (isFunction(onClick)) { onClick(...args); }
		};

		render() {
			const { props, context: { [CONTEXT_NAME]: form } } = this;
			return (
				<WrappedComponent
					{...props}
					nest={{
						onClick: this._handleClick,
						onSubmit: form.submit,
					}}
				/>
			);
		}
	}

	return hoistStatics(Submitify, WrappedComponent);
}
