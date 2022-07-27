/**
 * @param {object}                        opts - Test options
 *
 * @param {import('../../../../../types/index.js')}   opts.Module - Module to test
 *
 * @param {object}                        opts.chai - Chai
 */
export function run({ Module, chai })
{
   const { assert } = chai;
   const { DynArrayReducer } = Module;

   describe(`(Array) API Test`, () =>
   {
      describe(`Main API`, () =>
      {
         it(`iterator no values`, () =>
         {
            const dynArray = new DynArrayReducer([]);
            assert.deepEqual([...dynArray], []);
         });

         it(`iterator no values (no backing array)`, () =>
         {
            const dynArray = new DynArrayReducer();
            assert.deepEqual([...dynArray], []);
         });

         it(`iterator no values (no backing array w/ filter)`, () =>
         {
            const dynArray = new DynArrayReducer();
            dynArray.filters.add(() => true);
            assert.deepEqual([...dynArray], []);
            assert.deepEqual([...dynArray.index], []);
         });

         it(`data (getter)`, () =>
         {
            const array = [1, 2];
            const dynArray = new DynArrayReducer(array);
            assert.equal(dynArray.data, array, 'data (getter) returns same array');
         });

         it(`length (getter)`, () =>
         {
            const dynArray = new DynArrayReducer([1, 2]);
            assert.equal(dynArray.length, 2, 'length (getter) returns 2');
         });

         it(`length (getter no array)`, () =>
         {
            const dynArray = new DynArrayReducer();
            assert.equal(dynArray.length, 0, 'length (getter) returns 0');
         });

         it(`reversed data (no index)`, () =>
         {
            const dynArray = new DynArrayReducer([1, 2]);

            assert.deepEqual([...dynArray], [1, 2]);

            dynArray.reversed = true;

            assert.deepEqual([...dynArray], [2, 1]);

            dynArray.reversed = false;

            assert.deepEqual([...dynArray], [1, 2]);
         });

         it(`setData (update external)`, () =>
         {
            const array = [1, 2];
            const dynArray = new DynArrayReducer(array);
            dynArray.setData([3, 4]);
            assert.isTrue(dynArray.data === array, [3, 4], 'internal array is the same as initially set');
            assert.deepEqual(array, [3, 4], 'setData updates external array');
         });

         it(`setData (replace external)`, () =>
         {
            const array = [1, 2];
            const array2 = [3, 4, 5];
            const dynArray = new DynArrayReducer(array);
            dynArray.setData(array2, true);
            assert.isTrue(dynArray.data === array2, 'setData replaces internal array');
         });

         it(`setData (replace external w/ iterable)`, () =>
         {
            const array = [1, 2];
            const set = new Set([3, 4]);
            const dynArray = new DynArrayReducer(array);
            dynArray.setData(set, true);
            assert.isFalse(dynArray.data === array, 'setData replaces internal array');
            assert.deepEqual(dynArray.data, [3, 4], 'setData replaces internal array');
         });

         it(`setData (replace external & index updates)`, () =>
         {
            const array = [1, 2];
            const array2 = [3, 4, 5];
            const dynArray = new DynArrayReducer(array);
            dynArray.filters.add(() => true);

            assert.equal(dynArray.index.length, 2, 'initial index length is 2');

            dynArray.setData(array2, true);

            assert.isTrue(dynArray.data === array2, 'setData replaces internal array');

            assert.equal(dynArray.index.length, 3, 'initial index length is 3');
         });

         it(`setData (null initial backing; set external; setData null w/ no external modification)`, () =>
         {
            const array = [1, 2];
            const dynArray = new DynArrayReducer();
            assert.isNull(dynArray.data);
            dynArray.setData(array);
            assert.isTrue(dynArray.data === array, [1, 2], 'internal array is the same as initially set');
            dynArray.setData(null);
            assert.isNull(dynArray.data);
            assert.deepEqual(array, [1, 2], 'setData null does not update external array');
         });

         it(`set from DynData`, () =>
         {
            const dynArray = new DynArrayReducer({
               data: [1, 3, 2],
               filters: [(val) => val > 1],
               sort: (a, b) => b - a
            });

            assert.deepEqual([...dynArray], [3, 2]);
         });

         it(`set from DynData / iterable`, () =>
         {
            const dynArray = new DynArrayReducer({
               data: new Set([1, 2, 3]),
               filters: [(val) => val > 1],
               sort: (a, b) => b - a
            });

            assert.deepEqual([...dynArray], [3, 2]);
         });

         it(`subscribe / notify / unsubscribe`, () =>
         {
            const data = [1, 2];

            const dynArray = new DynArrayReducer({
               data,
               filters: [(val) => val > 1],
               sort: (a, b) => b - a
            });

            let callbackSub = 0;

            assert.equal(callbackSub, 0);

            const unsubscribe = dynArray.subscribe(() => callbackSub++);

            assert.equal(callbackSub, 1);

            data.push(3);
            dynArray.index.update();

            assert.equal(callbackSub, 2);

            unsubscribe();
         });
      });

      describe(`AdapterFilter (filters)`, () =>
      {
         it(`length (getter)`, () =>
         {
            const dynArray = new DynArrayReducer({ data: [1, 2], filters: [() => null, () => null] });
            assert.equal(dynArray.filters.length, 2, 'length (getter) returns 2');
         });

         it(`iterator (no filters)`, () =>
         {
            const dynArray = new DynArrayReducer([1, 2]);

            assert.deepEqual([...dynArray.filters], [], 'iterator returns no values');
         });

         it(`iterator (2 values)`, () =>
         {
            const dynArray = new DynArrayReducer({
               data: [1, 2],
               filters: [{ id: 'a', filter: () => null }, { id: 'b', filter: () => null }]
            });

            assert.deepEqual([...dynArray.filters].map((f) => f.id), ['a', 'b'], 'iterator returns values');
         });

         it(`iterator - add with no id (default void 0 assigned)`, () =>
         {
            const dynArray = new DynArrayReducer({
               data: [1, 2],
               filters: [{ filter: () => null }, { filter: () => null }]
            });

            assert.deepEqual([...dynArray.filters].map((f) => f.id), [void 0, void 0], 'iterator returns values');
         });

         it(`add - multiple w/ weight`, () =>
         {
            const dynArray = new DynArrayReducer({
               data: [],
               filters: [{ id: 'c', filter: () => null }, { id: 'a', filter: () => null, weight: 0.1 }, { id: 'b', filter: () => null, weight: 0.5 }]
            });

            assert.deepEqual([...dynArray.filters].map((f) => ({ id: f.id, weight: f.weight })),
             [{ id: 'a', weight: 0.1 }, { id: 'b', weight: 0.5 }, { id: 'c', weight: 1 }], 'add multiple w/ weight');
         });

         it(`add - filter exclude / add value to array / regenerate index`, () =>
         {
            const array = [1, 2];

            const dynArray = new DynArrayReducer({
               data: array,
               filters: [(value) => value > 1]
            });

            assert.deepEqual([...dynArray], [2], 'filter excludes 1 from index');

            // This forces the index to be regenerated.
            array.push(3);
            dynArray.index.update();

            assert.deepEqual([...dynArray], [2, 3], 'filter excludes 1 from index');
         });

         it(`clear w/ unsubscribe`, () =>
         {
            const dar = new DynArrayReducer([]);

            let unsubscribeCalled = false;

            const filter = () => null;
            filter.subscribe = () => () => unsubscribeCalled = true;

            dar.filters.add(filter);
            dar.filters.clear();

            assert.equal(dar.filters.length, 0);
            assert.isTrue(unsubscribeCalled);
         });

         it(`remove - no filters added`, () =>
         {
            const dar = new DynArrayReducer([]);

            assert.equal(dar.filters.length, 0);
            dar.filters.remove(() => null);
            assert.equal(dar.filters.length, 0);
         });

         it(`remove - exact filter added`, () =>
         {
            const dar = new DynArrayReducer([]);

            const filter = () => null;

            dar.filters.add(filter);
            assert.equal(dar.filters.length, 1);
            dar.filters.remove(filter);
            assert.equal(dar.filters.length, 0);
         });

         it(`remove filter w/ unsubscribe`, () =>
         {
            const dar = new DynArrayReducer([]);

            let unsubscribeCalled = false;

            const filter = () => null;
            filter.subscribe = () => () => unsubscribeCalled = true;

            dar.filters.add(filter);

            assert.equal(dar.filters.length, 1);

            dar.filters.remove(filter);

            assert.equal(dar.filters.length, 0);
            assert.isTrue(unsubscribeCalled);
         });

         it(`remove filterData`, () =>
         {
            const dar = new DynArrayReducer([]);

            const filterData = { filter: () => null };

            dar.filters.add(filterData);

            assert.equal(dar.filters.length, 1);

            dar.filters.remove(filterData);

            assert.equal(dar.filters.length, 0);
         });

         it(`remove w/ incorrect filterData (no removal)`, () =>
         {
            const dar = new DynArrayReducer([]);

            dar.filters.add(() => null);

            assert.equal(dar.filters.length, 1);

            dar.filters.remove(void 0, 'bogus');

            assert.equal(dar.filters.length, 1);
         });

         it(`removeBy - no filters added`, () =>
         {
            const dar = new DynArrayReducer([]);

            assert.equal(dar.filters.length, 0);
            dar.filters.removeBy(() => null);
            assert.equal(dar.filters.length, 0);
         });

         it(`removeBy - filter w/ unsubscribe`, () =>
         {
            const dar = new DynArrayReducer([]);

            let unsubscribeCalled = false;

            const filter = () => null;
            filter.subscribe = () => () => unsubscribeCalled = true;

            dar.filters.add(filter);

            assert.equal(dar.filters.length, 1);

            dar.filters.removeBy(({ id }) => id === void 0);

            assert.equal(dar.filters.length, 0);
            assert.isTrue(unsubscribeCalled);
         });

         it(`removeBy - callback receives correct data`, () =>
         {
            const dar = new DynArrayReducer([]);

            dar.filters.add(() => null);

            assert.equal(dar.filters.length, 1);

            dar.filters.removeBy((data) =>
            {
               assert.isObject(data);
               assert.equal(Object.keys(data).length, 3);
               assert.isTrue('id' in data);
               assert.isTrue('filter' in data);
               assert.isTrue('weight' in data);

               return data.id === void 0;
            });

            assert.equal(dar.filters.length, 0);
         });

         it(`removeById - no filters added`, () =>
         {
            const dar = new DynArrayReducer([]);

            assert.equal(dar.filters.length, 0);
            dar.filters.removeById(void 0);
            assert.equal(dar.filters.length, 0);
         });

         it(`removeById - filter w/ subscribe / unsubscribe`, () =>
         {
            const dar = new DynArrayReducer([]);

            let unsubscribeCalled = false;

            const filter = () => null;
            filter.subscribe = () => () => unsubscribeCalled = true;

            dar.filters.add({ id: 123, filter });

            assert.equal(dar.filters.length, 1);

            dar.filters.removeById({}, 123);

            assert.equal(dar.filters.length, 0);
            assert.isTrue(unsubscribeCalled);
         });

         it(`removeById - FilterData w/ subscribe / unsubscribe`, () =>
         {
            const dar = new DynArrayReducer([]);

            let unsubscribeCalled = false;

            const filter = () => null;

            dar.filters.add({ id: 123, filter, subscribe: () => () => unsubscribeCalled = true });

            assert.equal(dar.filters.length, 1);

            dar.filters.removeById({}, 123);

            assert.equal(dar.filters.length, 0);
            assert.isTrue(unsubscribeCalled);
         });
      });

      describe(`AdapterSort`, () =>
      {
         it(`set sort`, () =>
         {
            const dynArray = new DynArrayReducer([1, 2]);

            dynArray.sort.set((a, b) => b - a);

            assert.deepEqual([...dynArray], [2, 1], 'reverse sorts numbers');
         });

         it(`set sort w/ subscribe`, () =>
         {
            const dynArray = new DynArrayReducer([1, 2]);

            let unsubscribeCalled = false;

            const sort = (a, b) => b - a;
            sort.subscribe = (handler) =>
            {
               handler(); // Proper subscribe API to kick off an update must invoke the handler on subscribe.
               return () => unsubscribeCalled = true;
            };

            dynArray.sort.set(sort);

            assert.deepEqual([...dynArray], [2, 1], 'reverse sorts numbers');

            dynArray.sort.reset();

            assert.deepEqual([...dynArray], [1, 2], 'initial order');
            assert.isTrue(unsubscribeCalled);
         });

         it(`set sort w/ subscribe - no handler callback`, () =>
         {
            const dynArray = new DynArrayReducer([1, 2]);

            let unsubscribeCalled = false;

            const sort = (a, b) => b - a;
            sort.subscribe = () => () => unsubscribeCalled = true;

            dynArray.sort.set(sort);

            // Manual update as the subscribe function of `sort` does not follow the subscribe protocol.
            dynArray.index.update();

            assert.deepEqual([...dynArray], [2, 1], 'reverse sorts numbers');

            dynArray.sort.reset();

            assert.deepEqual([...dynArray], [1, 2], 'initial order');
            assert.isTrue(unsubscribeCalled);
         });

         it(`set compare function w/ subscribe / unsubscribe`, () =>
         {
            const dynArray = new DynArrayReducer([1, 2]);

            let unsubscribeCalled = false;

            const compare = (a, b) => b - a;
            compare.subscribe = (handler) => { handler(); return () => unsubscribeCalled = true; };

            dynArray.sort.set(compare);

            assert.deepEqual([...dynArray], [2, 1], 'reverse order');

            dynArray.sort.set(null);

            assert.deepEqual([...dynArray], [1, 2], 'initial order');
            assert.isTrue(unsubscribeCalled);
         });

         it(`set SortData w/ subscribe / unsubscribe`, () =>
         {
            const dynArray = new DynArrayReducer([1, 2]);

            let unsubscribeCalled = false;

            dynArray.sort.set({
               compare: (a, b) => b - a,
               subscribe: (handler) => { handler(); return () => unsubscribeCalled = true; }
            });

            assert.deepEqual([...dynArray], [2, 1], 'reverse order');

            dynArray.sort.set(null);

            assert.deepEqual([...dynArray], [1, 2], 'initial order');
            assert.isTrue(unsubscribeCalled);
         });
      });

      describe(`Indexer`, () =>
      {
         it(`iterator no index set`, () =>
         {
            const dynArray = new DynArrayReducer([1, 2]);

            assert.deepEqual([...dynArray.index], [], 'no index');
         });

         it(`iterator index set`, () =>
         {
            const dynArray = new DynArrayReducer([1, 2]);

            assert.deepEqual([...dynArray.index], [], 'no index');

            dynArray.sort.set((a, b) => b - a);

            assert.deepEqual([...dynArray.index], [1, 0], 'sorted index');

            dynArray.sort.reset();

            assert.deepEqual([...dynArray.index], [], 'no index');
         });

         it(`iterator index reversed`, () =>
         {
            const dynArray = new DynArrayReducer([1, 2]);

            assert.deepEqual([...dynArray.index], [], 'no index');

            dynArray.sort.set((a, b) => b - a);

            assert.deepEqual([...dynArray.index], [1, 0], 'sorted index');

            dynArray.reversed = true;

            assert.deepEqual([...dynArray.index], [0, 1], 'reverse sorted index');

            dynArray.sort.reset();

            assert.deepEqual([...dynArray.index], [], 'no index');
         });

         it(`sort set / hash is number / reset & hash is null`, () =>
         {
            const dynArray = new DynArrayReducer([1, 2]);

            assert.isNull(dynArray.index.hash);

            dynArray.sort.set((a, b) => b - a);

            assert.isNumber(dynArray.index.hash);

            dynArray.sort.reset();

            assert.isNull(dynArray.index.hash);
         });

         it(`isActive is false / sort set & isActive is true / reset & isActive is false`, () =>
         {
            const dynArray = new DynArrayReducer([1, 2]);

            assert.isFalse(dynArray.index.isActive);

            dynArray.sort.set((a, b) => b - a);

            assert.isTrue(dynArray.index.isActive);

            dynArray.sort.reset();

            assert.isFalse(dynArray.index.isActive);
         });

         it(`length when index defined and reset`, () =>
         {
            const dynArray = new DynArrayReducer([1, 2]);

            assert.equal(dynArray.index.length, 0);

            dynArray.sort.set((a, b) => b - a);

            assert.equal(dynArray.index.length, 2);

            dynArray.sort.reset();

            assert.equal(dynArray.index.length, 0);
         });
      });
   });
}
