// @flow

import * as React from 'react';
import { List } from 'immutable';
import { Option, None } from '@ekz/option';
import { useFormState } from './Context';
import type {
    FieldRefType,
    FieldValidator,
    ArrayFieldBag,
    ArrayFieldState,
    ArrayFieldRef
} from './types';
import { validateField } from './validation';

type Props<A, T> = {
    field: ArrayFieldRef<A, T>,
    validator?: FieldValidator<List<T>>,
    resetWhenUnmounted?: boolean,
    children: (ArrayFieldBag<A, T>) => React.Node
};

export default function ArrayField<A, T: FieldRefType<any>>(props: Props<A, T>) {
    const arrayField = useArrayField(props.field, props.validator, props.resetWhenUnmounted);
    return props.children(arrayField);
}

export function useArrayField<A, T: FieldRefType<any>>(
    field: ArrayFieldRef<A, T>,
    validator?: FieldValidator<List<T>>,
    resetWhenUnmounted?: boolean
): ArrayFieldBag<A, T> {
    const { fieldStates, getFieldState, setFieldState } = useFormState();
    const fieldState: ArrayFieldState<T> = getFieldState(field);

    const error = React.useMemo(() => validateField(fieldState.value, validator, getFieldState), [
        fieldStates,
        validator,
        getFieldState
    ]);

    // Validation
    React.useEffect(() => {
        if (validator != null) {
            setFieldState(field, { error: Option.of(error) });
            return () => setFieldState(field, { error: None });
        }
    }, [field, validator, error]);

    // Value reset
    React.useEffect(
        () => () => {
            if (resetWhenUnmounted === true) {
                setFieldState(field, field.initialState);
            }
        },
        [field, resetWhenUnmounted]
    );

    return React.useMemo(() => ({
        items: fieldState.value,
        error: fieldState.error,
        disabled: fieldState.disabled,
        setDisabled: disabled => {
            setFieldState(field, { disabled });
        },
        map: fn => React.Children.toArray(fieldState.value.map(fn)),
        move: (from, to) => {
            checkBounds(fieldState.value, from);
            checkBounds(fieldState.value, to);

            let item = fieldState.value.get(from);

            if (item == null) {
                throw new Error('Invalid element access');
            }

            setFieldState(field, { value: fieldState.value.remove(from).insert(to, item) });
        },
        swap: (indexA, indexB) => {
            let itemA = fieldState.value.get(indexA);
            let itemB = fieldState.value.get(indexB);

            if (itemA == null || itemB == null) {
                throw new Error('Invalid element access');
            }

            setFieldState(field, {
                value: fieldState.value
                    .remove(indexA)
                    .insert(indexA, itemB)
                    .remove(indexB)
                    .insert(indexB, itemA)
            });
        },
        unshift: value => {
            let item = field.itemTemplate(value);
            setFieldState(field, { value: fieldState.value.unshift(item) });
            return item;
        },
        push: value => {
            let item = field.itemTemplate(value);
            setFieldState(field, { value: fieldState.value.push(item) });
            return item;
        },
        remove: item => {
            setFieldState(field, { value: fieldState.value.filter(x => x !== item) });
        }
    }));
}

function checkBounds(items: List<any>, index: number): void {
    if (index < 0 || index >= items.size) {
        throw new Error(`Index out of bounds, got ${index}`);
    }
}
