// @flow

import * as React from 'react';
import type { FieldRef } from './types';
import Field from './Field';

type Props<T> = {|
    field: FieldRef<T>,
    render?: T => React.Node
|};

function FieldValue<T>(props: Props<T>) {
    return (
        <Field field={props.field}>
            {({ value }) => (props.render != null ? props.render(value) : tryRender(value))}
        </Field>
    );
}

function tryRender<T>(value: T): React.Node {
    if (React.isValidElement(value)) {
        return (value: any);
    }

    return typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value);
}

export default FieldValue;
