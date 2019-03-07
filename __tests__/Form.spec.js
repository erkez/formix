// @flow

import * as React from 'react';
import { Form, FieldValue, defineField } from '../src';
import { render } from 'react-testing-library';

describe('<Form />', () => {
    it('should be instantiated', () => {
        const fields = initial => ({
            myField: defineField(initial)
        });

        const handleSubmit = jest.fn();

        const { getByText } = render(
            <Form fieldsInitializer={fields} initialValue="contents" onSubmit={handleSubmit}>
                {({ fields }) => (
                    <FieldValue
                        field={fields.myField}
                        render={field => <span className="my-value">{field}</span>}
                    />
                )}
            </Form>
        );

        expect(getByText('contents')).toBeDefined();
    });
});
