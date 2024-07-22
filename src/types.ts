import type { Map, List, OrderedSet } from 'immutable';

export type GenericFieldRef =
    | ArrayFieldRef<GenericFieldRef, unknown>
    | FieldRef<unknown>
    | { [key: string]: GenericFieldRef };

export interface FieldRef<T> {
    readonly initialState: FieldState<T>;
}

export interface ArrayFieldRef<T extends GenericFieldRef, V> extends FieldRef<List<T>> {
    itemTemplate(value: V): T;
}

/**
 * `FieldState` represents the state of a `FieldRef`
 */
export interface FieldState<T> extends FieldValue<T>, FieldMetadata {
    /**
     * Value of the field
     */
    readonly value: T;

    /**
     * `true` when field is disabled
     */
    readonly disabled: boolean;

    /**
     * `true` when field is focused
     */
    readonly active: boolean;

    /**
     * `true` when field has been focused once
     */
    readonly touched: boolean;

    updated(fields: Partial<FieldValue<T> & FieldMetadata>): FieldState<T>;

    /**
     * `equals` only takes the value and disabled properties into consideration.
     */
    equals(other: FieldState<T> | null | undefined): boolean;

    /**
     * `hashCode` only takes the value and disabled properties into consideration.
     */
    hashCode(): number;
}

export interface FieldValue<T> {
    readonly value: T;
}

export interface FieldMetadata {
    readonly disabled: boolean;
    readonly active: boolean;
    readonly touched: boolean;
}

export interface FieldMetadataUpdaters {
    setDisabled(disabled: boolean): void;
    onFocus(): void;
    onBlur(): void;
}

export interface Field<T>
    extends FieldValue<T>,
        FieldMetadata,
        FieldMetadataUpdaters,
        ValidationResult {
    setValue(value: React.SetStateAction<T>): void;
}

export interface ArrayField<T extends GenericFieldRef, V>
    extends FieldMetadata,
        FieldMetadataUpdaters,
        ValidationResult {
    readonly items: List<T>;
    unshift(value: V): T;
    push(value: V): T;
    insert(index: number, value: V): T;
    remove(item: T): void;
    swap(indexA: number, indexB: number): void;
}

export type FormStates<F> =
    F extends ArrayFieldRef<infer T, unknown>
        ? List<FormStates<T>>
        : F extends FieldRef<infer T>
          ? FieldState<T>
          : F extends { [K: string]: GenericFieldRef }
            ? { [K in keyof F]: FormStates<F[K]> }
            : never;

export type FieldRefStates<T extends GenericFieldRef[]> = { [K in keyof T]: FormStates<T[K]> };

export type FormValues<F> =
    F extends ArrayFieldRef<infer T, unknown>
        ? List<FormValues<T>>
        : F extends FieldRef<infer T>
          ? T
          : F extends { [K: string]: GenericFieldRef }
            ? { [K in keyof F]: FormValues<F[K]> }
            : never;

export type FieldRefValues<T extends GenericFieldRef[]> = { [K in keyof T]: FormValues<T[K]> };

export interface FormApi extends FormValidationApi {
    getFieldState<T>(fieldRef: FieldRef<T>): FieldState<T>;
    getFieldValue<T>(fieldRef: FieldRef<T>): T;
    setFieldState<T>(fieldRef: FieldRef<T>, state: React.SetStateAction<FieldState<T>>): void;
    getStates<F extends GenericFieldRef>(fields: F): FormStates<F>;
    getValues<F extends GenericFieldRef>(fields: F): FormValues<F>;
    reset(): void;
    modified: boolean;
}

export interface FormWithFields<F extends GenericFieldRef> extends FormApi {
    fields: F;
}

/**
 * A ReactElement or a string represent an error message, and null represents no errors.
 */
export type ValidationError = React.ReactElement | string | null;

export interface ValidationResult {
    readonly error: ValidationError;
    readonly pending: boolean;
}

export interface FieldValidation<T> extends ValidationResult {
    readonly fieldRef: FieldRef<T>;
}

export type FormValidations = Map<FieldRef<unknown>, OrderedSet<FieldValidation<unknown>>>;

export interface FormValidationApi {
    registerValidation(validation: FieldValidation<unknown>): () => void;
    getValidationResult(fieldRef: FieldRef<unknown>): ValidationResult;
    isFieldValid(fieldRef: GenericFieldRef): boolean;
    valid: boolean;
    pending: boolean;
}
