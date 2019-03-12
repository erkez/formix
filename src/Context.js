// @flow

import * as React from 'react';
import { Map } from 'immutable';
import type { FormStateContextValue } from './types';

const noop = () => {
    throw new Error('Invalid call to empty context');
};

const Context: React.Context<FormStateContextValue> = React.createContext({
    fieldStates: Map(),
    getFieldState: noop,
    setFieldState: noop
});

export default Context;

export function useFormState(): FormStateContextValue {
    return React.useContext(Context);
}
