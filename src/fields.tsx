import * as React from 'react';

import { useForm } from './form';
import { ArrayField, ArrayFieldRef, Field, FieldRef, GenericFieldRef } from './types';

export function useField<T>(fieldRef: FieldRef<T>): Field<T> {
    const { getFieldState, setFieldState, getValidationResult } = useForm();

    const fieldState = getFieldState(fieldRef);
    const validationResult = getValidationResult(fieldRef);

    const setValue = React.useCallback(
        (value: React.SetStateAction<T>) => {
            setFieldState<T>(fieldRef, (previousState) => {
                const nextValue: T =
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    typeof value === 'function' ? value(previousState.value) : value;

                return previousState.value === nextValue
                    ? previousState
                    : previousState.updated({
                          value: nextValue,
                          touched: true
                      });
            });
        },
        [fieldRef, setFieldState]
    );

    const setDisabled = React.useCallback(
        (disabled) => setFieldState(fieldRef, (state) => state.updated({ disabled })),
        [fieldRef, setFieldState]
    );

    const onFocus = React.useCallback(
        () => setFieldState(fieldRef, (state) => state.updated({ active: true, touched: true })),
        [fieldRef, setFieldState]
    );

    const onBlur = React.useCallback(
        () => setFieldState(fieldRef, (state) => state.updated({ active: false })),
        [fieldRef, setFieldState]
    );

    return React.useMemo(
        () => ({
            value: fieldState.value,
            ...validationResult,
            disabled: fieldState.disabled,
            active: fieldState.active,
            touched: fieldState.touched,
            setValue,
            setDisabled,
            onFocus,
            onBlur
        }),
        [fieldState, validationResult, setValue, setDisabled, onFocus, onBlur]
    );
}

export function useArrayField<T extends GenericFieldRef, V>(
    fieldRef: ArrayFieldRef<T, V>
): ArrayField<T, V> {
    const { getValidationResult } = useForm();

    const {
        value: items,
        setValue,
        disabled,
        active,
        touched,
        setDisabled,
        onBlur,
        onFocus
    } = useField(fieldRef);

    const validationResult = getValidationResult(fieldRef);

    const unshift = React.useCallback(
        (value: V) => {
            const item = fieldRef.itemTemplate(value);
            setValue((previous) => previous.unshift(item));
            return item;
        },
        [setValue, fieldRef]
    );

    const push = React.useCallback(
        (value: V) => {
            const item = fieldRef.itemTemplate(value);
            setValue((previous) => previous.push(item));
            return item;
        },
        [setValue, fieldRef]
    );

    const insert = React.useCallback(
        (index, value) => {
            const item = fieldRef.itemTemplate(value);
            setValue((items) => items.insert(index, item));
            return item;
        },
        [setValue, fieldRef]
    );

    const remove = React.useCallback(
        (value: T) => {
            setValue((previous) => {
                const index = previous.indexOf(value);
                return index !== -1 ? previous.remove(index) : previous;
            });
        },
        [setValue]
    );

    const swap = React.useCallback(
        (indexA, indexB) => {
            setValue((previous) => {
                const itemA = previous.get(indexA);
                const itemB = previous.get(indexB);

                if (itemA == null || itemB == null) {
                    throw new Error('Invalid element access');
                }

                return previous
                    .remove(indexA)
                    .insert(indexA, itemB)
                    .remove(indexB)
                    .insert(indexB, itemA);
            });
        },
        [setValue]
    );

    return React.useMemo(
        () => ({
            items,
            ...validationResult,
            unshift,
            push,
            insert,
            remove,
            swap,
            disabled,
            active,
            touched,
            setDisabled,
            onBlur,
            onFocus
        }),
        [
            items,
            validationResult,
            unshift,
            push,
            insert,
            remove,
            swap,
            disabled,
            active,
            touched,
            setDisabled,
            onBlur,
            onFocus
        ]
    );
}

type UseFieldProps<T> = {
    field: FieldRef<T>;
    render(field: Field<T>): React.ReactNode;
};

export function UseField<T>(props: UseFieldProps<T>): React.ReactElement {
    const field = useField(props.field);
    return <React.Fragment>{props.render(field)}</React.Fragment>;
}

type UseArrayFieldProps<T extends GenericFieldRef, V> = {
    field: ArrayFieldRef<T, V>;
    render(field: ArrayField<T, V>): React.ReactNode;
};

export function UseArrayField<T extends GenericFieldRef, V>(
    props: UseArrayFieldProps<T, V>
): React.ReactElement {
    const field = useArrayField(props.field);
    return <React.Fragment>{props.render(field)}</React.Fragment>;
}
