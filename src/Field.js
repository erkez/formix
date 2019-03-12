// @flow

import * as React from 'react';
import { None } from '@ekz/option';
import { useFormState } from './Context';
import type { FieldRef, FieldState, FieldBag, FieldValidator } from './types';
import { validateField } from './validation';

type Props<A> = {
    field: FieldRef<A>,
    validator?: FieldValidator<A>,
    resetWhenUnmounted?: boolean,
    children: (FieldBag<A>) => React.Node
};

export default function Field<A>(props: Props<A>) {
    const field = useField(props.field, props.validator, props.resetWhenUnmounted);
    return props.children(field);
}

export function useField<T>(
    field: FieldRef<T>,
    validator?: FieldValidator<T>,
    resetWhenUnmounted?: boolean
): FieldBag<T> {
    const { fieldStates, getFieldState, setFieldState } = useFormState();
    const fieldState: FieldState<T> = getFieldState(field);

    const error = React.useMemo(() => validateField(fieldState.value, validator, getFieldState), [
        fieldStates,
        validator,
        getFieldState
    ]);

    // Validation
    React.useEffect(() => {
        setFieldState(field, { error });
        return () => setFieldState(field, { error: None });
    }, [field, error]);

    // Value reset
    React.useEffect(
        () => () => {
            if (resetWhenUnmounted === true) {
                setFieldState(field, field.initialState);
            }
        },
        [field, resetWhenUnmounted]
    );

    const setValue = React.useCallback(value => setFieldState(field, { value, touched: true }), [
        field
    ]);

    const setDisabled = React.useCallback(disabled => setFieldState(field, { disabled }), [field]);

    const onFocus = React.useCallback(() => setFieldState(field, { active: true, touched: true }), [
        field
    ]);

    const onBlur = React.useCallback(() => setFieldState(field, { active: false }), [field]);

    return React.useMemo(() => ({ ...fieldState, setValue, setDisabled, onFocus, onBlur }), [
        fieldState,
        setValue,
        setDisabled,
        onFocus,
        onBlur
    ]);
}
