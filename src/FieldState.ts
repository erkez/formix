import { hash, is } from 'immutable';

import { FieldMetadata, FieldValue, FieldState as IFieldState } from './types';

export default class FieldState<T> implements IFieldState<T> {
    constructor(
        public readonly value: T,
        public readonly disabled: boolean,
        public readonly active: boolean,
        public readonly touched: boolean
    ) {}

    updated(fields: Partial<FieldValue<T> & FieldMetadata>): FieldState<T> {
        const o = { value: this.value, ...fields };
        return new FieldState(
            o.value,
            fields.disabled ?? this.disabled,
            fields.active ?? this.active,
            fields.touched ?? this.touched
        );
    }

    /**
     * `equals` only takes the value and disabled properties into consideration.
     */
    equals(other: FieldState<T> | null | undefined): boolean {
        return other != null && is(this.value, other.value) && this.disabled === other.disabled;
    }

    /**
     * `hashCode` only takes the value and disabled properties into consideration.
     */
    hashCode(): number {
        return hash(this.value) & hash(this.disabled);
    }
}
