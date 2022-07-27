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
   const { DynMapReducer } = Module;

   describe(`(Map) API Test`, () =>
   {
      describe(`Main API`, () =>
      {
         it(`iterator no values`, () =>
         {
            const dynMap = new DynMapReducer(new Map());
            assert.deepEqual([...dynMap], []);
         });

         it(`iterator no values (no backing Map)`, () =>
         {
            const dynMap = new DynMapReducer();
            assert.deepEqual([...dynMap], []);
         });

         it(`iterator no values (no backing Map w/ filter)`, () =>
         {
            const dynMap = new DynMapReducer();
            dynMap.filters.add(() => true);
            assert.deepEqual([...dynMap], []);
            assert.deepEqual([...dynMap.index], []);
         });

         it(`data (getter)`, () =>
         {
            const map = new Map([[1, 1], [2, 2]]);
            const dynMap = new DynMapReducer(map);
            assert.equal(dynMap.data, map, 'data (getter) returns same Map');
         });

         it(`length (getter)`, () =>
         {
            const dynMap = new DynMapReducer(new Map([[1, 1], [2, 2]]));
            assert.equal(dynMap.length, 2, 'length (getter) returns 2');
         });

         it(`length (getter no map)`, () =>
         {
            const dynMap = new DynMapReducer();
            assert.equal(dynMap.length, 0, 'length (getter) returns 0');
         });

         it(`reversed data (no index)`, () =>
         {
            const dynMap = new DynMapReducer(new Map([[1, 1], [2, 2]]));

            assert.deepEqual([...dynMap], [1, 2]);

            dynMap.reversed = true;

            assert.deepEqual([...dynMap], [2, 1]);

            dynMap.reversed = false;

            assert.deepEqual([...dynMap], [1, 2]);
         });

         it(`setData (update external)`, () =>
         {
            const map = new Map([[1, 1], [2, 2]]);
            const dynMap = new DynMapReducer(map);
            dynMap.setData(new Map([[1, 3], [2, 4]]));
            assert.isTrue(dynMap.data === map, [3, 4], 'internal map is the same as initially set');
            assert.deepEqual([...map.values()], [3, 4], 'setData updates external map');
         });

         it(`setData (replace external)`, () =>
         {
            const map = new Map([[1, 1], [2, 2]]);
            const map2 = new Map([[3, 3], [4, 4], [5, 5]]);
            const dynMap = new DynMapReducer(map);
            dynMap.setData(map2, true);
            assert.isTrue(dynMap.data === map2, 'setData replaces internal map');
         });

         it(`setData (replace external & index updates)`, () =>
         {
            const map = new Map([[1, 1], [2, 2]]);
            const map2 = new Map([[3, 3], [4, 4], [5, 5]]);
            const dynMap = new DynMapReducer(map);
            dynMap.filters.add(() => true);

            assert.equal(dynMap.index.length, 2, 'initial index length is 2');

            dynMap.setData(map2, true);

            assert.isTrue(dynMap.data === map2, 'setData replaces internal map');

            assert.equal(dynMap.index.length, 3, 'initial index length is 3');
         });

         it(`setData (replace external & index updates)`, () =>
         {
            const map = new Map([[1, 1], [2, 2]]);
            const map2 = new Map([[3, 3], [4, 4], [5, 5]]);
            const dynMap = new DynMapReducer(map);
            dynMap.filters.add(() => true);

            assert.equal(dynMap.index.length, 2, 'initial index length is 2');

            dynMap.setData(map2, true);

            assert.isTrue(dynMap.data === map2, 'setData replaces internal map');

            assert.equal(dynMap.index.length, 3, 'initial index length is 3');
         });

         it(`setData (update internal / remove data / index updates)`, () =>
         {
            const dynMap = new DynMapReducer(new Map([[3, 3], [4, 4], [5, 5]]));
            dynMap.filters.add(() => true);

            assert.equal(dynMap.index.length, 3, 'initial index length is 3');

            dynMap.setData(new Map([[3, 3], [5, 5]]));

            assert.equal(dynMap.index.length, 2, 'new index length is 2');
            assert.deepEqual([...dynMap], [3, 5], 'internal data is correct');
         });

         it(`setData (null initial backing; set external; setData null w/ no external modification)`, () =>
         {
            const map = new Map([[1, 1], [2, 2]]);
            const dynMap = new DynMapReducer();
            assert.isNull(dynMap.data);
            dynMap.setData(map);
            assert.isTrue(dynMap.data === map, [1, 2], 'internal map is the same as initially set');
            dynMap.setData(null);
            assert.isNull(dynMap.data);
            assert.deepEqual([...map.values()], [1, 2], 'setData null does not update external map');
         });

         it(`setData (null initial backing; set external; setData null w/ replace true)`, () =>
         {
            const map = new Map([[1, 1], [2, 2]]);
            const dynMap = new DynMapReducer();
            assert.isNull(dynMap.data);
            dynMap.setData(map);
            assert.isTrue(dynMap.data === map, [1, 2], 'internal map is the same as initially set');
            dynMap.setData(null, true);
            assert.isNull(dynMap.data);
            assert.deepEqual([...map.values()], [1, 2], 'setData null does not update external map');
         });

         it(`set from DynData`, () =>
         {
            const dynMap = new DynMapReducer({
               data: new Map([[1, 1], [3, 3], [2, 2]]),
               filters: [(val) => val > 1],
               sort: (a, b) => b - a
            });

            assert.deepEqual([...dynMap], [3, 2]);
         });

         it(`subscribe / notify / unsubscribe`, () =>
         {
            const data = new Map([[1, 1], [2, 2]]);

            const dynMap = new DynMapReducer({
               data,
               filters: [(val) => val > 1],
               sort: (a, b) => b - a
            });

            let callbackSub = 0;

            assert.equal(callbackSub, 0);

            const unsubscribe = dynMap.subscribe(() => callbackSub++);

            assert.equal(callbackSub, 1);

            data.set(3, 3);
            dynMap.index.update();

            assert.equal(callbackSub, 2);

            unsubscribe();
         });
      });

      describe(`AdapterFilter (filters)`, () =>
      {
         it(`length (getter)`, () =>
         {
            const dynMap = new DynMapReducer({ filters: [() => null, () => null] });
            assert.equal(dynMap.filters.length, 2, 'length (getter) returns 2');
         });

         it(`iterator (no filters)`, () =>
         {
            const dynMap = new DynMapReducer();

            assert.deepEqual([...dynMap.filters], [], 'iterator returns no values');
         });

         it(`iterator (2 values)`, () =>
         {
            const dynMap = new DynMapReducer({
               filters: [{ id: 'a', filter: () => null }, { id: 'b', filter: () => null }]
            });

            assert.deepEqual([...dynMap.filters].map((f) => f.id), ['a', 'b'], 'iterator returns values');
         });

         it(`iterator - add with no id (default void 0 assigned)`, () =>
         {
            const dynMap = new DynMapReducer({
               filters: [{ filter: () => null }, { filter: () => null }]
            });

            assert.deepEqual([...dynMap.filters].map((f) => f.id), [void 0, void 0], 'iterator returns values');
         });

         it(`add - multiple w/ weight`, () =>
         {
            const dynMap = new DynMapReducer({
               filters: [{ id: 'c', filter: () => null }, { id: 'a', filter: () => null, weight: 0.1 }, { id: 'b', filter: () => null, weight: 0.5 }]
            });

            assert.deepEqual([...dynMap.filters].map((f) => ({ id: f.id, weight: f.weight })),
             [{ id: 'a', weight: 0.1 }, { id: 'b', weight: 0.5 }, { id: 'c', weight: 1 }], 'add multiple w/ weight');
         });

         it(`add - filter exclude / add value to array / regenerate index`, () =>
         {
            const map = new Map([[1, 1], [2, 2]]);

            const dynMap = new DynMapReducer({
               data: map,
               filters: [(value) => value > 1]
            });

            assert.deepEqual([...dynMap], [2], 'filter excludes 1 from index');

            // This forces the index to be regenerated.
            map.set(3, 3);
            dynMap.index.update();

            assert.deepEqual([...dynMap], [2, 3], 'filter excludes 1 from index');
         });

         it(`clear w/ unsubscribe`, () =>
         {
            const dar = new DynMapReducer();

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
            const dar = new DynMapReducer();

            assert.equal(dar.filters.length, 0);
            dar.filters.remove(() => null);
            assert.equal(dar.filters.length, 0);
         });

         it(`remove - exact filter added`, () =>
         {
            const dar = new DynMapReducer();

            const filter = () => null;

            dar.filters.add(filter);
            assert.equal(dar.filters.length, 1);
            dar.filters.remove(filter);
            assert.equal(dar.filters.length, 0);
         });

         it(`remove filter w/ unsubscribe`, () =>
         {
            const dar = new DynMapReducer();

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
            const dar = new DynMapReducer();

            const filterData = { filter: () => null };

            dar.filters.add(filterData);

            assert.equal(dar.filters.length, 1);

            dar.filters.remove(filterData);

            assert.equal(dar.filters.length, 0);
         });

         it(`remove w/ incorrect filterData (no removal)`, () =>
         {
            const dar = new DynMapReducer();

            dar.filters.add(() => null);

            assert.equal(dar.filters.length, 1);

            dar.filters.remove(void 0, 'bogus');

            assert.equal(dar.filters.length, 1);
         });

         it(`removeBy - no filters added`, () =>
         {
            const dar = new DynMapReducer();

            assert.equal(dar.filters.length, 0);
            dar.filters.removeBy(() => null);
            assert.equal(dar.filters.length, 0);
         });

         it(`removeBy - filter w/ unsubscribe`, () =>
         {
            const dar = new DynMapReducer();

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
            const dar = new DynMapReducer();

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
            const dar = new DynMapReducer();

            assert.equal(dar.filters.length, 0);
            dar.filters.removeById(void 0);
            assert.equal(dar.filters.length, 0);
         });

         it(`removeById - filter w/ subscribe / unsubscribe`, () =>
         {
            const dar = new DynMapReducer();

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
            const dar = new DynMapReducer();

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
            const dynMap = new DynMapReducer(new Map([[1, 1], [2, 2]]));

            dynMap.sort.set((a, b) => b - a);

            assert.deepEqual([...dynMap], [2, 1], 'reverse sorts numbers');
         });

         it(`set sort w/ subscribe`, () =>
         {
            const dynMap = new DynMapReducer(new Map([[1, 1], [2, 2]]));

            let unsubscribeCalled = false;

            const sort = (a, b) => b - a;
            sort.subscribe = (handler) =>
            {
               handler(); // Proper subscribe API to kick off an update must invoke the handler on subscribe.
               return () => unsubscribeCalled = true;
            };

            dynMap.sort.set(sort);

            assert.deepEqual([...dynMap], [2, 1], 'reverse sorts numbers');

            dynMap.sort.reset();

            assert.deepEqual([...dynMap], [1, 2], 'initial order');
            assert.isTrue(unsubscribeCalled);
         });

         it(`set sort w/ subscribe - no handler callback`, () =>
         {
            const dynMap = new DynMapReducer(new Map([[1, 1], [2, 2]]));

            let unsubscribeCalled = false;

            const sort = (a, b) => b - a;
            sort.subscribe = () => () => unsubscribeCalled = true;

            dynMap.sort.set(sort);

            // Manual update as the subscribe function of `sort` does not follow the subscribe protocol.
            dynMap.index.update();

            assert.deepEqual([...dynMap], [2, 1], 'reverse sorts numbers');

            dynMap.sort.reset();

            assert.deepEqual([...dynMap], [1, 2], 'initial order');
            assert.isTrue(unsubscribeCalled);
         });

         it(`set compare function w/ subscribe / unsubscribe`, () =>
         {
            const dynMap = new DynMapReducer(new Map([[1, 1], [2, 2]]));

            let unsubscribeCalled = false;

            const compare = (a, b) => b - a;
            compare.subscribe = (handler) => { handler(); return () => unsubscribeCalled = true; };

            dynMap.sort.set(compare);

            assert.deepEqual([...dynMap], [2, 1], 'reverse order');

            dynMap.sort.set(null);

            assert.deepEqual([...dynMap], [1, 2], 'initial order');
            assert.isTrue(unsubscribeCalled);
         });

         it(`set SortData w/ subscribe / unsubscribe`, () =>
         {
            const dynMap = new DynMapReducer(new Map([[1, 1], [2, 2]]));

            let unsubscribeCalled = false;

            dynMap.sort.set({
               compare: (a, b) => b - a,
               subscribe: (handler) => { handler(); return () => unsubscribeCalled = true; }
            });

            assert.deepEqual([...dynMap], [2, 1], 'reverse order');

            dynMap.sort.set(null);

            assert.deepEqual([...dynMap], [1, 2], 'initial order');
            assert.isTrue(unsubscribeCalled);
         });
      });

      describe(`Indexer`, () =>
      {
         it(`iterator no index set; null backing map`, () =>
         {
            const dynMap = new DynMapReducer();

            assert.deepEqual([...dynMap.index], [], 'no index');
         });

         it(`iterator no index set`, () =>
         {
            const dynMap = new DynMapReducer(new Map([[1, 1], [2, 2]]));

            assert.deepEqual([...dynMap.index], [], 'no index');
         });

         it(`iterator index set`, () =>
         {
            const dynMap = new DynMapReducer(new Map([[1, 1], [2, 2]]));

            assert.deepEqual([...dynMap.index], [], 'no index');

            dynMap.sort.set((a, b) => b - a);

            assert.deepEqual([...dynMap.index], [2, 1], 'sorted index');

            dynMap.sort.reset();

            assert.deepEqual([...dynMap.index], [], 'no index');
         });

         it(`iterator index reversed`, () =>
         {
            const dynMap = new DynMapReducer(new Map([[1, 1], [2, 2]]));

            assert.deepEqual([...dynMap.index], [], 'no index');

            dynMap.sort.set((a, b) => b - a);

            assert.deepEqual([...dynMap.index], [2, 1], 'sorted index');

            dynMap.reversed = true;

            assert.deepEqual([...dynMap.index], [1, 2], 'reverse sorted index');

            dynMap.sort.reset();

            assert.deepEqual([...dynMap.index], [], 'no index');
         });

         it(`sort set / hash is number / reset & hash is null (number keys)`, () =>
         {
            const dynMap = new DynMapReducer(new Map([[1, 1], [2, 2]]));

            assert.isNull(dynMap.index.hash);

            dynMap.sort.set((a, b) => b - a);

            assert.isNumber(dynMap.index.hash);

            dynMap.sort.reset();

            assert.isNull(dynMap.index.hash);
         });

         it(`sort set / hash is number / reset & hash is null (string keys)`, () =>
         {
            const dynMap = new DynMapReducer(new Map([['1', 1], ['2', 2]]));

            assert.isNull(dynMap.index.hash);

            dynMap.sort.set((a, b) => b - a);

            assert.isNumber(dynMap.index.hash);

            dynMap.sort.reset();

            assert.isNull(dynMap.index.hash);
         });

         it(`isActive is false / sort set & isActive is true / reset & isActive is false`, () =>
         {
            const dynMap = new DynMapReducer();

            assert.isFalse(dynMap.index.isActive);

            dynMap.sort.set((a, b) => b - a);

            assert.isTrue(dynMap.index.isActive);

            dynMap.sort.reset();

            assert.isFalse(dynMap.index.isActive);
         });

         it(`length when index defined and reset`, () =>
         {
            const dynMap = new DynMapReducer(new Map([['1', 1], ['2', 2]]));

            assert.equal(dynMap.index.length, 0);

            dynMap.sort.set((a, b) => b - a);

            assert.equal(dynMap.index.length, 2);

            dynMap.sort.reset();

            assert.equal(dynMap.index.length, 0);
         });
      });
   });
}
