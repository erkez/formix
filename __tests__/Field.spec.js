// @flow

import '@babel/polyfill';
import * as React from 'react';
import { Form, Field, defineField } from '../src';
import type { FieldRef, FieldValidator } from '../src';
import { render, fireEvent } from 'react-testing-library';

describe('<Field/>', () => {
    it('should display initial value', () => {
        const fields = initial => ({
            myField: defineField(initial)
        });

        const handleSubmit = jest.fn();

        const { getByText } = render(
            <Form fieldsInitializer={fields} initialValue="contents" onSubmit={handleSubmit}>
                {({ fields }) => (
                    <Field field={fields.myField}>{({ value }) => <div>{value}</div>}</Field>
                )}
            </Form>
        );

        expect(getByText('contents')).toBeDefined();
    });

    it('should react to input changes', () => {
        const fields = initial => ({
            myField: defineField(initial)
        });

        const handleSubmit = jest.fn();

        const { getByText, getByTestId } = render(
            <Form fieldsInitializer={fields} initialValue="contents" onSubmit={handleSubmit}>
                {({ fields }) => <InputField field={fields.myField} />}
            </Form>
        );

        fireEvent.change(getByTestId('input-field'), { target: { value: 'another value' } });
        expect(getByText('another value')).toBeDefined();
    });

    it('should properly validate', () => {
        const fields = initial => ({
            myField: defineField(initial)
        });

        const validate = jest.fn().mockImplementation(value => (value !== 'ok' ? 'not ok!' : null));
        const handleSubmit = jest.fn();

        const { getByText, getByTestId, rerender } = render(
            <Form fieldsInitializer={fields} initialValue="contents" onSubmit={handleSubmit}>
                {({ fields }) => <InputField field={fields.myField} validator={validate} />}
            </Form>
        );

        expect(getByTestId('input-error')).toBeDefined();
        fireEvent.change(getByTestId('input-field'), { target: { value: 'ok' } });
        expect(getByText('ok')).toBeDefined();
        expect(() => getByTestId('input-error')).toThrow();

        fireEvent.change(getByTestId('input-field'), { target: { value: 'nope' } });
        expect(getByText('nope')).toBeDefined();
        expect(getByTestId('input-error')).toBeDefined();

        rerender(
            <Form fieldsInitializer={fields} initialValue="contents" onSubmit={handleSubmit}>
                {({ fields }) => <InputField field={fields.myField} />}
            </Form>
        );

        expect(getByText('nope')).toBeDefined();
        expect(() => getByTestId('input-error')).toThrow();
    });
});

type InputFieldProps = {|
    field: FieldRef<string>,
    validator?: FieldValidator<string>
|};

function InputField(props: InputFieldProps) {
    return (
        <Field field={props.field} validator={props.validator}>
            {({ value, error, setValue }) => (
                <div>
                    <input
                        data-testid="input-field"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                    />
                    <div>{value}</div>
                    {error.isDefined && <div data-testid="input-error">{error.get()}</div>}
                </div>
            )}
        </Field>
    );
}
