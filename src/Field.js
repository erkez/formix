// @flow

import * as React from 'react';
import { Option, None } from '@ekz/option';
import Context from './Context';
import type { FieldRef, FieldState, FieldBag, FieldValidator, FormContextValue } from './types';
import { validateField } from './validation';

type Props<A> = BoundProps<A> & {
    error: Option<string>,
    fieldState: FieldState<A>,
    setFieldState: (FieldRef<A>, $Shape<FieldState<A>>) => void
};

class Field<A> extends React.PureComponent<Props<A>> {
    lastFieldState: FieldState<A> = this.props.fieldState;
    lastFieldBag: ?FieldBag<A> = null;

    componentDidMount() {
        this.performValidation();
    }

    componentDidUpdate(previousProps: Props<A>) {
        if (this.props.error !== previousProps.error) {
            this.performValidation();
        }
    }

    componentWillUnmount() {
        let state = this.props.fieldState;

        if (this.props.resetWhenUnmounted === true) {
            state = this.props.field.initialState;
        }

        if (this.props.error.isDefined) {
            this.props.setFieldState(this.props.field, { error: None });
        } else if (state !== this.props.fieldState) {
            this.props.setFieldState(this.props.field, state);
        }
    }

    getFieldBag(): FieldBag<A> {
        if (this.props.fieldState === this.lastFieldState && this.lastFieldBag != null) {
            return this.lastFieldBag;
        }

        this.lastFieldBag = {
            ...this.props.fieldState,
            setValue: this.setValue,
            setDisabled: this.setDisabled,
            onFocus: this.onFocus,
            onBlur: this.onBlur
        };

        return this.lastFieldBag;
    }

    performValidation(): void {
        if (!this.props.error.equals(this.props.fieldState.error)) {
            this.props.setFieldState(this.props.field, { error: this.props.error });
        }
    }

    setValue: $PropertyType<FieldBag<A>, 'setValue'> = value => {
        this.props.setFieldState(this.props.field, { value, touched: true });
    };

    setDisabled: $PropertyType<FieldBag<A>, 'setDisabled'> = disabled =>
        this.props.setFieldState(this.props.field, { disabled });

    onFocus: $PropertyType<FieldBag<A>, 'onFocus'> = () =>
        this.props.setFieldState(this.props.field, { active: true, touched: true });

    onBlur: $PropertyType<FieldBag<A>, 'onBlur'> = () =>
        this.props.setFieldState(this.props.field, { active: false });

    render() {
        return this.props.children(this.getFieldBag());
    }
}

type BoundProps<A> = {
    field: FieldRef<A>,
    validator?: FieldValidator<A>,
    resetWhenUnmounted?: boolean,
    children: (FieldBag<A>) => React.Node
};

class BoundField<A> extends React.PureComponent<BoundProps<A>> {
    render() {
        return (
            <Context.Consumer>
                {({ getFieldState, setFieldState }: FormContextValue) => {
                    let fieldState: FieldState<A> = getFieldState(this.props.field);

                    let error = validateField(
                        fieldState.value,
                        this.props.validator,
                        getFieldState
                    );

                    return (
                        <Field
                            field={this.props.field}
                            validator={this.props.validator}
                            resetWhenUnmounted={this.props.resetWhenUnmounted}
                            error={error}
                            fieldState={fieldState}
                            setFieldState={setFieldState}>
                            {this.props.children}
                        </Field>
                    );
                }}
            </Context.Consumer>
        );
    }
}

export default BoundField;
