// @flow

import * as React from 'react';
import { Map } from 'immutable';
import type { FormStateContextValue, FormAccessors } from './types';

const noop = () => {
    throw new Error('Invalid call to empty context');
};

const Context: React.Context<FormStateContextValue> = React.createContext({
    fieldStates: Map(),
    getFieldState: noop,
    setFieldState: noop
});

export default Context;

type Props = {
    children: FormAccessors => React.Node
};

export function WithFormAccessors(props: Props) {
    return (
        <Context.Consumer>
            {({ getFieldState }) => props.children({ getFieldState })}
        </Context.Consumer>
    );
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

export function useFormState(): FormStateContextValue {
    return React.useContext(Context);
}
