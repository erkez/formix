// @flow

import * as React from 'react';
import { useFormix } from './Form';
import type { FieldRef, FieldState } from './types';

export function useFieldState<T>(field: FieldRef<T>): FieldState<T> {
    const formix = useFormix();
    return formix.getFieldState(field);
}

export function useFieldValue<T>(field: FieldRef<T>): [T, (value: T, touched?: boolean) => void] {
    const formix = useFormix();

    const value = formix.getFieldState(field).value;
    const setValue = React.useCallback(
        (nextValue, touched) => {
            formix.setFieldValue(field, nextValue, touched);
        },
        [value, field]
    );

    return [value, setValue];
}
