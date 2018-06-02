// @flow

import { Seq, List } from 'immutable';
import { None } from '@ekz/option';
import type {
    FieldRefType,
    FieldRef,
    ArrayFieldRef,
    FieldState,
    ArrayFieldState,
    FormContextValue
} from './types';

class FieldRefImpl<A> implements FieldRef<A> {
    type = 'Value';

    initialState: FieldState<A>;

    constructor(initialValue: A, initialDisabled: boolean = false) {
        Object.defineProperty(this, 'initialState', {
            value: makeInitialFieldState(initialValue, initialDisabled)
        });
    }
}

class ArrayFieldRefImpl<A, T: FieldRefType<any>> implements ArrayFieldRef<A, T> {
    type: 'List';

    itemTemplate: A => T;
    defaultItemValue: A;

    initialState: ArrayFieldState<T>;

    constructor(
        initialItems: A[],
        itemTemplate: A => T,
        defaultItemValue: A,
        initialDisabled: boolean = false
    ) {
        Object.defineProperty(this, 'initialState', {
            value: makeInitialFieldState(
                List(initialItems.map(item => itemTemplate(item))),
                initialDisabled
            )
        });

        Object.defineProperty(this, 'itemTemplate', { value: itemTemplate });
        Object.defineProperty(this, 'defaultItemValue', { value: defaultItemValue });
    }
}

export function defineField<A>(initialValue: A, initialDisabled?: boolean): FieldRef<A> {
    return new FieldRefImpl(initialValue, initialDisabled);
}

export function defineArrayField<A, T: FieldRefType<any>>(
    initialItems: A[],
    itemTemplate: A => T,
    defaultItemValue: A,
    initialDisabled?: boolean
): ArrayFieldRef<A, T> {
    return new ArrayFieldRefImpl(initialItems, itemTemplate, defaultItemValue, initialDisabled);
}

export function extractFieldValues<A: FieldRefType<any>>(
    fieldRef: A,
    fieldStates: $ElementType<FormContextValue, 'fieldStates'>
) {
    if (fieldRef instanceof FieldRefImpl) {
        return fieldStates.get(fieldRef, fieldRef.initialState).value;
    } else if (fieldRef instanceof ArrayFieldRefImpl) {
        return fieldStates
            .get(fieldRef, fieldRef.initialState)
            .value.map(field => extractFieldValues(field, fieldStates))
            .toArray();
    } else {
        // $FlowFixMe
        return Seq.Keyed(fieldRef)
            .map(field => extractFieldValues(field, fieldStates))
            .toObject();
    }
}

function makeInitialFieldState<A>(value: A, disabled: boolean): FieldState<A> {
    return Object.freeze({
        value,
        disabled,
        error: None,
        active: false,
        touched: false
    });
}
