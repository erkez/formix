// @flow

import * as React from 'react';
import { Map } from 'immutable';
import type { FormContextValue, FormAccessors } from './types';

const noop = () => {
    throw new Error('Invalid call to empty context');
};

const ContextInitialValue: FormContextValue = {
    fieldStates: Map(),
    formAccessors: {
        getFieldState: noop,
        getArrayFieldState: noop
    },
    setFieldState: noop
};

const { Provider, Consumer }: React.Context<FormContextValue> = React.createContext(
    ContextInitialValue
);

export { Provider, Consumer };

type Props = {
    children: FormAccessors => React.Node
};

export function WithFormAccessors(props: Props) {
    return <Consumer>{({ formAccessors }) => props.children(formAccessors)}</Consumer>;
}

export function withFormAccessors<P: {}, WC: React.ComponentType<P>>(
    WrappedComponent: WC
): React.ComponentType<$Diff<React.ElementConfig<WC>, { formAccessors: FormAccessors | void }>> {
    return function WithFormixValidators(props) {
        return (
            <WithFormAccessors>
                {formAccessors => <WrappedComponent {...props} formAccessors={formAccessors} />}
            </WithFormAccessors>
        );
    };
}
