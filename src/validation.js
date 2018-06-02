// @flow

import { Seq } from 'immutable';
import { Option } from '@ekz/option';
import type { FieldValidator, FormAccessors } from './types';

export function validateField<A>(
    value: A,
    validator?: FieldValidator<A>,
    formAccessors: FormAccessors
): Option<string> {
    return Option.of(validator).mapNullable(validator => {
        if (Array.isArray(validator)) {
            return Seq(validator)
                .map(fn => fn(value, formAccessors))
                .find(value => value != null, null);
        } else {
            return validator(value, formAccessors);
        }
    });
}
