import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render } from '@testing-library/react';
import * as React from 'react';

import { useField } from './fields';
import { FormProvider, useForm, useFormWithFields, withForm } from './form';
import { defineField } from './references';

describe('form', () => {
    it('should render an empty FormProvider', () => {
        const { container } = render(
            <FormProvider>
                <form className="some-form" />
            </FormProvider>
        );
        expect(container).toMatchSnapshot();
    });

    it('should render a FormProvider and extract the form API', () => {
        const Form = withForm(function Form() {
            const form = useForm();
            return (
                <div>
                    <div>valid: {form.valid && 'YES'}</div>
                    <div>pending: {!form.pending && 'NO'}</div>
                    <div>modified: {!form.modified && 'NO'}</div>
                </div>
            );
        });

        const { container } = render(<Form />);
        expect(container).toMatchSnapshot();
    });

    it('should render a FormProvider with fields', async () => {
        const Form = withForm(function Form() {
            const { fields } = useFormWithFields(
                () => ({
                    name: defineField('fizz')
                }),
                []
            );

            const nameField = useField(fields.name);

            return (
                <div>
                    <div data-testid="name">{nameField.value}</div>
                    <input
                        value={nameField.value}
                        onChange={(e) => nameField.setValue(e.target.value)}
                    />
                </div>
            );
        });

        const { findByTestId, findByDisplayValue } = render(<Form />);
        const input = await findByDisplayValue('fizz');
        fireEvent.change(input, { target: { value: 'buzz' } });
        const nameElement = await findByTestId('name');
        expect(nameElement).toHaveTextContent('buzz');
    });
});
