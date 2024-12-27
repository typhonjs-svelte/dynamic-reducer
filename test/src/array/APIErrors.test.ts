import { expect }          from 'vitest';

import { DynArrayReducer } from '#package';

/**
 * Provides a way to create DynArrayReducer with the types applied in the instance returned.
 *
 * @param [data] - Initial data.
 *
 * @returns New DynArrayReducer instance.
 */
function createReducer<T>(data?: T[]): DynArrayReducer<T>
{
   return new DynArrayReducer(data);
}

describe(`(Array) API Errors`, () =>
{
   describe(`ctor errors`, () =>
   {
      it(`null argument`, () =>
      {
         expect(() => new DynArrayReducer(null)).to.throw(TypeError,
          `DynArrayReducer error: 'data' is not iterable.`);
      });

      it(`non-iterable argument`, () =>
      {
         // @ts-expect-error
         expect(() => new DynArrayReducer(false)).to.throw(TypeError,
          `DynArrayReducer error: 'data' is not iterable.`);
      });
   });

   describe(`ctor errors (DataDynArray)`, () =>
   {
      it(`'data' attribute is non-iterable`, () =>
      {
         // @ts-expect-error
         expect(() => new DynArrayReducer({ data: false })).to.throw(TypeError,
          `DynArrayReducer error (DataDynArray): 'data' attribute is not iterable.`);
      });

      it(`'filters' attribute is non-iterable`, () =>
      {
         // @ts-expect-error
         expect(() => new DynArrayReducer({ filters: false })).to.throw(TypeError,
          `DynArrayReducer error (DataDynArray): 'filters' attribute is not iterable.`);
      });

      it(`'sort' attribute is not a function`, () =>
      {
         // @ts-expect-error
         expect(() => new DynArrayReducer({ sort: false })).to.throw(TypeError,
          `DynArrayReducer error (DataDynArray): 'sort' attribute is not a function or object.`);
      });
   });

   describe(`DynArrayReducer API errors`, () =>
   {
      it(`'set reversed' - 'reversed' not boolean`, () =>
      {
         // @ts-expect-error
         expect(() => new DynArrayReducer([]).reversed = 'bad').to.throw(TypeError,
          `DynArrayReducer.reversed error: 'reversed' is not a boolean.`);
      });

      it(`'setData' - 'data' not iterable`, () =>
      {
         // @ts-expect-error
         expect(() => new DynArrayReducer([]).setData()).to.throw(TypeError,
          `DynArrayReducer.setData error: 'data' is not iterable.`);
      });

      it(`'setData' - 'replace' not a boolean`, () =>
      {
         // @ts-expect-error
         expect(() => new DynArrayReducer([]).setData([], 'bad')).to.throw(TypeError,
          `DynArrayReducer.setData error: 'replace' is not a boolean.`);
      });
   });

   describe(`AdapterFilters errors`, () =>
   {
      it(`add - wrong argument`, () =>
      {
         const dar = createReducer();

         // @ts-expect-error
         expect(() => dar.filters.add(false)).to.throw(TypeError,
          `AdapterFilters error: 'filter' is not a function or object.`);
      });

      it(`add - null`, () =>
      {
         const dar = createReducer();

         expect(() => dar.filters.add(null)).to.throw(TypeError,
          `AdapterFilters error: 'filter' is not a function or object.`);
      });

      it(`add - object - no data`, () =>
      {
         const dar = createReducer();

         // @ts-expect-error
         expect(() => dar.filters.add({})).to.throw(TypeError,
          `AdapterFilters error: 'filter' attribute is not a function.`);
      });

      it(`add - object - no data`, () =>
      {
         const dar = createReducer();

         // @ts-expect-error
         expect(() => dar.filters.add({ filter: false })).to.throw(TypeError,
          `AdapterFilters error: 'filter' attribute is not a function.`);
      });

      it(`add - object - weight not a number`, () =>
      {
         const dar = createReducer();

         // @ts-expect-error
         expect(() => dar.filters.add({ filter: () => null, weight: false })).to.throw(TypeError,
          `AdapterFilters error: 'weight' attribute is not a number between '0 - 1' inclusive.`);
      });

      it(`add - object - weight less than 0 (-1)`, () =>
      {
         const dar = createReducer();

         expect(() => dar.filters.add({ filter: () => null, weight: -1 })).to.throw(TypeError,
          `AdapterFilters error: 'weight' attribute is not a number between '0 - 1' inclusive.`);
      });

      it(`add - object - weight greater than 1 (2)`, () =>
      {
         const dar = createReducer();

         expect(() => dar.filters.add({ filter: () => null, weight: 2 })).to.throw(TypeError,
          `AdapterFilters error: 'weight' attribute is not a number between '0 - 1' inclusive.`);
      });

      it(`add - filter w/ subscribe - no unsubscribe`, () =>
      {
         const dar = createReducer();

         const filter = () => null;
         filter.subscribe = () => null;

         expect(() => dar.filters.add(filter)).to.throw(TypeError,
          `AdapterFilters error: Filter has subscribe function, but no unsubscribe function is returned.`);
      });

      it(`add - duplicate filter w/ subscribe`, () =>
      {
         const dar = createReducer();

         const filter = () => null;
         filter.subscribe = () => () => null;

         expect(() => dar.filters.add(filter, filter)).to.throw(Error,
          `AdapterFilters error: Filter added already has an unsubscribe function registered.`);
      });

      // removeBy ----------------------------------------------------------------------------------------------

      it(`removeBy - callback not a function`, () =>
      {
         const dar = createReducer();
         dar.filters.add(() => null);

         // @ts-expect-error
         expect(() => dar.filters.removeBy()).to.throw(TypeError,
          `AdapterFilters error: 'callback' is not a function.`);
      });
   });

   describe(`AdapterSort errors`, () =>
   {
      it(`set - compareFn w/ subscribe - no unsubscribe`, () =>
      {
         const dar = createReducer();

         const compareFn = () => null;
         compareFn.subscribe = () => null;

         expect(() => dar.sort.set(compareFn)).to.throw(Error,
          `AdapterSort error: sort has 'subscribe' function, but no 'unsubscribe' function is returned.`);
      });


      it(`set SortData w/ compare not as function`, () =>
      {
         const dar = createReducer();

         // @ts-expect-error
         expect(() => dar.sort.set({ compare: false })).to.throw(Error,
          `AdapterSort error: 'compare' attribute is not a function.`);
      });
   });

   describe(`DerivedAPI errors`, () =>
   {
      it(`create - parameter not conforming - wrong type`, () =>
      {
         const dar = createReducer();

         // @ts-expect-error
         expect(() => dar.derived.create(false)).to.throw(Error,
          `AdapterDerived.create error: 'options' does not conform to allowed parameters.`);
      });

      it(`create - parameter not conforming - wrong class`, () =>
      {
         const dar = createReducer();

         expect(() => dar.derived.create(DynArrayReducer)).to.throw(Error,
          `AdapterDerived.create error: 'options' does not conform to allowed parameters.`);
      });

      it(`create - parameter not conforming - incorrect 'name' attribute`, () =>
      {
         const dar = createReducer();

         // @ts-expect-error
         expect(() => dar.derived.create({ name: false })).to.throw(Error,
          `AdapterDerived.create error: 'name' is not a string.`);
      });

      it(`create - parameter not conforming - incorrect 'ctor' attribute`, () =>
      {
         const dar = createReducer();

         // @ts-expect-error
         expect(() => dar.derived.create({ ctor: false })).to.throw(Error,
          `AdapterDerived.create error: 'ctor' is not a 'DynArrayReducerDerived'.`);
      });

      it(`create - parameter not conforming - incorrect 'filters' attribute`, () =>
      {
         const dar = createReducer();

         // @ts-expect-error
         expect(() => dar.derived.create({ filters: false })).to.throw(Error,
          `DerivedArrayReducer error (DataDerivedOptions): 'filters' attribute is not iterable.`);
      });

      it(`create - parameter not conforming - incorrect 'sort' attribute`, () =>
      {
         const dar = createReducer();

         // @ts-expect-error
         expect(() => dar.derived.create({ sort: false })).to.throw(Error,
          `DerivedArrayReducer error (DataDerivedOptions): 'sort' attribute is not a function or object.`);
      });

      it(`derived - wrong reversed setter`, () =>
      {
         const dar = createReducer();
         const dr = dar.derived.create('test');

         expect(() => dr.reversed = null).to.throw(Error,
          `DerivedArrayReducer.reversed error: 'reversed' is not a boolean.`);
      });

      it(`destroy - verify all thrown errors.`, () =>
      {
         const dar = createReducer();
         const dr = dar.derived.create('test');

         dr.destroy();

         expect(() => dr.derived.clear()).to.not.throw(Error);
         expect(() => dr.derived.destroy()).to.not.throw(Error);

         expect(() => dr.derived.create('dummy')).to.throw(Error,
          `AdapterDerived.create error: this instance has been destroyed.`);

         expect(() => dr.derived.delete('dummy')).to.throw(Error,
          `AdapterDerived.delete error: this instance has been destroyed.`);

         expect(() => dr.derived.get('dummy')).to.throw(Error,
          `AdapterDerived.get error: this instance has been destroyed.`);
      });
   });
});
