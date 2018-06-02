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

type State<T> = {
    fieldStates: $ElementType<FormContextValue, 'fieldStates'>,
    formAccessors: FormAccessors,
    formBag: FormBag<T>
};

class Form<A, T: FieldRefType<any>> extends React.PureComponent<Props<A, T>, State<T>> {
    static defaultProps = {
        resetOnInitialValueChange: false
    };

    constructor(props: Props<A, T>) {
        super(props);

        this.state = {
            formAccessors: {
                getFieldState: this.getFieldState,
                getArrayFieldState: this.getArrayFieldState
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
            }),
            fieldStates: Map()
        };
    }

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
        this.state.fieldStates.get(fieldRef, fieldRef.initialState);

    getArrayFieldState: $ElementType<FormAccessors, 'getArrayFieldState'> = fieldRef =>
        this.state.fieldStates.get(fieldRef, fieldRef.initialState);

    setFieldState: $ElementType<FormContextValue, 'setFieldState'> = (fieldRef, newState) => {
        this.setState(s => {
            let fieldStates = s.fieldStates.set(fieldRef, Object.freeze(newState));
            let formBag = updateFormBag(s.formBag, {
                isValid: fieldStates.every(state => state.error.isEmpty)
            });
            return { fieldStates, formBag };
        });
    };

    valuesToJS: () => any = () => {
        return extractFieldValues(this.state.formBag.fields, this.state.fieldStates);
    };

    resetForm: () => void = () => {
        let fields = this.props.fieldsInitializer(this.props.initialValue);
        let fieldStates = Map();
        let formBag = updateFormBag(this.state.formBag, {
            fields,
            isSubmitting: false,
            isValid: true
        });
        this.setState({ formBag, fieldStates });
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

    render() {
        return (
            <Provider
                value={{
                    fieldStates: this.state.fieldStates,
                    formAccessors: this.state.formAccessors,
                    setFieldState: this.setFieldState
                }}>
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
