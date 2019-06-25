// @flow

import type { Option } from '@ekz/option';
import type { Node } from 'react';
import type { Map, List } from 'immutable';

export interface ArrayFieldRef<A, T: FieldRefType<any>> extends FieldRef<List<T>> {
    +type: 'List';
    +mappedTo: MappedRef<any, List<T>> | null;
    +itemTemplate: A => T;
    +initialState: ArrayFieldState<T>;
}

export interface FieldRef<A> {
    +type: 'Value' | 'List';
    +mappedTo: MappedRef<any, A> | null;
    +initialState: FieldState<A>;
}

export type FieldRefType<A> = { [key: string]: any } | FieldRef<A>;

export type MappedRef<S, T> = {|
    sourceRef: FieldRef<S>,
    fromSource: S => T,
    toSource: T => S
|};

export type FieldState<A> = {|
    value: A,
    error: Option<string>,
    disabled: boolean,
    active: boolean,
    touched: boolean
|};

export type ArrayFieldState<A> = FieldState<List<A>>;

export type Validator<A> = (value: A, context: FormAccessor) => ?string;

export type FieldValidator<A> = Validator<A> | Array<Validator<A>>;

export type ArrayFieldValidator<A> = FieldValidator<List<A>>;

export type FieldBag<A> = $ReadOnly<{|
    ...FieldState<A>,
    setValue: A => void,
    setDisabled: boolean => void,
    onBlur: () => void,
    onFocus: () => void
|}>;

export type ArrayFieldBag<A, T: FieldRefType<any>> = $ReadOnly<{|
    items: List<T>,
    error: Option<string>,
    disabled: boolean,
    setDisabled: boolean => void,
    map: (mapper: (item: T, index: number) => Node) => Node,
    swap: (indexA: number, indexB: number) => void,
    move: (from: number, to: number) => void,
    unshift: (value: A) => T,
    push: (value: A) => T,
    insert: (index: number, value: A) => T,
    insertItem: (index: number, item: T) => void,
    remove: (item: T) => void
|}>;

export type FormBag<T> = $ReadOnly<{|
    ...FormAccessor,
    fields: T,
    resetForm: () => void,
    handleSubmit: (e: SyntheticEvent<HTMLFormElement>) => void,
    submitForm: () => void,
    setSubmitting: boolean => void,
    isSubmitting: boolean,
    isValid: boolean
|}>;

type FormAccessor = $ReadOnly<{|
    getFieldState: <A>(FieldRef<A>) => FieldState<A>
|}>;

export type FormSubmitBag<T> = $ReadOnly<{|
    ...FormAccessor,
    fields: T,
    resetForm: () => void,
    submitForm: () => void,
    setSubmitting: boolean => void,
    valuesToJS: () => any
|}>;

export type FormStateContextValue = $ReadOnly<{|
    fieldStates: Map<FieldRef<any>, FieldState<any>>,
    ...FormAccessor,
    setFieldState: <A>(FieldRef<A>, $Shape<FieldState<A>>) => void
|}>;
