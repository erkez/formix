// @flow

import * as React from 'react';
import { Form, FieldValue, defineField } from '../src';
import { mount } from 'enzyme';

describe('<Form />', () => {
    it('should be instantiated', () => {
        const fields = initial => ({
            myField: defineField(initial)
        });

        const handleSubmit = jest.fn();

        const wrapper = mount(
            <Form fieldsInitializer={fields} initialValue="contents" onSubmit={handleSubmit}>
                {({ fields }) => (
                    <FieldValue
                        field={fields.myField}
                        render={field => <span className="my-value">{field}</span>}
                    />
                )}
            </Form>
        );

        expect(wrapper.contains(<span className="my-value">contents</span>)).toEqual(true);
    });
});
