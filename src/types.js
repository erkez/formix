// @flow

import type { Option } from '@ekz/option';
import type { Node } from 'react';
import type { Map, List } from 'immutable';

export interface ArrayFieldRef<A, T: FieldRefType<any>> {
    +type: 'List';
    +itemTemplate: A => T;
    +defaultItemValue: A;
    +initialState: ArrayFieldState<T>;
}

export interface FieldRef<A> {
    +type: 'Value';
    +initialState: FieldState<A>;
}

export type StatefulFieldRef<A> = FieldRef<A> | ArrayFieldRef<any, A>;

export type FieldRefType<A> = { [key: string]: any } | StatefulFieldRef<A>;

export type FieldState<A> = {
    value: A,
    error: Option<string>,
    disabled: boolean,
    active: boolean,
    touched: boolean
};

export type ArrayFieldState<A> = FieldState<List<A>>;

export type Validator<A> = (value: A, context: FormAccessors) => ?string;

export type FieldValidator<A> = Validator<A> | Array<Validator<A>>;

export type ArrayFieldValidator<A> = FieldValidator<List<A>>;

export type FieldBag<A> = FieldState<A> &
    $ReadOnly<{
        setValue: A => void,
        setDisabled: boolean => void,
        onBlur: () => void,
        onFocus: () => void
    }>;

export type ArrayFieldBag<A, T: FieldRefType<any>> = $ReadOnly<{
    items: List<T>,
    error: Option<string>,
    disabled: boolean,
    setDisabled: boolean => void,
    map: (mapper: (item: T, index?: number) => Node) => Node,
    swap: (indexA: number, indexB: number) => void,
    move: (from: number, to: number) => void,
    unshift: (value?: A) => void,
    push: (value?: A) => void,
    remove: (item: T) => void
}>;

export type FormAccessors = $ReadOnly<{
    getFieldState: <A>(FieldRef<A>) => FieldState<A>,
    getArrayFieldState: <A: FieldRefType<any>>(ArrayFieldRef<any, A>) => ArrayFieldState<A>
}>;

export type FormBag<T> = FormAccessors &
    $ReadOnly<{
        fields: T,
        resetForm: () => void,
        handleSubmit: (e: SyntheticEvent<HTMLFormElement>) => void,
        submitForm: () => void,
        setFieldValue: <A>(field: FieldRef<A>, value: A, touched?: boolean) => void,
        setFieldDisabled: <A>(field: FieldRef<A>, disabled: boolean) => void,
        setSubmitting: boolean => void,
        isSubmitting: boolean,
        isValid: boolean
    }>;

export type FormSubmitBag<T> = FormAccessors &
    $ReadOnly<{
        fields: T,
        resetForm: () => void,
        submitForm: () => void,
        setSubmitting: boolean => void,
        valuesToJS: () => any
    }>;

export type FormContextValue = $ReadOnly<{
    fieldStates: Map<StatefulFieldRef<any>, FieldState<any>>,
    formAccessors: FormAccessors,
    setFieldState: (StatefulFieldRef<any>, $Shape<FieldState<any>>) => void
}>;
