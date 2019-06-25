// @flow

import * as React from 'react';
import { Map } from 'immutable';
import FormStateContext from './Context';
import { extractFieldValues, getFieldRefMapping } from './FieldRefs';
import type {
    FieldRefType,
    FieldRef,
    FieldState,
    FormBag,
    FormSubmitBag,
    FormStateContextValue
} from './types';

type Props<A, T: FieldRefType<any>> = {
    fieldsInitializer: A => T,
    initialValue: A,
    resetOnInitialValueChange: boolean,
    onSubmit: (FormSubmitBag<T>) => void,
    children: React.Node | ((FormBag<T>) => React.Node)
};

type State<T> = $Exact<{
    context: FormStateContextValue,
    formBag: FormBag<T>
}>;

class Form<A, T: FieldRefType<any>> extends React.Component<Props<A, T>, State<T>> {
    static defaultProps = {
        resetOnInitialValueChange: false
    };

    constructor(props: Props<A, T>) {
        super(props);

        this.getFieldState = this.getFieldState.bind(this);
        this.setFieldState = this.setFieldState.bind(this);

        this.state = {
            context: {
                fieldStates: Map(),
                getFieldState: this.getFieldState,
                setFieldState: this.setFieldState
            },
            formBag: Object.freeze({
                fields: this.props.fieldsInitializer(this.props.initialValue),
                getFieldState: this.getFieldState,
                resetForm: this.resetForm,
                handleSubmit: this.submitForm,
                submitForm: this.submitForm,
                setSubmitting: this.setSubmitting,
                isSubmitting: false,
                isValid: true
            })
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

    /*:: getFieldState: <A>(fieldRef: FieldRef<A>) => FieldState<A> */
    getFieldState<A>(fieldRef: FieldRef<A>): FieldState<A> {
        const { sourceRef, fromSource } = getFieldRefMapping<A>(fieldRef);
        let fieldState = this.state.context.fieldStates.get(sourceRef, sourceRef.initialState);
        return { ...fieldState, value: fromSource(fieldState.value) };
    }

    /*:: setFieldState: <A>(FieldRef<A>, $Shape<FieldState<A>>) => void */
    setFieldState<A>(fieldRef: FieldRef<A>, newState: $Shape<FieldState<A>>): void {
        this.setState(s => {
            const { sourceRef, toSource } = getFieldRefMapping<A>(fieldRef);

            let fieldStates = s.context.fieldStates.update(
                sourceRef,
                (previousState = sourceRef.initialState) => {
                    let valueObj = {};

                    if (newState.hasOwnProperty('value')) {
                        valueObj = { value: toSource(newState.value) };
                    }

                    return {
                        ...previousState,
                        ...newState,
                        ...valueObj
                    };
                }
            );
            let context = { ...s.context, fieldStates };

            let formBag = s.formBag;
            let isValid = fieldStates.every(state => state.error.isEmpty);

            if (formBag.isValid !== isValid) {
                formBag = updateFormBag(s.formBag, { isValid });
            }

            return { context, formBag };
        });
    }

    valuesToJS: () => any = () => {
        return extractFieldValues(this.state.formBag.fields, this.getFieldState);
    };

    resetForm: () => void = () => {
        this.setState(s => {
            let context = { ...s.context, fieldStates: Map() };

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
            <FormStateContext.Provider value={this.state.context}>
                <FormBagContext.Provider value={this.state.formBag}>
                    {typeof this.props.children === 'function'
                        ? this.props.children(this.state.formBag)
                        : this.props.children}
                </FormBagContext.Provider>
            </FormStateContext.Provider>
        );
    }
}

function updateFormBag<T>(bag: FormBag<T>, obj: {}): FormBag<T> {
    return Object.freeze({ ...bag, ...obj });
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

function noContext() {
    throw new Error('No context defined! Did you forget <Form />?');
}

const FormBagContext = React.createContext<FormBag<any>>({
    fields: null,
    getFieldState: noContext,
    resetForm: noContext,
    handleSubmit: noContext,
    submitForm: noContext,
    setSubmitting: noContext,
    isSubmitting: false,
    isValid: false
});

export function useFormix<T>(): FormBag<T> {
    return React.useContext(FormBagContext);
}

export default Form;
