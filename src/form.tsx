import { Map, Seq } from 'immutable';
import * as React from 'react';

import { isArrayFieldRef, isFieldRef } from './references';
import { GenericFieldRef, FieldRef, FieldState, FormApi, FormWithFields } from './types';
import { useFormValidation } from './validation/form';

function useFormApi(): FormApi {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [fieldStates, setFieldStates] = React.useState<Map<FieldRef<any>, FieldState<any>>>(Map);

    const getFieldState = React.useCallback(
        function getFieldState<T>(fieldRef: FieldRef<T>) {
            return fieldStates.get(fieldRef, fieldRef.initialState);
        },
        [fieldStates]
    );

    const getFieldValue = React.useCallback<FormApi['getFieldValue']>(
        (fieldRef) => getFieldState(fieldRef).value,
        [getFieldState]
    );

    const setFieldState = React.useCallback(function setFieldState<T>(
        fieldRef: FieldRef<T>,
        state: React.SetStateAction<FieldState<T>>
    ) {
        setFieldStates((xs) =>
            typeof state === 'function'
                ? xs.update(fieldRef, fieldRef.initialState, state)
                : xs.set(fieldRef, state)
        );
    }, []);

    const extract = React.useCallback(
        (fields: GenericFieldRef, type: 'value' | 'state') => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            function extractField(field: GenericFieldRef): any {
                if (isArrayFieldRef(field)) {
                    return getFieldState(field).value.map(extractField);
                } else if (isFieldRef(field)) {
                    const state = getFieldState(field);
                    return type === 'value' ? state.value : state;
                } else {
                    return Seq.Keyed(field)
                        .map((value) => extractField(value))
                        .toObject();
                }
            }

            return extractField(fields);
        },
        [getFieldState]
    );

    const getStates: FormApi['getStates'] = React.useCallback(
        (fields) => extract(fields, 'state'),
        [extract]
    );

    const getValues: FormApi['getValues'] = React.useCallback(
        (fields) => extract(fields, 'value'),
        [extract]
    );

    const reset = React.useCallback(() => setFieldStates(Map()), [setFieldStates]);

    const modified = React.useMemo(() => {
        return fieldStates.some((state, fieldRef) => !state.equals(fieldRef.initialState));
    }, [fieldStates]);

    const formValidation = useFormValidation(getFieldState);

    return React.useMemo(
        () => ({
            getFieldState,
            getFieldValue,
            setFieldState,
            getStates,
            getValues,
            reset,
            modified,
            ...formValidation
        }),
        [
            getFieldState,
            getFieldValue,
            setFieldState,
            getStates,
            getValues,
            reset,
            modified,
            formValidation
        ]
    );
}

function noop(): never {
    throw new Error('Cannot call method on empty context. Did you forget <Form />?');
}

const FormContext = React.createContext<FormApi>({
    getFieldState: noop,
    getFieldValue: noop,
    setFieldState: noop,
    getStates: noop,
    getValues: noop,
    getValidationResult: noop,
    registerValidation: noop,
    isFieldValid: noop,
    reset: noop,
    pending: false,
    valid: false,
    modified: false
});

export function FormProvider(props: { children: React.ReactNode }): React.ReactElement {
    const api = useFormApi();
    return <FormContext.Provider value={api}>{props.children}</FormContext.Provider>;
}

export function useForm(): FormApi {
    return React.useContext(FormContext);
}

export function useFormWithFields<Deps extends unknown[], F extends GenericFieldRef>(
    fieldsCreator: (...deps: [...Deps]) => F,
    deps: [...Deps]
): FormWithFields<F> {
    const { reset, ...form } = useForm();

    const fields = React.useMemo(() => {
        return fieldsCreator(...deps);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    React.useLayoutEffect(() => {
        reset();
    }, [reset, fields]);

    return React.useMemo(
        () => ({
            ...form,
            reset,
            fields
        }),
        [form, reset, fields]
    );
}

export function withForm<Props>(Component: React.ComponentType<Props>): React.ComponentType<Props> {
    return function WithForm(props: Props): React.ReactElement {
        return (
            <FormProvider>
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore-error */}
                <Component {...props} />
            </FormProvider>
        );
    };
}

type UseFormProps = {
    children: (form: FormApi) => React.ReactNode;
};

export function UseForm(props: UseFormProps): React.ReactElement {
    const form = useForm();
    return <React.Fragment>{props.children(form)}</React.Fragment>;
}
