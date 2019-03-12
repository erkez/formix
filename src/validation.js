// @flow

import { Seq } from 'immutable';
import { Option } from '@ekz/option';
import type { FieldValidator, FieldRef, FieldState } from './types';

export function validateField<A>(
    value: A,
    validator?: FieldValidator<A>,
    getFieldState: <A>(FieldRef<A>) => FieldState<A>
): Option<string> {
    return Option.of(validator).mapNullable(validator => {
        if (Array.isArray(validator)) {
            return Seq(validator)
                .map(fn => fn(value, { getFieldState }))
                .find(value => value != null, null);
        } else {
            return validator(value, { getFieldState });
        }
    });
}
