import { Seq, List, Map, OrderedSet } from 'immutable';
import * as React from 'react';

import { isArrayFieldRef, isFieldRef } from '../references';
import {
    GenericFieldRef,
    FieldRef,
    ValidationResult,
    FormApi,
    FormValidationApi,
    FormValidations,
    FieldValidation
} from '../types';

export function useFormValidation(getFieldState: FormApi['getFieldState']): FormValidationApi {
    const [validations, setValidations] = React.useState<FormValidations>(Map);

    const registerValidation: FormValidationApi['registerValidation'] = React.useCallback(
        (validation) => {
            setValidations((previous) =>
                previous.update(validation.fieldRef, OrderedSet(), (validations) =>
                    validations.add(validation)
                )
            );
            return () =>
                setValidations((previous) =>
                    previous.update(validation.fieldRef, OrderedSet(), (validations) =>
                        validations.remove(validation)
                    )
                );
        },
        []
    );

    const getValidationResult: FormValidationApi['getValidationResult'] = React.useCallback(
        (fieldRef) => {
            return validations
                .get(fieldRef, OrderedSet<FieldValidation<unknown>>())
                .first(EmptyValidationResult);
        },
        [validations]
    );

    const isFieldValid: FormValidationApi['isFieldValid'] = React.useCallback(
        (fieldRef) => {
            function flatten(field: GenericFieldRef): List<FieldRef<unknown>> {
                if (isArrayFieldRef(field)) {
                    return getFieldState(field).value.flatMap(flatten);
                } else if (isFieldRef(field)) {
                    return List.of(field);
                } else {
                    return Seq.Keyed(field).valueSeq().flatMap(flatten).toList();
                }
            }

            const fields = flatten(fieldRef).toSet();

            return validations
                .filter((_, field) => fields.has(field))
                .valueSeq()
                .flatMap((v) => v)
                .every((v) => v.error == null && !v.pending);
        },
        [getFieldState, validations]
    );

    const pending = React.useMemo(() => {
        return validations
            .valueSeq()
            .flatMap((v) => v)
            .some((v) => v.pending);
    }, [validations]);

    const valid = React.useMemo(() => {
        return (
            !pending &&
            validations
                .valueSeq()
                .flatMap((v) => v)
                .every((v) => v.error == null)
        );
    }, [pending, validations]);

    return { registerValidation, getValidationResult, isFieldValid, valid, pending };
}

const EmptyValidationResult: ValidationResult = Object.freeze({
    error: null,
    pending: false
});
