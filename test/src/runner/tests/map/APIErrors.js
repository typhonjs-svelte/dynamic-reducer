/**
 * @param {object}                        opts - Test options
 *
 * @param {import('../../../../../types/index.js')}   opts.Module - Module to test
 *
 * @param {object}                        opts.chai - Chai
 */
export function run({ Module, chai })
{
   const { assert, expect } = chai;
   const { DynMapReducer } = Module;

   describe(`(Map) API Errors`, () =>
   {
      describe(`ctor errors`, () =>
      {
         it(`null argument`, () =>
         {
            expect(() => new DynMapReducer(null)).to.throw(TypeError,
             `DynMapReducer error: 'data' is not a Map.`);
         });

         it(`non-iterable argument`, () =>
         {
            expect(() => new DynMapReducer(false)).to.throw(TypeError,
             `DynMapReducer error: 'data' is not a Map.`);
         });
      });

      describe(`ctor errors (DataDynMap)`, () =>
      {
         it(`'data' attribute is non-iterable`, () =>
         {
            expect(() => new DynMapReducer({ data: false })).to.throw(TypeError,
             `DynMapReducer error (DataDynMap): 'data' attribute is not a Map.`);
         });

         it(`'filters' attribute is non-iterable`, () =>
         {
            expect(() => new DynMapReducer({ data: new Map(), filters: false })).to.throw(TypeError,
             `DynMapReducer error (DataDynMap): 'filters' attribute is not iterable.`);
         });

         it(`'sort' attribute is not a function`, () =>
         {
            expect(() => new DynMapReducer({ data: new Map(), sort: false })).to.throw(TypeError,
             `DynMapReducer error (DataDynMap): 'sort' attribute is not a function.`);
         });
      });

      describe(`DynMapReducer API errors`, () =>
      {
         it(`'set reversed' - 'reversed' not boolean`, () =>
         {
            expect(() => new DynMapReducer().reversed = 'bad').to.throw(TypeError,
             `DynMapReducer.reversed error: 'reversed' is not a boolean.`);
         });

         it(`'setData' - 'data' not iterable`, () =>
         {
            expect(() => new DynMapReducer().setData()).to.throw(TypeError,
             `DynMapReducer.setData error: 'data' is not a Map.`);
         });

         it(`'setData' - 'replace' not a boolean`, () =>
         {
            expect(() => new DynMapReducer().setData(null, 'bad')).to.throw(TypeError,
             `DynMapReducer.setData error: 'replace' is not a boolean.`);
         });
      });

      describe(`AdapterFilters errors`, () =>
      {
         it(`add - no arguments / noop`, () =>
         {
            const dar = new DynMapReducer([]);

            dar.filters.add();

            assert.equal(dar.filters.length, 0);
         });

         it(`add - wrong argument`, () =>
         {
            const dar = new DynMapReducer([]);

            expect(() => dar.filters.add(false)).to.throw(TypeError,
             `AdapterFilters error: 'filter' is not a function or object.`);
         });

         it(`add - null`, () =>
         {
            const dar = new DynMapReducer([]);

            expect(() => dar.filters.add(null)).to.throw(TypeError,
             `AdapterFilters error: 'filter' is not a function or object.`);
         });

         it(`add - object - no data`, () =>
         {
            const dar = new DynMapReducer([]);

            expect(() => dar.filters.add({})).to.throw(TypeError,
             `AdapterFilters error: 'filter' attribute is not a function.`);
         });

         it(`add - object - no data`, () =>
         {
            const dar = new DynMapReducer([]);

            expect(() => dar.filters.add({ filter: false })).to.throw(TypeError,
             `AdapterFilters error: 'filter' attribute is not a function.`);
         });

         it(`add - object - weight not a number`, () =>
         {
            const dar = new DynMapReducer([]);

            expect(() => dar.filters.add({ filter: () => null, weight: false })).to.throw(TypeError,
             `AdapterFilters error: 'weight' attribute is not a number between '0 - 1' inclusive.`);
         });

         it(`add - object - weight less than 0 (-1)`, () =>
         {
            const dar = new DynMapReducer([]);

            expect(() => dar.filters.add({ filter: () => null, weight: -1 })).to.throw(TypeError,
             `AdapterFilters error: 'weight' attribute is not a number between '0 - 1' inclusive.`);
         });

         it(`add - object - weight greater than 1 (2)`, () =>
         {
            const dar = new DynMapReducer([]);

            expect(() => dar.filters.add({ filter: () => null, weight: 2 })).to.throw(TypeError,
             `AdapterFilters error: 'weight' attribute is not a number between '0 - 1' inclusive.`);
         });

         it(`add - filter w/ subscribe - no unsubscribe`, () =>
         {
            const dar = new DynMapReducer([]);

            const filter = () => null;
            filter.subscribe = () => null;

            expect(() => dar.filters.add(filter)).to.throw(TypeError,
             `AdapterFilters error: Filter has subscribe function, but no unsubscribe function is returned.`);
         });

         it(`add - duplicate filter w/ subscribe`, () =>
         {
            const dar = new DynMapReducer([]);

            const filter = () => null;
            filter.subscribe = () => () => null;

            expect(() => dar.filters.add(filter, filter)).to.throw(Error,
             `AdapterFilters error: Filter added already has an unsubscribe function registered.`);
         });

         // removeBy ----------------------------------------------------------------------------------------------

         it(`removeBy - callback not a function`, () =>
         {
            const dar = new DynMapReducer([]);
            dar.filters.add(() => null);

            expect(() => dar.filters.removeBy()).to.throw(TypeError,
             `AdapterFilters error: 'callback' is not a function.`);
         });
      });

      describe(`AdapterSort errors`, () =>
      {
         it(`set - compareFn w/ subscribe - no unsubscribe`, () =>
         {
            const dar = new DynMapReducer([]);

            const compareFn = () => null;
            compareFn.subscribe = () => null;

            expect(() => dar.sort.set(compareFn)).to.throw(Error,
             `AdapterSort error: sort has 'subscribe' function, but no 'unsubscribe' function is returned.`);
         });


         it(`set SortData w/ compare not as function`, () =>
         {
            const dar = new DynMapReducer([]);

            expect(() => dar.sort.set({ compare: false })).to.throw(Error,
             `AdapterSort error: 'compare' attribute is not a function.`);
         });
      });
   });
}
