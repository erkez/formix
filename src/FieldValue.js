// @flow

import * as React from 'react';
import type { FieldRef } from './types';
import { useField } from './Field';

type Props<T> = {|
    field: FieldRef<T>,
    render?: T => React.Node
|};

function FieldValue<T>(props: Props<T>) {
    const field = useField(props.field);
    return props.render != null ? props.render(field.value) : tryRender(field.value);
}

function tryRender<T>(value: T): React.Node {
    if (React.isValidElement(value)) {
        return (value: any);
    }

    let result = JSON.stringify(value);
    return result == null ? null : result;
}

export default FieldValue;
