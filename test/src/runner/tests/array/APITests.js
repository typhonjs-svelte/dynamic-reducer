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

   /** @type {import('../../../../../types/index.js').DynArrayReducer} */
   const DynArrayReducer = Module.DynArrayReducer;

   /** @type {import('../../../../../types/index.js').DerivedArrayReducer} */
   const DerivedArrayReducer = Module.DerivedArrayReducer;

   /**
    * Provides a way to create DynArrayReducer with the types applied in the instance returned.
    *
    * @template T
    *
    * @param {T[] | object}  [data] - Initial data.
    *
    * @returns {import('../../../../../types/index.js').DynArrayReducer<T>} New DynArrayReducer instance.
    */
   function createReducer(data)
   {
      return new DynArrayReducer(data);
   }

   describe(`(Array) API Test`, () =>
   {
      describe(`Main API`, () =>
      {
         it(`iterator no values`, () =>
         {
            const dar = createReducer();
            assert.deepEqual([...dar], []);
         });

         it(`iterator no values (no backing array)`, () =>
         {
            const dar = createReducer();
            assert.deepEqual([...dar], []);
         });

         it(`iterator no values (no backing array w/ filter)`, () =>
         {
            const dar = createReducer();
            dar.filters.add(() => true);
            assert.deepEqual([...dar], []);
            assert.deepEqual([...dar.index], []);
         });

         it(`data (getter)`, () =>
         {
            const array = [1, 2];
            const dar = createReducer(array);
            assert.equal(dar.data, array, 'data (getter) returns same array');
         });

         it(`destroy`, () =>
         {
            const dar = createReducer([1, 2]);
            const dr = dar.derived.create('test');

            assert.deepEqual([...dr], [1, 2], 'correct initial data');

            assert.isFalse(dar.destroyed);
            assert.isFalse(dr.destroyed);

            dar.destroy();

            assert.isTrue(dar.destroyed);
            assert.isTrue(dr.destroyed);

            assert.deepEqual([...dar], [], 'no data');
            assert.deepEqual([...dr], [], 'no data');

            // Invoke destroy again for early out coverage.
            dar.destroy();
         });

         it(`length (getter)`, () =>
         {
            const dar = createReducer([1, 2]);
            assert.equal(dar.length, 2, 'length (getter) returns 2');
            assert.equal(dar.index.length, 0, 'index length (getter) returns 0');

            dar.filters.add((entry) => entry > 1);

            assert.equal(dar.length, 1, 'length (getter) returns 1');
            assert.equal(dar.index.length, 1, 'index length (getter) returns 1');
         });

         it(`length (getter no array)`, () =>
         {
            const dar = createReducer();
            assert.equal(dar.length, 0, 'length (getter) returns 0');
         });

         it(`reversed data (no index)`, () =>
         {
            const dar = createReducer([1, 2]);

            assert.deepEqual([...dar], [1, 2]);

            dar.reversed = true;

            assert.deepEqual([...dar], [2, 1]);

            dar.reversed = false;

            assert.deepEqual([...dar], [1, 2]);
         });

         it(`setData (update external)`, () =>
         {
            const array = [1, 2];
            const dar = createReducer(array);
            dar.setData([3, 4]);
            assert.isTrue(dar.data === array, 'internal array is the same as initially set');
            assert.deepEqual(array, [3, 4], 'setData updates external array');
         });

         it(`setData (replace external)`, () =>
         {
            const array = [1, 2];
            const array2 = [3, 4, 5];
            const dar = createReducer(array);
            dar.setData(array2, true);
            assert.isTrue(dar.data === array2, 'setData replaces internal array');
         });

         it(`setData (replace external w/ iterable)`, () =>
         {
            const array = [1, 2];
            const set = new Set([3, 4]);
            const dar = createReducer(array);
            dar.setData(set, true);
            assert.isFalse(dar.data === array, 'setData replaces internal array');
            assert.deepEqual(dar.data, [3, 4], 'setData replaces internal array');
         });

         it(`setData (replace external & index updates)`, () =>
         {
            const array = [1, 2];
            const array2 = [3, 4, 5];
            const dar = createReducer(array);
            dar.filters.add(() => true);

            assert.equal(dar.length, 2, 'main length matches index length is 2');
            assert.equal(dar.index.length, 2, 'initial index length is 2');

            dar.setData(array2, true);

            assert.isTrue(dar.data === array2, 'setData replaces internal array');

            assert.equal(dar.length, 3, 'main length matches index length is 2');
            assert.equal(dar.index.length, 3, 'initial index length is 3');
         });

         it(`setData (null initial backing; set external; setData null w/ no external modification)`, () =>
         {
            const array = [1, 2];
            const dar = createReducer();
            assert.isNull(dar.data);
            dar.setData(array);
            assert.isTrue(dar.data === array, 'internal array is the same as initially set');
            dar.setData(null);
            assert.isNull(dar.data);
            assert.deepEqual(array, [1, 2], 'setData null does not update external array');
         });

         it(`set from DynData`, () =>
         {
            const dar = createReducer({
               data: [1, 3, 2],
               filters: [(val) => val > 1],
               sort: (a, b) => b - a
            });

            assert.deepEqual([...dar], [3, 2]);
         });

         it(`set from DynData w/ DataFilter & DataSort`, () =>
         {
            const dar = createReducer({
               data: [1, 3, 2],
               filters: [{ filter: (val) => val > 1 }],
               sort: { compare: (a, b) => b - a }
            });

            assert.deepEqual([...dar], [3, 2]);
         });

         it(`set from DynData / iterable`, () =>
         {
            const dar = createReducer({
               data: new Set([1, 2, 3]),
               filters: [(val) => val > 1],
               sort: (a, b) => b - a
            });

            assert.deepEqual([...dar], [3, 2]);
         });

         it(`subscribe / notify / unsubscribe`, () =>
         {
            const data = [1, 2];

            const dar = new createReducer({
               data,
               filters: [(val) => val > 1],
               sort: (a, b) => b - a
            });

            let callbackSub = 0;

            assert.equal(callbackSub, 0);

            const unsubscribe = dar.subscribe(() => callbackSub++);

            assert.equal(callbackSub, 1);

            data.push(3);
            dar.index.update();

            assert.equal(callbackSub, 2);

            unsubscribe();
         });
      });

      describe(`AdapterFilter (filters)`, () =>
      {
         it(`add - no arguments / noop`, () =>
         {
            const dar = createReducer();

            dar.filters.add();

            assert.equal(dar.filters.length, 0);
         });

         it(`length (getter)`, () =>
         {
            const dar = createReducer({ data: [1, 2], filters: [() => null, () => null] });
            assert.equal(dar.filters.length, 2, 'length (getter) returns 2');
         });

         it(`iterator (no filters)`, () =>
         {
            const dar = createReducer([1, 2]);

            assert.deepEqual([...dar.filters], [], 'iterator returns no values');
         });

         it(`iterator (2 values)`, () =>
         {
            const dar = createReducer({
               data: [1, 2],
               filters: [{ id: 'a', filter: () => null }, { id: 'b', filter: () => null }]
            });

            assert.deepEqual([...dar.filters].map((f) => f.id), ['a', 'b'], 'iterator returns values');
         });

         it(`iterator - add with no id (default void 0 assigned)`, () =>
         {
            const dar = createReducer({
               data: [1, 2],
               filters: [{ filter: () => null }, { filter: () => null }]
            });

            assert.deepEqual([...dar.filters].map((f) => f.id), [void 0, void 0], 'iterator returns values');
         });

         it(`add - multiple w/ weight`, () =>
         {
            const dar = createReducer({
               data: [],
               filters: [
                  { id: 'c', filter: () => null },
                  { id: 'a', filter: () => null, weight: 0.1 },
                  { id: 'b', filter: () => null, weight: 0.5 }
               ]
            });

            assert.deepEqual([...dar.filters].map((f) => ({ id: f.id, weight: f.weight })),
             [{ id: 'a', weight: 0.1 }, { id: 'b', weight: 0.5 }, { id: 'c', weight: 1 }], 'add multiple w/ weight');
         });

         it(`add - filter exclude / add value to array / regenerate index`, () =>
         {
            const array = [1, 2];

            const dar = createReducer({
               data: array,
               filters: [(value) => value > 1]
            });

            assert.deepEqual([...dar], [2], 'filter excludes 1 from index');

            // This forces the index to be regenerated.
            array.push(3);
            dar.index.update();

            assert.deepEqual([...dar], [2, 3], 'filter excludes 1 from index');
         });

         it(`clear w/ unsubscribe`, () =>
         {
            const dar = createReducer();

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
            const dar = createReducer();

            assert.equal(dar.filters.length, 0);
            dar.filters.remove(() => null);
            assert.equal(dar.filters.length, 0);
         });

         it(`remove - exact filter added`, () =>
         {
            const dar = createReducer();

            const filter = () => null;

            dar.filters.add(filter);
            assert.equal(dar.filters.length, 1);
            dar.filters.remove(filter);
            assert.equal(dar.filters.length, 0);
         });

         it(`remove filter w/ unsubscribe`, () =>
         {
            const dar = createReducer();

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
            const dar = createReducer();

            const filterData = { filter: () => null };

            dar.filters.add(filterData);

            assert.equal(dar.filters.length, 1);

            dar.filters.remove(filterData);

            assert.equal(dar.filters.length, 0);
         });

         it(`remove w/ incorrect filterData (no removal)`, () =>
         {
            const dar = createReducer();

            dar.filters.add(() => null);

            assert.equal(dar.filters.length, 1);

            dar.filters.remove(void 0, 'bogus');

            assert.equal(dar.filters.length, 1);
         });

         it(`removeBy - no filters added`, () =>
         {
            const dar = createReducer();

            assert.equal(dar.filters.length, 0);
            dar.filters.removeBy(() => null);
            assert.equal(dar.filters.length, 0);
         });

         it(`removeBy - filter w/ unsubscribe`, () =>
         {
            const dar = createReducer();

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
            const dar = createReducer();

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
            const dar = createReducer();

            assert.equal(dar.filters.length, 0);
            dar.filters.removeById(void 0);
            assert.equal(dar.filters.length, 0);
         });

         it(`removeById - filter w/ subscribe / unsubscribe`, () =>
         {
            const dar = createReducer();

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
            const dar = createReducer();

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
            const dar = createReducer([1, 2]);

            dar.sort.set((a, b) => b - a);

            assert.deepEqual([...dar], [2, 1], 'reverse sorts numbers');
         });

         it(`set sort w/ subscribe`, () =>
         {
            const dar = createReducer([1, 2]);

            let unsubscribeCalled = false;

            const sort = (a, b) => b - a;
            sort.subscribe = (handler) =>
            {
               handler(); // Proper subscribe API to kick off an update must invoke the handler on subscribe.
               return () => unsubscribeCalled = true;
            };

            dar.sort.set(sort);

            assert.deepEqual([...dar], [2, 1], 'reverse sorts numbers');

            dar.sort.clear();

            assert.deepEqual([...dar], [1, 2], 'initial order');
            assert.isTrue(unsubscribeCalled);
         });

         it(`set sort w/ subscribe - no handler callback`, () =>
         {
            const dar = createReducer([1, 2]);

            let unsubscribeCalled = false;

            const sort = (a, b) => b - a;
            sort.subscribe = () => () => unsubscribeCalled = true;

            dar.sort.set(sort);

            // Manual update as the subscribe function of `sort` does not follow the subscribe protocol.
            dar.index.update();

            assert.deepEqual([...dar], [2, 1], 'reverse sorts numbers');

            dar.sort.clear();

            assert.deepEqual([...dar], [1, 2], 'initial order');
            assert.isTrue(unsubscribeCalled);
         });

         it(`set compare function w/ subscribe / unsubscribe`, () =>
         {
            const dar = createReducer([1, 2]);

            let unsubscribeCalled = false;

            const compare = (a, b) => b - a;
            compare.subscribe = (handler) => { handler(); return () => unsubscribeCalled = true; };

            dar.sort.set(compare);

            assert.deepEqual([...dar], [2, 1], 'reverse order');

            dar.sort.set(null);

            assert.deepEqual([...dar], [1, 2], 'initial order');
            assert.isTrue(unsubscribeCalled);
         });

         it(`set SortData w/ subscribe / unsubscribe`, () =>
         {
            const dar = createReducer([1, 2]);

            let unsubscribeCalled = false;

            dar.sort.set({
               compare: (a, b) => b - a,
               subscribe: (handler) => { handler(); return () => unsubscribeCalled = true; }
            });

            assert.deepEqual([...dar], [2, 1], 'reverse order');

            dar.sort.set(null);

            assert.deepEqual([...dar], [1, 2], 'initial order');
            assert.isTrue(unsubscribeCalled);
         });
      });

      describe(`DerivedAPI`, () =>
      {
         it(`null array data (getter)`, () =>
         {
            const dar = createReducer();
            const dr = dar.derived.create('test');

            assert.equal(dr.data, null, 'data (getter) returns null');
         });

         it(`null array length (getter)`, () =>
         {
            const dar = createReducer();
            const dr = dar.derived.create('test');

            assert.equal(dar.length, [...dar].length, 'initial length is correct');
            assert.equal(dr.length, [...dr].length, 'initial length is correct');
         });

         it(`data (getter)`, () =>
         {
            const array = [1, 2];
            const dar = createReducer(array);
            const dr = dar.derived.create('test');

            assert.equal(dr.data, array, 'data (getter) returns same array');
         });

         it(`derived (getter)`, () =>
         {
            const dar = createReducer();
            const dr = dar.derived.create('test');

            assert.isFunction(dr.derived.create);
            assert.isFunction(dr.derived.delete);
            assert.isFunction(dr.derived.destroy);
            assert.isFunction(dr.derived.get);
         });

         it(`derived (clear)`, () =>
         {
            const dar = createReducer([1, 2]);
            const dr = dar.derived.create('test');

            assert.deepEqual([...dr], [1, 2], 'correct initial data');

            assert.isFalse(dr.destroyed);

            dar.derived.clear();

            assert.isTrue(dr.destroyed);

            assert.deepEqual([...dr], [], 'no data');

            // Can create a new derived instance after clearing.
            const dr2 = dar.derived.create('test');
            assert.deepEqual([...dr2], [1, 2], 'correct initial data');
         });

         it(`Extended prototype is valid (create / get / delete)`, () =>
         {
            class ExtendedArrayReducer extends DerivedArrayReducer {}

            const dar = createReducer();
            const dr = dar.derived.create(ExtendedArrayReducer);
            const dr2 = dar.derived.get('ExtendedArrayReducer');
            const result = dar.derived.delete('ExtendedArrayReducer');

            assert.isTrue(result);
            assert.instanceOf(dr, ExtendedArrayReducer, 'is extended reducer');
            assert.instanceOf(dr2, ExtendedArrayReducer, 'is extended reducer');
         });

         it(`added filter and sort in create method`, () =>
         {
            const dar = createReducer([1, 2, 3]);
            const dr = dar.derived.create({
               name: 'test',
               filters: [(entry) => entry >= 2],
               sort: (a, b) => b - a
            });

            assert.deepEqual([...dar], [1, 2, 3], 'correct initial data');
            assert.deepEqual([...dr], [3, 2], 'correct derived filter sorted data');

            dr.sort.clear();
            dr.filters.clear();

            assert.deepEqual([...dr], [1, 2, 3], 'correct original data');
         });

         it(`added filter and sort in create method with data`, () =>
         {
            const dar = createReducer([1, 2, 3]);
            const dr = dar.derived.create({
               name: 'test',
               filters: [{ id: 'test', filter: (entry) => entry >= 2, weight: 0.5 }],
               sort: { compare: (a, b) => b - a }
            });

            assert.deepEqual([...dar], [1, 2, 3], 'correct initial data');
            assert.deepEqual([...dr], [3, 2], 'correct derived filter sorted data');

            dr.sort.clear();
            dr.filters.clear();

            assert.deepEqual([...dr], [1, 2, 3], 'correct original data');
         });

         it(`added filter with parent index updates correctly + reversed`, () =>
         {
            const dar = createReducer([1, 2, 3]);
            const dr = dar.derived.create('test');

            dr.filters.add((entry) => entry >= 2);

            assert.deepEqual([...dar], [1, 2, 3], 'correct initial data');
            assert.deepEqual([...dr], [2, 3], 'correct derived filter data');

            dar.sort.set((a, b) => b - a);

            assert.deepEqual([...dar], [3, 2, 1], 'correct initial data');
            assert.deepEqual([...dr], [3, 2], 'correct derived filter data');

            dr.reversed = true;

            assert.deepEqual([...dr], [2, 3], 'correct reversed derived filter data');

            dr.reversed = false;

            assert.deepEqual([...dr], [3, 2], 'correct reversed derived filter data');

            dr.sort.set((a, b) => a - b);

            assert.deepEqual([...dr], [2, 3], 'correct sorted derived filter data');

            dar.sort.clear();
            dr.sort.clear();
            dr.filters.clear();
            dr.reversed = true;

            assert.deepEqual([...dr], [3, 2, 1], 'correct reversed derived original data');
         });

         it(`added filter with no parent index updates correctly`, () =>
         {
            const dar = createReducer([1, 2]);
            const dr = dar.derived.create('test');

            assert.deepEqual([...dr], [1, 2], 'correct derived initial data');

            dr.filters.add((entry) => entry === 1);

            assert.deepEqual([...dar], [1, 2], 'correct initial data');
            assert.deepEqual([...dr], [1], 'correct derived filter data');

            dar.setData([2, 3]);

            assert.deepEqual([...dr], [], 'correct derived filter data');
         });

         it(`length with and without index`, () =>
         {
            const dar = createReducer([1, 2]);
            const dr = dar.derived.create('test');

            assert.equal(dr.length, [...dr].length, 'initial length is correct / no index');

            dr.filters.add((entry) => entry >= 2);

            assert.equal(dr.length, [...dr].length, 'filtered length is correct w/ index');

            dar.sort.set((a, b) => b - a);

            assert.equal(dr.length, [...dr].length, 'filtered length is correct w/ parent index');

            dr.filters.clear();

            assert.equal(dr.length, [...dr].length, 'initial length is correct w/ parent index');

            dar.filters.clear();

            assert.equal(dr.length, [...dr].length, 'initial length is correct without parent index');
         });

         it(`subscribe / notify / unsubscribe`, () =>
         {
            const data = [1, 2];

            const dar = createReducer(data);
            const dr = dar.derived.create('test');
            dr.filters.add((entry) => entry > 1);

            let callbackSub = 0;

            assert.equal(callbackSub, 0);

            const unsubscribe = dr.subscribe((drInstance) =>
            {
               callbackSub++;
               assert.equal(drInstance.length, [...dr].length);
            });

            assert.equal(callbackSub, 1);

            data.push(3);
            dar.index.update();    // No forced update as there is a derived index filter.

            assert.equal(callbackSub, 2);

            unsubscribe();
         });

         it(`subscribe / notify / unsubscribe (forced)`, () =>
         {
            const data = [1, 2];

            const dar = createReducer(data);
            const dr = dar.derived.create('test');

            let callbackSub = 0;

            assert.equal(callbackSub, 0);

            const unsubscribe = dr.subscribe((drInstance) =>
            {
               callbackSub++;
               assert.equal(drInstance.length, [...dr].length);
            });

            assert.equal(callbackSub, 1);

            data.push(3);
            dar.index.update(true);    // Requires a forced update as there is no derived index filtering.

            assert.equal(callbackSub, 2);

            unsubscribe();
         });
      });

      describe(`Indexer`, () =>
      {
         it(`iterator no index set`, () =>
         {
            const dar = createReducer([1, 2]);

            assert.deepEqual([...dar.index], [], 'no index');
         });

         it(`iterator index set + length`, () =>
         {
            const dar = createReducer([1, 2]);

            assert.deepEqual([...dar.index], [], 'no index');

            assert.equal(dar.index.length, 0, 'length is correct');

            dar.sort.set((a, b) => b - a);

            assert.deepEqual([...dar.index], [1, 0], 'sorted index');

            assert.equal(dar.index.length, 2, 'length is correct');

            dar.sort.clear();

            assert.equal(dar.index.length, 0, 'length is correct');

            assert.deepEqual([...dar.index], [], 'no index');
         });

         it(`iterator index reversed`, () =>
         {
            const dar = createReducer([1, 2]);

            assert.deepEqual([...dar.index], [], 'no index');

            dar.sort.set((a, b) => b - a);

            assert.deepEqual([...dar.index], [1, 0], 'sorted index');

            dar.reversed = true;

            assert.deepEqual([...dar.index], [0, 1], 'reverse sorted index');

            dar.sort.clear();

            assert.deepEqual([...dar.index], [], 'no index');
         });

         it(`sort set / hash is number / reset & hash is null`, () =>
         {
            const dar = createReducer([1, 2]);

            assert.isNull(dar.index.hash);

            dar.sort.set((a, b) => b - a);

            assert.isNumber(dar.index.hash);

            dar.sort.clear();

            assert.isNull(dar.index.hash);
         });

         it(`active is false / sort set & active is true / reset & active is false`, () =>
         {
            const dar = createReducer([1, 2]);

            assert.isFalse(dar.index.active);

            dar.sort.set((a, b) => b - a);

            assert.isTrue(dar.index.active);

            dar.sort.clear();

            assert.isFalse(dar.index.active);
         });

         it(`length when index defined and reset`, () =>
         {
            const dar = createReducer([1, 2]);

            assert.equal(dar.index.length, 0);

            dar.sort.set((a, b) => b - a);

            assert.equal(dar.index.length, 2);

            dar.sort.clear();

            assert.equal(dar.index.length, 0);
         });
      });
   });
}
