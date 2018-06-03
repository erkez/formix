// @flow

import * as React from 'react';
import { List } from 'immutable';
import { Option, None } from '@ekz/option';
import { Consumer } from './Context';
import type {
    FieldRefType,
    FieldValidator,
    ArrayFieldBag,
    ArrayFieldState,
    ArrayFieldRef,
    FormContextValue
} from './types';
import { validateField } from './validation';

type Props<A, T> = BoundProps<A, T> & {
    error: Option<string>,
    fieldState: ArrayFieldState<T>,
    setFieldState: (ArrayFieldRef<A, T>, ArrayFieldState<T>) => void
};

type State<A, T> = {
    lastFieldState: ArrayFieldState<T>,
    fieldBag: ArrayFieldBag<A, T>
};

class ArrayField<A, T: FieldRefType<any>> extends React.PureComponent<Props<A, T>, State<A, T>> {
    state: State<A, T> = ArrayField.makeStateFromProps(this.props);

    static getDerivedStateFromProps(
        nextProps: Props<A, T>,
        previousState: State<A, T>
    ): ?State<A, T> {
        if (nextProps.fieldState === previousState.lastFieldState) {
            return null;
        }

        return ArrayField.makeStateFromProps(nextProps);
    }

    static makeStateFromProps(props: Props<A, T>): State<A, T> {
        return {
            lastFieldState: props.fieldState,
            fieldBag: Object.freeze({
                items: props.fieldState.value,
                error: props.fieldState.error,
                disabled: props.fieldState.disabled,
                setDisabled: disabled => {
                    props.setFieldState(
                        props.field,
                        Object.assign({}, props.fieldState, { disabled })
                    );
                },
                map: fn => React.Children.toArray(props.fieldState.value.map(fn)),
                move: (from, to) => {
                    updateFieldState(props, items => {
                        checkBounds(items, from);
                        checkBounds(items, to);

                        let item = items.get(from);

                        if (item == null) {
                            throw new Error('Invalid element access');
                        }

                        return items.remove(from).insert(to, item);
                    });
                },
                swap: (indexA, indexB) => {
                    updateFieldState(props, items => {
                        let itemA = items.get(indexA);
                        let itemB = items.get(indexB);

                        if (itemA == null || itemB == null) {
                            throw new Error('Invalid element access');
                        }

                        return items
                            .remove(indexA)
                            .insert(indexA, itemB)
                            .remove(indexB)
                            .insert(indexB, itemA);
                    });
                },
                unshift: value => {
                    updateFieldState(props, items => {
                        if (checkIfUndefinedOrNativeEvent(value)) {
                            value = props.field.defaultItemValue;
                        }

                        return items.unshift(props.field.itemTemplate(value));
                    });
                },
                push: value => {
                    updateFieldState(props, items => {
                        if (checkIfUndefinedOrNativeEvent(value)) {
                            value = props.field.defaultItemValue;
                        }

                        return items.push(props.field.itemTemplate(value));
                    });
                },
                remove: item => {
                    updateFieldState(props, items => items.filter(x => x !== item));
                }
            })
        };
    }

    componentDidMount() {
        this.performValidation();
    }

    componentDidUpdate(previousProps: Props<A, T>) {
        if (this.props.error !== previousProps.error) {
            this.performValidation();
        }
    }

    componentWillUnmount() {
        if (this.props.error.isDefined) {
            this.props.setFieldState(
                this.props.field,
                Object.assign({}, this.props.fieldState, { error: None })
            );
        }
    }

    performValidation(): void {
        if (!this.props.error.equals(this.props.fieldState.error)) {
            this.props.setFieldState(
                this.props.field,
                Object.assign({}, this.props.fieldState, { error: this.props.error })
            );
        }
    }

    render() {
        return this.props.children(this.state.fieldBag);
    }
}

type BoundProps<A, T> = {
    field: ArrayFieldRef<A, T>,
    validator?: FieldValidator<List<T>>,
    children: (ArrayFieldBag<A, T>) => React.Node
};

/**
 * Main purpose is to prevent misuse of optional argument
 */
function checkIfUndefinedOrNativeEvent(e: any): %checks {
    return typeof e === 'undefined' || (e.nativeEvent != null && e.nativeEvent instanceof Event);
}

function updateFieldState<A, T>(props: Props<A, T>, updater: (List<T>) => List<T>): void {
    props.setFieldState(
        props.field,
        Object.assign({}, props.fieldState, { value: updater(props.fieldState.value) })
    );
}

function checkBounds(items: List<any>, index: number): void {
    if (index < 0 || index >= items.size) {
        throw new Error(`Index out of bounds, got ${index}`);
    }
}

class BoundArrayField<A, T: FieldRefType<any>> extends React.PureComponent<BoundProps<A, T>> {
    render() {
        return (
            <Consumer>
                {({ fieldStates, setFieldState, formAccessors }: FormContextValue) => {
                    let fieldState: ArrayFieldState<T> = fieldStates.get(
                        this.props.field,
                        this.props.field.initialState
                    );

                    let error = validateField(
                        fieldState.value,
                        this.props.validator,
                        formAccessors
                    );

                    return (
                        <ArrayField
                            field={this.props.field}
                            fieldState={fieldState}
                            error={error}
                            setFieldState={setFieldState}>
                            {this.props.children}
                        </ArrayField>
                    );
                }}
            </Consumer>
        );
    }
}

export default BoundArrayField;
