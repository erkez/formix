// @flow

import * as React from 'react';
import { Map } from 'immutable';
import { Provider } from './Context';
import { extractFieldValues } from './FieldRefs';
import type {
    FieldRefType,
    FormBag,
    FormSubmitBag,
    FormAccessors,
    FormContextValue
} from './types';

type Props<A, T: FieldRefType<any>> = {
    fieldsInitializer: A => T,
    initialValue: A,
    resetOnInitialValueChange: boolean,
    onSubmit: (FormSubmitBag<T>) => void,
    children: (FormBag<T>) => React.Node
};

type State<T> = $Exact<{
    context: FormContextValue,
    formBag: FormBag<T>
}>;

class Form<A, T: FieldRefType<any>> extends React.Component<Props<A, T>, State<T>> {
    static defaultProps = {
        resetOnInitialValueChange: false
    };

    componentDidUpdate(previousProps: Props<A, T>) {
        let fieldInitializerChanged =
            this.props.fieldsInitializer !== previousProps.fieldsInitializer;
        let hasInitialValueChanged =
            this.props.resetOnInitialValueChange &&
            this.props.initialValue !== previousProps.initialValue;
        if (fieldInitializerChanged || hasInitialValueChanged) {
            this.resetForm();
        }
    }

    getFieldState: $ElementType<FormAccessors, 'getFieldState'> = fieldRef =>
        // $FlowFixMe
        this.state.context.fieldStates.get(fieldRef, fieldRef.initialState);

    getArrayFieldState: $ElementType<FormAccessors, 'getArrayFieldState'> = fieldRef =>
        // $FlowFixMe
        this.state.context.fieldStates.get(fieldRef, fieldRef.initialState);

    setFieldState: $ElementType<FormContextValue, 'setFieldState'> = (fieldRef, newState) => {
        this.setState(s => {
            let fieldStates = s.context.fieldStates.update(fieldRef,
                (previousState = fieldRef.initialState) => Object.assign({}, previousState, newState)
            );
            let context = Object.assign({}, s.context, { fieldStates });

            let formBag = s.formBag;
            let isValid = fieldStates.every(state => state.error.isEmpty);

            if (formBag.isValid !== isValid) {
                formBag = updateFormBag(s.formBag, { isValid });
            }

            return { context, formBag };
        });
    };

    valuesToJS: () => any = () => {
        return extractFieldValues(this.state.formBag.fields, this.state.context.fieldStates);
    };

    resetForm: () => void = () => {
        this.setState(s => {
            let context = Object.assign({}, s.context, { fieldStates: Map() });

            let fields = this.props.fieldsInitializer(this.props.initialValue);
            let formBag = updateFormBag(s.formBag, {
                fields,
                isSubmitting: false,
                isValid: true
            });

            return { context, formBag };
        });
    };

    submitForm: (e?: SyntheticEvent<HTMLFormElement>) => void = event => {
        if (event != null && typeof event.preventDefault === 'function') {
            event.preventDefault();
        }

        this.props.onSubmit({
            fields: this.state.formBag.fields,
            getFieldState: this.getFieldState,
            getArrayFieldState: this.getArrayFieldState,
            valuesToJS: this.valuesToJS,
            resetForm: this.resetForm,
            submitForm: this.submitForm,
            setSubmitting: this.setSubmitting
        });
    };

    setSubmitting: boolean => void = isSubmitting => {
        this.setState(s => {
            let formBag = updateFormBag(s.formBag, { isSubmitting });
            return { formBag };
        });
    };

    state: State<T> = {
        context: {
            formAccessors: {
                getFieldState: this.getFieldState,
                getArrayFieldState: this.getArrayFieldState
            },
            fieldStates: Map(),
            setFieldState: this.setFieldState
        },
        formBag: Object.freeze({
            fields: this.props.fieldsInitializer(this.props.initialValue),
            getFieldState: this.getFieldState,
            getArrayFieldState: this.getArrayFieldState,
            resetForm: this.resetForm,
            handleSubmit: this.submitForm,
            submitForm: this.submitForm,
            setSubmitting: this.setSubmitting,
            isSubmitting: false,
            isValid: true
        })
    };

    render() {
        return (
            <Provider value={this.state.context}>
                {this.props.children(this.state.formBag)}
            </Provider>
        );
    }
}

function updateFormBag<T>(bag: FormBag<T>, obj: {}): FormBag<T> {
    return Object.freeze(Object.assign({}, bag, obj));
}

export function withFormix<A, P: {}, WC: React.ComponentType<P>, T: FieldRefType<any>>({
    fieldsInitializer,
    mapPropsToInitialValue,
    mapPropsToSubmit
}: {
    fieldsInitializer: A => T,
    mapPropsToInitialValue: P => A,
    mapPropsToSubmit?: P => (FormSubmitBag<T>) => void
}): WC => React.ComponentType<$Diff<React.ElementConfig<WC>, { form: FormBag<T> | void }>> {
    return function withFormixWrapper(WrappedComponent) {
        return function WithFormix(props) {
            return (
                <Form
                    fieldsInitializer={fieldsInitializer}
                    initialValue={mapPropsToInitialValue(props)}
                    onSubmit={mapPropsToSubmit != null ? mapPropsToSubmit(props) : () => {}}>
                    {form => <WrappedComponent {...props} form={form} />}
                </Form>
            );
        };
    };
}

export default Form;
