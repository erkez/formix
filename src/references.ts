import { List, Seq } from 'immutable';

import FieldStateImpl from './FieldState';
import { ArrayFieldRef, FieldRef, FieldState, GenericFieldRef } from './types';

class FieldRefImpl<V> implements FieldRef<V> {
    readonly initialState: FieldState<V>;

    constructor(readonly initialValue: V, initialDisabled: boolean) {
        this.initialState = new FieldStateImpl(initialValue, initialDisabled, false, false);
    }
}

export function defineField<V>(initialValue: V, initialDisabled = false): FieldRef<V> {
    return new FieldRefImpl(initialValue, initialDisabled);
}

export function isFieldRef(field: unknown): field is FieldRef<unknown> {
    return field instanceof FieldRefImpl;
}

class ArrayFieldRefImpl<T extends GenericFieldRef, V>
    extends FieldRefImpl<List<T>>
    implements ArrayFieldRef<T, V> {
    constructor(
        initialItems: List<T>,
        readonly itemTemplate: (value: V) => T,
        initialDisabled: boolean
    ) {
        super(initialItems, initialDisabled);
    }
}

export function defineArrayField<T extends GenericFieldRef, V>(
    initialItems: Iterable<V>,
    itemTemplate: (value: V) => T,
    initialDisabled = false
): ArrayFieldRef<T, V> {
    return new ArrayFieldRefImpl(
        Seq(initialItems).map(itemTemplate).toList(),
        itemTemplate,
        initialDisabled
    );
}

export function isArrayFieldRef(field: unknown): field is ArrayFieldRef<GenericFieldRef, unknown> {
    return field instanceof ArrayFieldRefImpl;
}
