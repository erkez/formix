// @flow

import * as React from 'react';
import { Form, FieldValue, defineField } from '../src';
import { render } from 'react-testing-library';

describe('<FieldValue/>', () => {
    it('should display initial value', () => {
        const fields = initial => ({
            myField: defineField(initial)
        });

        const handleSubmit = jest.fn();

        const { getByText } = render(
            <Form fieldsInitializer={fields} initialValue="contents" onSubmit={handleSubmit}>
                {({ fields }) => <FieldValue field={fields.myField} />}
            </Form>
        );

        expect(getByText('contents')).toBeDefined();
    });
});
