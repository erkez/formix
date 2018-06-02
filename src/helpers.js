// @flow

import type { FormSubmitBag } from './types';

export function submitPromise<T, R: Promise<any>>(form: FormSubmitBag<T>, promise: R): R {
    form.setSubmitting(true);
    promise.then(form.resetForm).catch(() => form.setSubmitting(false));
    return promise;
}
