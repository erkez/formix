import { defineArrayField, defineField, isArrayFieldRef, isFieldRef } from './references';

describe('references', () => {
    describe('FieldRef', () => {
        const fieldRef = defineField('fizz');

        it('should define FieldRef', () => {
            expect(fieldRef.initialState).toMatchSnapshot();
        });

        it('should define FieldRef initially disabled', () => {
            const disabledFieldRef = defineField('', true);
            expect(disabledFieldRef.initialState.disabled).toBe(true);
        });

        it('should correctly identify FieldRef', () => {
            expect(isFieldRef(fieldRef)).toBe(true);
            expect(isArrayFieldRef(fieldRef)).toBe(false);
        });
    });

    describe('ArrayFieldRef', () => {
        const arrayFieldRef = defineArrayField(['fizz'], (value) => ({ name: defineField(value) }));

        it('should define ArrayFieldRef', () => {
            expect(arrayFieldRef.initialState).toMatchSnapshot();
        });

        it('should define ArrayFieldRef initially disabled', () => {
            const disabledFieldRef = defineArrayField([], () => ({}), true);
            expect(disabledFieldRef.initialState.disabled).toBe(true);
        });

        it('should create item in array', () => {
            const item = arrayFieldRef.itemTemplate('buzz');
            expect(item).toEqual({
                name: defineField('buzz')
            });
        });

        it('should correctly identify ArrayFieldRef', () => {
            expect(isArrayFieldRef(arrayFieldRef)).toBe(true);
            expect(isFieldRef(arrayFieldRef)).toBe(true);
        });
    });
});
