// @flow

import * as React from 'react';
import { Form } from '../src';
import { render } from 'react-testing-library';

describe('<Form />', () => {
    it('should be instantiated', () => {
        const fields = () => ({});

        const handleSubmit = jest.fn();

        const { getByText } = render(
            <Form fieldsInitializer={fields} initialValue={undefined} onSubmit={handleSubmit}>
                <span>rendered!</span>
            </Form>
        );

        expect(getByText('rendered!')).toBeDefined();
    });
});
