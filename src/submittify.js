
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import { CONTEXT_NAME } from './constants';
import noop from 'empty-functions';
import Mapper from './Mapper';

export default function submittify(options) {
	const mapper = new Mapper(options, {
		onSubmit: noop,
		onReset: noop,
	});

	return function createNestedComponent(WrappedComponent) {
		class Submittify extends Component {
			static contextTypes = {
				[CONTEXT_NAME]: PropTypes.object.isRequired,
			};

			componentWillMount() {
				this._mapperHandlers = mapper.getHandlers(this);
			}

			handlers = {
				onSubmit: () => {
					this.context[CONTEXT_NAME].submit();
				},
				onReset: () => {
					this.context[CONTEXT_NAME].reset();
				},
			};

			render() {
				const {
					context: { [CONTEXT_NAME]: form },
					props,
					_mapperHandlers,
				} = this;
				return (
					<WrappedComponent
						{...props}
						{..._mapperHandlers}
						nest={{
							submit: form.submit,
							reset: form.reset,
						}}
					/>
				);
			}
		}

		return hoistStatics(Submittify, WrappedComponent);
	};
}
