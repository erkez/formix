// @flow

import * as React from 'react';
import { useField } from './Field';
import type { FieldRef } from './types';

export function useFieldValue<T>(fieldRef: FieldRef<T>): [T, (value: T) => void] {
    const field = useField(fieldRef);
    return React.useMemo(() => [field.value, field.setValue], [field.value, field.setValue]);
}
