// @flow

import type { Map } from 'immutable';
import type { FieldRefType, FieldRef, FieldState, FormStateCheckpoint } from './types';

export function createFormState<T: FieldRefType<any>>(
    fields: T,
    fieldStates: Map<FieldRef<any>, FieldState<any>>
): FormStateCheckpoint {
    return {
        formState: {
            fields,
            fieldStates
        },
        equals(otherCheckpoint: FormStateCheckpoint) {
            return (
                otherCheckpoint.formState.fields === fields &&
                otherCheckpoint.formState.fieldStates === fieldStates
            );
        }
    };
}
