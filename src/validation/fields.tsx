import * as React from 'react';

import { useForm } from '../form';
import {
    GenericFieldRef,
    FormValues,
    FormStates,
    FieldRef,
    FieldRefValues,
    FieldRefStates,
    ValidationError,
    ValidationResult
} from '../types';

export function useFieldValidation<F extends FieldRef<unknown>, D extends GenericFieldRef[] = []>(
    fieldRef: F,
    validate: (value: FormValues<F>, ds: [...FieldRefValues<D>]) => ValidationError,
    deps?: [...D]
): void {
    const { getValues, registerValidation } = useForm();

    const value = getValues(fieldRef);

    const dependentValues = React.useMemo(() => {
        return (deps ?? []).map(getValues) as [...FieldRefValues<D>];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getValues, ...(deps ?? [])]);

    const error = React.useMemo(() => {
        return validate(value, dependentValues);
        // validate should not be considered for changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, ...dependentValues]);

    const validation = React.useMemo(
        () => ({
            fieldRef,
            error,
            pending: false
        }),
        [fieldRef, error]
    );

    React.useLayoutEffect(() => registerValidation(validation), [registerValidation, validation]);
}

function useAsyncValidationResult(
    validate: () => Promise<ValidationError>,
    debounceMs: number,
    deps: React.DependencyList
): ValidationResult {
    const [result, setResult] = React.useState<ValidationResult>({
        pending: false,
        error: null
    });

    React.useEffect(() => {
        let mounted = true;

        setResult((previous) => ({ pending: true, error: previous.error }));

        const timeoutId = setTimeout(() => {
            validate()
                .then((error) => {
                    if (mounted) {
                        setResult({ pending: false, error: error });
                    }
                })
                .catch((error) => {
                    if (mounted) {
                        setResult({ pending: false, error: 'Unexpected error' });
                    }
                    // eslint-disable-next-line no-console
                    console.warn('[Unhandled Validation Error]', error);
                    // eslint-disable-next-line no-console
                    console.warn(
                        'An async validator should never throw, but it should resolve with the validation result.'
                    );
                });
        }, debounceMs);

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
        };
        // validate should not be considered for changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounceMs, ...deps]);

    return result;
}

export function useAsyncFieldValidation<
    F extends FieldRef<unknown>,
    D extends GenericFieldRef[] = []
>(
    fieldRef: F,
    validate: (value: FormValues<F>, ds: [...FieldRefValues<D>]) => Promise<ValidationError>,
    deps?: [...D],
    debounceMs = 200
): void {
    const { getValues, registerValidation } = useForm();

    const value = getValues(fieldRef);

    const dependentValues = React.useMemo(() => {
        return (deps ?? []).map(getValues) as [...FieldRefValues<D>];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getValues, ...(deps ?? [])]);

    const result = useAsyncValidationResult(
        () => {
            return validate(value, dependentValues);
        },
        debounceMs,
        [value, ...dependentValues]
    );

    const validation = React.useMemo(
        () => ({
            fieldRef,
            error: result.error,
            pending: result.pending
        }),
        [fieldRef, result.error, result.pending]
    );

    React.useLayoutEffect(() => registerValidation(validation), [registerValidation, validation]);
}

export function useFieldStateValidation<
    F extends FieldRef<unknown>,
    D extends GenericFieldRef[] = []
>(
    fieldRef: F,
    validate: (
        fieldState: FormStates<F>,
        dependentFieldStates: [...FieldRefStates<D>]
    ) => ValidationError,
    deps?: [...D]
): void {
    const { getStates, registerValidation } = useForm();

    const fieldState = getStates(fieldRef);

    const dependentStates = React.useMemo(() => {
        return (deps ?? []).map(getStates) as [...FieldRefStates<D>];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getStates, ...(deps ?? [])]);

    const error = React.useMemo(() => {
        return validate(fieldState, dependentStates);
        // validate should not be considered for changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fieldState, ...dependentStates]);

    const validation = React.useMemo(
        () => ({
            fieldRef,
            error,
            pending: false
        }),
        [fieldRef, error]
    );

    React.useLayoutEffect(() => registerValidation(validation), [registerValidation, validation]);
}

export function useAsyncFieldStateValidation<
    F extends FieldRef<unknown>,
    D extends GenericFieldRef[] = []
>(
    fieldRef: F,
    validate: (fieldState: FormStates<F>, ds: [...FieldRefStates<D>]) => Promise<ValidationError>,
    deps?: [...D],
    debounceMs = 200
): void {
    const { getStates, registerValidation } = useForm();

    const fieldState = getStates(fieldRef);

    const dependentValues = React.useMemo(() => {
        return (deps ?? []).map(getStates) as [...FieldRefStates<D>];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getStates, ...(deps ?? [])]);

    const result = useAsyncValidationResult(
        () => {
            return validate(fieldState, dependentValues);
        },
        debounceMs,
        [fieldState, ...dependentValues]
    );

    const validation = React.useMemo(
        () => ({
            fieldRef,
            error: result.error,
            pending: result.pending
        }),
        [fieldRef, result.error, result.pending]
    );

    React.useLayoutEffect(() => registerValidation(validation), [registerValidation, validation]);
}
