// @flow

import { Seq, List } from 'immutable';
import { None } from '@ekz/option';
import { andThen } from './helpers';
import type {
    FieldRefType,
    FieldRef,
    MappedRef,
    ArrayFieldRef,
    FieldState,
    ArrayFieldState,
    FormAccessors
} from './types';

class FieldRefImpl<A> implements FieldRef<A> {
    type = 'Value';
    mappedTo: MappedRef<any, A> | null;
    initialState: FieldState<A>;

    constructor(initialValue: A, initialDisabled: boolean, mappedTo: MappedRef<any, A> | null) {
        Object.defineProperty(this, 'initialState', {
            value: makeInitialFieldState(initialValue, initialDisabled)
        });

        Object.defineProperty(this, 'mappedTo', { value: mappedTo });
    }
}

class ArrayFieldRefImpl<A, T: FieldRefType<any>> implements ArrayFieldRef<A, T> {
    type: 'List';
    mappedTo: MappedRef<any, List<T>> | null;

    itemTemplate: A => T;
    initialState: ArrayFieldState<T>;

    constructor(
        initialItems: A[],
        itemTemplate: A => T,
        initialDisabled: boolean,
        mappedTo: MappedRef<any, List<T>> | null
    ) {
        Object.defineProperty(this, 'initialState', {
            value: makeInitialFieldState(
                List(initialItems.map(item => itemTemplate(item))),
                initialDisabled
            )
        });

        Object.defineProperty(this, 'itemTemplate', { value: itemTemplate });

        Object.defineProperty(this, 'mappedTo', { value: mappedTo });
    }
}

export function defineField<A>(initialValue: A, initialDisabled: boolean = false): FieldRef<A> {
    return new FieldRefImpl(initialValue, initialDisabled, null);
}

export function defineArrayField<A, T: FieldRefType<any>>(
    initialItems: A[],
    itemTemplate: A => T,
    initialDisabled: boolean = false
): ArrayFieldRef<A, T> {
    return new ArrayFieldRefImpl(initialItems, itemTemplate, initialDisabled, null);
}

export function extractFieldValues<A: FieldRefType<any>>(
    fieldRef: A,
    getFieldState: $ElementType<FormAccessors, 'getFieldState'>
) {
    if (fieldRef instanceof FieldRefImpl) {
        return getFieldState(fieldRef).value;
    } else if (fieldRef instanceof ArrayFieldRefImpl) {
        // $FlowFixMe
        return getFieldState(fieldRef)
            .value.map(field => extractFieldValues(field, getFieldState))
            .toArray();
    } else {
        // $FlowFixMe
        return Seq.Keyed(fieldRef)
            .map(field => extractFieldValues(field, getFieldState))
            .toObject();
    }
}

export function mappedTo<T, U>(
    fieldRef: FieldRef<T>,
    fromSource: T => U,
    toSource: U => T
): FieldRef<U> {
    const mappedRef = {
        sourceRef: fieldRef,
        fromSource,
        toSource
    };

    // $FlowFixMe
    return new FieldRefImpl(undefined, false, mappedRef);
}

export function getFieldRefMapping<A>(
    fieldRef: FieldRef<A>,
    previousMappedTo: MappedRef<any, A> | null = null
): MappedRef<any, A> {
    if (fieldRef.mappedTo == null) {
        return previousMappedTo != null
            ? previousMappedTo
            : {
                  sourceRef: fieldRef,
                  fromSource: x => x,
                  toSource: x => x
              };
    }

    const mappedTo = fieldRef.mappedTo;

    return getFieldRefMapping(mappedTo.sourceRef, {
        sourceRef: mappedTo.sourceRef,
        fromSource:
            previousMappedTo == null
                ? mappedTo.fromSource
                : andThen(mappedTo.fromSource, previousMappedTo.fromSource),
        toSource:
            previousMappedTo == null
                ? mappedTo.toSource
                : andThen(previousMappedTo.toSource, mappedTo.toSource)
    });
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
