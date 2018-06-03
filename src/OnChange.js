// @flow

import * as React from 'react';
import Field from './Field';
import type { FieldRef } from './types';

type CommonProps<A> = {|
    field: FieldRef<A>,
    onChange: (newValue: A, previousValue: ?A) => mixed,
    compare?: (newValue: A, previousValue: ?A) => boolean,
    runOnMount?: boolean
|};

type Props<A> = {| value: A, ...CommonProps<A> |};

class OnChange<A> extends React.PureComponent<Props<A>> {
    static defaultProps = {
        runOnMount: false
    };

    componentDidMount() {
        if (this.props.runOnMount === true) {
            this.notifyChange(null);
        }
    }

    componentDidUpdate(previousProps: Props<A>) {
        let isValueDifferent =
            this.props.compare == null
                ? this.props.value !== previousProps.value
                : !this.props.compare(this.props.value, previousProps.value);

        if (isValueDifferent) {
            this.notifyChange(previousProps.value);
        }
    }

    notifyChange(previousValue: ?A) {
        this.props.onChange(this.props.value, previousValue);
    }

    render() {
        return null;
    }
}

export default function $OnChange<A>(props: CommonProps<A>) {
    return (
        <Field field={props.field}>{({ value }) => <OnChange {...props} value={value} />}</Field>
    );
}
