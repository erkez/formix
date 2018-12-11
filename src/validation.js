// @flow

import { Seq } from 'immutable';
import { Option } from '@ekz/option';
import type { FieldValidator, FormAccessors } from './types';

export function validateField<A>(
    value: A,
    validator?: FieldValidator<A>,
    getFieldState: $ElementType<FormAccessors, 'getFieldState'>
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
