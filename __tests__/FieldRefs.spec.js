// @flow

import { Option } from '@ekz/option';
import { defineField, mappedTo, getFieldRefMapping } from '../src/FieldRefs';
import type { FieldRef } from '../src/types';

describe('FieldRefs', () => {
    describe('#getFieldRefMapping', () => {
        it('should get mapping for leaf fieldRef', () => {
            const fieldRef = defineField('');

            const { sourceRef, fromSource, toSource } = getFieldRefMapping(fieldRef);

            expect(sourceRef).toBe(fieldRef);
            expect(fromSource('abc')).toBe('abc');
            expect(toSource('def')).toBe('def');
        });

        it('should get mapping for one level mapped type', () => {
            const fieldRef = defineField('');
            const mappedFieldRef = mappedTo(fieldRef, Option.of, opt => opt.getOrReturn(''));

            const { sourceRef, fromSource, toSource } = getFieldRefMapping(mappedFieldRef);

            expect(sourceRef).toBe(fieldRef);
            expect(fromSource('abc')).toEqual(Option.Some('abc'));
            expect(toSource(Option.Some('def'))).toBe('def');
            expect(toSource(Option.None)).toBe('');
        });

        it('should get mapping for n-level mapped type', () => {
            const fieldRef: FieldRef<string | null> = defineField(null);
            const firstMappedFieldRef: FieldRef<Option<string>> = mappedTo(
                fieldRef,
                Option.of,
                opt => opt.filter(x => x.trim().length > 0).getOrReturn(null)
            );
            const secondMappedFieldRef: FieldRef<string> = mappedTo(
                firstMappedFieldRef,
                x => x.getOrReturn(''),
                Option.of
            );

            const { sourceRef, fromSource, toSource } = getFieldRefMapping(secondMappedFieldRef);

            expect(sourceRef).toBe(fieldRef);
            expect(fromSource(null)).toBe('');
            expect(fromSource('abc')).toBe('abc');
            expect(toSource('   ')).toBe(null);
            expect(toSource('abc')).toBe('abc');
        });
    });
});
