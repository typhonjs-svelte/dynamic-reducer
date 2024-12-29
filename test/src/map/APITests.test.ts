import { assert }          from 'vitest';

import {
   DynMapReducer,
   DynMapReducerDerived }  from '#package';

import type { DynReducer } from '#package';

/**
 * Provides a way to create DynArrayReducer with the types applied in the instance returned.
 *
 * @param [data] - Initial data.
 *
 * @returns New DynMapReducer instance.
 */
function createReducer<K, T>(data?: Map<K, T> | DynReducer.Options.MapReducer<K, T>): DynMapReducer<K, T>
{
   return new DynMapReducer<K, T>(data);
}

describe(`(Map) API Test`, () =>
{
   describe(`Main API`, () =>
   {
      it(`iterator no values`, () =>
      {
         const dar = createReducer(new Map());
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
         const map = new Map([[1, 1], [2, 2]]);
         const dar = createReducer(map);
         assert.equal(dar.data, map, 'data (getter) returns same map');
      });

      it(`destroy`, () =>
      {
         const dar = createReducer(new Map([[1, 1], [2, 2]]));
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
         const dar = createReducer(new Map([[1, 1], [2, 2]]));
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
         const dar = createReducer(new Map([[1, 1], [2, 2]]));

         assert.deepEqual([...dar], [1, 2]);

         dar.reversed = true;

         assert.deepEqual([...dar], [2, 1]);

         dar.reversed = false;

         assert.deepEqual([...dar], [1, 2]);
      });

      it(`setData (update external)`, () =>
      {
         const map = new Map([[1, 1], [2, 2]]);
         const dar = createReducer(map);
         dar.setData(new Map([[3, 3], [4, 4]]));
         assert.isTrue(dar.data === map, 'internal map is the same as initially set');
         assert.deepEqual([...map.values()], [3, 4], 'setData updates external map');
      });

      it(`setData (replace external)`, () =>
      {
         const map = new Map([[1, 1], [2, 2]]);
         const map2 = new Map([[3, 3], [4, 4], [5, 5]]);
         const dar = createReducer(map);
         dar.setData(map2, true);
         assert.isTrue(dar.data === map2, 'setData replaces internal map');
      });

      it(`setData (replace external w/ null)`, () =>
      {
         const map = new Map([[1, 1], [2, 2]]);
         const dar = createReducer(map);
         dar.setData(null, true);
         assert.isTrue(dar.data === null, 'setData replaces internal map w/ null');
      });

      it(`setData (replace external & index updates)`, () =>
      {
         const map = new Map([[1, 1], [2, 2]]);
         const map2 = new Map([[3, 3], [4, 4], [5, 5]]);
         const dar = createReducer(map);
         dar.filters.add(() => true);

         assert.equal(dar.length, 2, 'main length matches index length is 2');
         assert.equal(dar.index.length, 2, 'initial index length is 2');

         dar.setData(map2, true);

         assert.isTrue(dar.data === map2, 'setData replaces internal map');

         assert.equal(dar.length, 3, 'main length matches index length is 2');
         assert.equal(dar.index.length, 3, 'initial index length is 3');
      });

      it(`setData (null initial backing; set external; setData null w/ no external modification)`, () =>
      {
         const map = new Map([[1, 1], [2, 2]]);
         const dar = createReducer();
         assert.isNull(dar.data);
         dar.setData(map);
         assert.isTrue(dar.data === map, 'internal map is the same as initially set');
         dar.setData(null);
         assert.isNull(dar.data);
         assert.deepEqual([...map.values()], [1, 2], 'setData null does not update external map');
      });

      it(`set from DynData`, () =>
      {
         const dar = createReducer({
            data: new Map([[1, 1], [3, 3], [2, 2]]),
            filters: [(val) => val > 1],
            sort: (a, b) => b - a
         });

         assert.deepEqual([...dar], [3, 2]);
      });

      it(`set from DynData w/ DataFilter & DataSort`, () =>
      {
         const dar = createReducer({
            data: new Map([[1, 1], [3, 3], [2, 2]]),
            filters: [{ filter: (val) => val > 1 }],
            sort: { compare: (a, b) => b - a }
         });

         assert.deepEqual([...dar], [3, 2]);
      });

      it(`subscribe / notify / unsubscribe`, () =>
      {
         const data = new Map([[1, 1], [2, 2]]);

         const dar = createReducer({
            data,
            filters: [(val) => val > 1],
            sort: (a, b) => b - a
         });

         let callbackSub = 0;

         assert.equal(callbackSub, 0);

         const unsubscribe = dar.subscribe(() => callbackSub++);

         assert.equal(callbackSub, 1);

         data.set(3, 3);
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
         const dar = createReducer({
            data: new Map([[1, 1], [2, 2]]),
            filters: [() => false, () => false]
         });
         assert.equal(dar.filters.length, 2, 'length (getter) returns 2');
      });

      it(`iterator (no filters)`, () =>
      {
         const dar = createReducer(new Map([[1, 1], [2, 2]]));

         assert.deepEqual([...dar.filters], [], 'iterator returns no values');
      });

      it(`iterator (2 values)`, () =>
      {
         const dar = createReducer({
            data: new Map([[1, 1], [2, 2]]),
            filters: [{ id: 'a', filter: () => false }, { id: 'b', filter: () => false }]
         });

         assert.deepEqual([...dar.filters].map(
          (f) => f.id), ['a', 'b'], 'iterator returns values');
      });

      it(`iterator - add with no id (default void 0 assigned)`, () =>
      {
         const dar = createReducer({
            data: new Map([[1, 1], [2, 2]]),
            filters: [{ filter: () => false }, { filter: () => false }]
         });

         assert.deepEqual([...dar.filters].map(
          (f) => f.id), [void 0, void 0], 'iterator returns values');
      });

      it(`add - multiple w/ weight`, () =>
      {
         const dar = createReducer({
            data: new Map(),
            filters: [
               {id: 'c', filter: () => false},
               {id: 'a', filter: () => false, weight: 0.1},
               {id: 'b', filter: () => false, weight: 0.5}
            ]
         });

         assert.deepEqual([...dar.filters].map((f) => ({id: f.id, weight: f.weight})),
            [{id: 'a', weight: 0.1}, {id: 'b', weight: 0.5}, {id: 'c', weight: 1}], 'add multiple w/ weight');
      });

      it(`add - filter exclude / add value to array / regenerate index`, () =>
      {
         const map = new Map([[1, 1], [2, 2]]);

         const dar = createReducer({
            data: map,
            filters: [(value) => value > 1]
         });

         assert.deepEqual([...dar], [2], 'filter excludes 1 from index');

         // This forces the index to be regenerated.
         map.set(3, 3);
         dar.index.update();

         assert.deepEqual([...dar], [2, 3], 'filter excludes 1 from index');
      });

      it(`clear w/ unsubscribe`, () =>
      {
         const dar = createReducer();

         let unsubscribeCalled = false;

         const filter = () => false;
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
         dar.filters.remove(() => false);
         assert.equal(dar.filters.length, 0);
      });

      it(`remove - exact filter added`, () =>
      {
         const dar = createReducer();

         const filter = () => false;

         dar.filters.add(filter);
         assert.equal(dar.filters.length, 1);
         dar.filters.remove(filter);
         assert.equal(dar.filters.length, 0);
      });

      it(`remove filter w/ unsubscribe`, () =>
      {
         const dar = createReducer();

         let unsubscribeCalled = false;

         const filter = () => false;
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

         const filterData = { filter: () => false };

         dar.filters.add(filterData);

         assert.equal(dar.filters.length, 1);

         dar.filters.remove(filterData);

         assert.equal(dar.filters.length, 0);
      });

      it(`remove w/ incorrect filterData (no removal)`, () =>
      {
         const dar = createReducer();

         dar.filters.add(() => false);

         assert.equal(dar.filters.length, 1);

         // @ts-expect-error
         dar.filters.remove(void 0, 'bogus');

         assert.equal(dar.filters.length, 1);
      });

      it(`removeBy - no filters added`, () =>
      {
         const dar = createReducer();

         assert.equal(dar.filters.length, 0);
         dar.filters.removeBy(() => false);
         assert.equal(dar.filters.length, 0);
      });

      it(`removeBy - filter w/ unsubscribe`, () =>
      {
         const dar = createReducer();

         let unsubscribeCalled = false;

         const filter = () => false;
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

         dar.filters.add(() => false);

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

         const filter = () => false;
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

         const filter = () => false;

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
         const dar = createReducer(new Map([[1, 1], [2, 2]]));

         dar.sort.set((a, b) => b - a);

         assert.deepEqual([...dar], [2, 1], 'reverse sorts numbers');
      });

      it(`set sort w/ subscribe`, () =>
      {
         const dar = createReducer(new Map([[1, 1], [2, 2]]));

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
         const dar = createReducer(new Map([[1, 1], [2, 2]]));

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
         const dar = createReducer(new Map([[1, 1], [2, 2]]));

         let unsubscribeCalled = false;

         const compare = (a, b) => b - a;
         compare.subscribe = (handler) =>
         {
            handler();
            return () => unsubscribeCalled = true;
         };

         dar.sort.set(compare);

         assert.deepEqual([...dar], [2, 1], 'reverse order');

         dar.sort.set(null);

         assert.deepEqual([...dar], [1, 2], 'initial order');
         assert.isTrue(unsubscribeCalled);
      });

      it(`set SortData w/ subscribe / unsubscribe`, () =>
      {
         const dar = createReducer(new Map([[1, 1], [2, 2]]));

         let unsubscribeCalled = false;

         dar.sort.set({
            compare: (a, b) => b - a,
            subscribe: (handler) =>
            {
               handler();
               return () => unsubscribeCalled = true;
            }
         });

         assert.deepEqual([...dar], [2, 1], 'reverse order');

         dar.sort.set(null);

         assert.deepEqual([...dar], [1, 2], 'initial order');
         assert.isTrue(unsubscribeCalled);
      });
   });

   describe(`DerivedAPI`, () =>
   {
      it(`null array length (getter)`, () =>
      {
         const dar = createReducer();
         const dr = dar.derived.create('test');

         assert.equal(dar.length, [...dar].length, 'initial length is correct');
         assert.equal(dr.length, [...dr].length, 'initial length is correct');
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
         const dar = createReducer(new Map([[1, 1], [2, 2]]));
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
         class ExtendedMapReducer extends DynMapReducerDerived<string, number> {}

         const dar = createReducer();
         const dr = dar.derived.create(ExtendedMapReducer);
         const dr2 = dar.derived.get('ExtendedMapReducer');
         const result = dar.derived.delete('ExtendedMapReducer');

         assert.isTrue(result);
         assert.instanceOf(dr, ExtendedMapReducer, 'is extended reducer');
         assert.instanceOf(dr2, ExtendedMapReducer, 'is extended reducer');
      });

      it(`added filter and sort in create method`, () =>
      {
         const dar = createReducer(new Map([[1, 1], [2, 2], [3, 3]]));
         const dr = dar.derived.create({
            name: 'test',
            filters: [(entry) => entry >= 2],
            sort: (a, b) => b - a
         });

         const dr2 = dar.derived.get('test');

         assert.equal(dr, dr2);

         assert.deepEqual([...dar], [1, 2, 3], 'correct initial data');
         assert.deepEqual([...dr], [3, 2], 'correct derived filter sorted data');

         dr.sort.clear();
         dr.filters.clear();

         assert.deepEqual([...dr], [1, 2, 3], 'correct original data');
      });

      it(`added filter and sort in create method with data`, () =>
      {
         const dar = createReducer(new Map([[1, 1], [2, 2], [3, 3]]));
         const dr = dar.derived.create({
            name: 'test',
            filters: [{id: 'test', filter: (entry) => entry >= 2, weight: 0.5}],
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
         const dar = createReducer(new Map([[1, 1], [2, 2], [3, 3]]));
         const dr = dar.derived.create('test');

         dr.filters.add((entry) => entry >= 2);

         assert.deepEqual([...dar], [1, 2, 3], 'correct initial data');
         assert.deepEqual([...dr], [2, 3], 'correct derived filter data');

         dar.sort.set((a, b) => b - a);

         assert.deepEqual([...dar], [3, 2, 1], 'correct initial data');
         assert.deepEqual([...dr], [3, 2], 'correct derived filter data');

         assert.isFalse(dr.reversed);

         dr.reversed = true;

         assert.deepEqual([...dr], [2, 3], 'correct reversed derived filter data');

         assert.isTrue(dr.reversed);

         dr.reversed = false;

         assert.deepEqual([...dr], [3, 2], 'correct reversed derived filter data');

         assert.isFalse(dr.reversed);

         dr.sort.set((a, b) => a - b);

         assert.deepEqual([...dr], [2, 3], 'correct sorted derived filter data');

         dar.sort.clear();
         dr.sort.clear();
         dr.filters.clear();
         dr.reversed = true;

         assert.deepEqual([...dr], [3, 2, 1], 'correct reversed derived original data');
      });

      it(`added filter with no parent index updates correctly (number data)`, () =>
      {
         const dar = createReducer(new Map([[1, 1], [2, 2]]));
         const dr = dar.derived.create('test');

         assert.deepEqual([...dr], [1, 2], 'correct derived initial data');

         dr.filters.add((entry) => entry === 1);

         assert.deepEqual([...dar], [1, 2], 'correct initial data');
         assert.deepEqual([...dr], [1], 'correct derived filter data');

         dar.setData(new Map([[2, 2], [3, 3]]));

         assert.deepEqual([...dr], [], 'correct derived filter data');
      });

      it(`added filter with no parent index updates correctly (object data)`, () =>
      {
         const obj1 = { type: 'A' };
         const obj2 = { type: 'B' };
         const obj3 = { type: 'C' };

         const dar = createReducer(new Map([[1, obj1], [2, obj2]]));
         const dr = dar.derived.create('test');

         assert.deepEqual([...dr], [obj1, obj2], 'correct derived initial data');

         dr.filters.add((entry) => entry.type === 'A');

         assert.deepEqual([...dar], [obj1, obj2], 'correct initial data');
         assert.deepEqual([...dr], [obj1], 'correct derived filter data');

         dar.setData(new Map([[2, obj2], [3, obj3]]));

         assert.deepEqual([...dr], [], 'correct derived filter data');
      });

      it(`length with and without index`, () =>
      {
         const dar = createReducer(new Map([[1, 1], [2, 2]]));
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
         const data = new Map([[1, 1], [2, 2]]);

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

         data.set(3, 3);
         dar.index.update();    // No forced update as there is a derived index filter.

         assert.equal(callbackSub, 2);

         unsubscribe();
      });

      it(`subscribe / notify / unsubscribe (forced)`, () =>
      {
         const data = new Map([[1, 1], [2, 2]]);

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

         data.set(3, 3);
         dar.index.update(true);    // Requires a forced update as there is no derived index filtering.

         assert.equal(callbackSub, 2);

         unsubscribe();
      });
   });

   describe(`Indexer`, () =>
   {
      it(`iterator no index set`, () =>
      {
         const dar = createReducer(new Map([[1, 1], [2, 2]]));

         assert.deepEqual([...dar.index], [], 'no index');
      });

      it(`iterator index set + length`, () =>
      {
         const dar = createReducer(new Map([[1, 1], [2, 2]]));

         assert.deepEqual([...dar.index], [], 'no index');

         assert.equal(dar.index.length, 0, 'length is correct');

         dar.sort.set((a, b) => b - a);

         assert.deepEqual([...dar.index], [2, 1], 'sorted index');

         assert.equal(dar.index.length, 2, 'length is correct');

         dar.sort.clear();

         assert.equal(dar.index.length, 0, 'length is correct');

         assert.deepEqual([...dar.index], [], 'no index');
      });

      it(`iterator index reversed`, () =>
      {
         const dar = createReducer(new Map([[1, 1], [2, 2]]));

         assert.deepEqual([...dar.index], [], 'no index');

         dar.sort.set((a, b) => b - a);

         assert.deepEqual([...dar.index], [2, 1], 'sorted index');

         dar.reversed = true;

         assert.deepEqual([...dar.index], [1, 2], 'reverse sorted index');

         dar.sort.clear();

         assert.deepEqual([...dar.index], [], 'no index');
      });

      it(`sort set / hash is number / reset & hash is null`, () =>
      {
         const dar = createReducer(new Map([[1, 1], [2, 2]]));

         assert.isNull(dar.index.hash);

         dar.sort.set((a, b) => b - a);

         assert.isNumber(dar.index.hash);

         dar.sort.clear();

         assert.isNull(dar.index.hash);
      });

      it(`active is false / sort set & active is true / reset & active is false`, () =>
      {
         const dar = createReducer(new Map([[1, 1], [2, 2]]));

         assert.isFalse(dar.index.active);

         dar.sort.set((a, b) => b - a);

         assert.isTrue(dar.index.active);

         dar.sort.clear();

         assert.isFalse(dar.index.active);
      });

      it(`length when index defined and reset`, () =>
      {
         const dar = createReducer(new Map([[1, 1], [2, 2]]));

         assert.equal(dar.index.length, 0);

         dar.sort.set((a, b) => b - a);

         assert.equal(dar.index.length, 2);

         dar.sort.clear();

         assert.equal(dar.index.length, 0);
      });
   });

   describe(`Indexer (Map key types)`, () =>
   {
      it(`boolean`, () =>
      {
         // A default sort method creates an index in DynMapReducer.
         const sort = (a, b) => a - b;

         const dar = createReducer({ data: new Map([[true, 1], [false, 2]]), sort });
         const dar2 = createReducer({ data: new Map([[true, 1], [false, 2]]), sort });
         const dar3 = createReducer({ data: new Map([[true, 3], [true, 4]]), sort });

         assert.isNumber(dar.index.hash, 'hash is number');
         assert.isNumber(dar2.index.hash, 'hash is number');
         assert.isNumber(dar3.index.hash, 'hash is number');

         // In this case index hashes should be equal as same boolean keys are used.
         assert.equal(dar.index.hash, dar2.index.hash, 'index hash is equal');

         // In this case index hashes should not be equal as different boolean keys are used.
         assert.notEqual(dar.index.hash, dar3.index.hash, 'index hash is not equal');
      });

      it(`bigint`, () =>
      {
         // A default sort method creates an index in DynMapReducer.
         const sort = (a, b) => a - b;

         const dar = createReducer({ data: new Map([[1n, 1], [2n, 2]]), sort });
         const dar2 = createReducer({ data: new Map([[1n, 1], [2n, 2]]), sort });
         const dar3 = createReducer({ data: new Map([[3n, 3], [4n, 4]]), sort });

         assert.isNumber(dar.index.hash, 'hash is number');
         assert.isNumber(dar2.index.hash, 'hash is number');
         assert.isNumber(dar3.index.hash, 'hash is number');

         // In this case index hashes should be equal as same bigint keys are used.
         assert.equal(dar.index.hash, dar2.index.hash, 'index hash is equal');

         // In this case index hashes should not be equal as different bigint keys are used.
         assert.notEqual(dar.index.hash, dar3.index.hash, 'index hash is not equal');
      });

      it(`function`, () =>
      {
         // A default sort method creates an index in DynMapReducer.
         const sort = (a, b) => a - b;

         /**  */
         function named() {}

         const dar = createReducer({
            data: new Map([[() => null, 1], [() => null, 2]]),
            sort
         });
         const dar2 = createReducer({
            data: new Map([[() => null, 1], [() => null, 2]]),
            sort
         });
         const dar3 = createReducer({
            data: new Map([[() => null, 3], [named, 4]]),
            sort
         });

         assert.isNumber(dar.index.hash, 'hash is number');
         assert.isNumber(dar2.index.hash, 'hash is number');
         assert.isNumber(dar3.index.hash, 'hash is number');

         // In this case index hashes should be equal as anonymous arrow keys are used.
         assert.equal(dar.index.hash, dar2.index.hash, 'index hash is equal');

         // In this case index hashes should not be equal as a named function key is used.
         assert.notEqual(dar.index.hash, dar3.index.hash, 'index hash is not equal');
      });

      it(`numbers + Nan`, () =>
      {
         // A default sort method creates an index in DynMapReducer.
         const sort = (a, b) => a - b;

         const dar = createReducer({ data: new Map([[0, 1], [2, 2]]), sort });
         const dar2 = createReducer({ data: new Map([[Infinity, 1], [2, 2]]), sort });
         const dar3 = createReducer({ data: new Map([[1, 3], [2, 4]]), sort });

         assert.isNumber(dar.index.hash, 'hash is number');
         assert.isNumber(dar2.index.hash, 'hash is number');
         assert.isNumber(dar3.index.hash, 'hash is number');

         // In this case index hashes should be equal as `Math.NaN` is considered '0'.
         assert.equal(dar.index.hash, dar2.index.hash, 'index hash is equal');

         // In this case index hashes should not be equal.
         assert.notEqual(dar.index.hash, dar3.index.hash, 'index hash is not equal');
      });

      it(`object`, () =>
      {
         // Note: No object key hashing is done presently.

         // A default sort method creates an index in DynMapReducer.
         const sort = (a, b) => a - b;

         const dar = createReducer({ data: new Map([[{}, 1], [{}, 2]]), sort });
         const dar2 = createReducer({
            data: new Map([[{key: false}, 1], [{key: true}, 2]]),
            sort
         });

         assert.isNumber(dar.index.hash, 'hash is number');
         assert.isNumber(dar2.index.hash, 'hash is number');

         // In this case index hashes should be equal as unique hashes for object keys are currently not generated.
         assert.equal(dar.index.hash, dar2.index.hash, 'index hash is equal');
      });

      it(`symbol`, () =>
      {
         // A default sort method creates an index in DynMapReducer.
         const sort = (a, b) => a - b;

         const dar = createReducer({
            data: new Map([[Symbol.for('one'), 1], [Symbol.for('two'), 2]]),
            sort
         });
         const dar2 = createReducer({
            data: new Map([[Symbol.for('one'), 1], [Symbol.for('two'), 2]]),
            sort
         });
         const dar3 = createReducer({
            data: new Map([[Symbol.for('one'), 3], [Symbol.for('three'), 4]]),
            sort
         });

         assert.isNumber(dar.index.hash, 'hash is number');
         assert.isNumber(dar2.index.hash, 'hash is number');
         assert.isNumber(dar3.index.hash, 'hash is number');

         // In this case index hashes should be equal as same symbol keys are used.
         assert.equal(dar.index.hash, dar2.index.hash, 'index hash is equal');

         // In this case index hashes should not be equal as symbol keys are different.
         assert.notEqual(dar.index.hash, dar3.index.hash, 'index hash is not equal');
      });

      it(`undefined and null`, () =>
      {
         // A default sort method creates an index in DynMapReducer.
         const sort = (a, b) => a - b;

         const dar = createReducer({ data: new Map([[void 0, 1], [void 0, 2]]), sort });
         const dar2 = createReducer({ data: new Map([[null, 3], [null, 4]]), sort });

         assert.isNumber(dar.index.hash, 'hash is number');
         assert.isNumber(dar2.index.hash, 'hash is number');

         // In this case index hashes should be equal as undefined and null are treated as '0'.
         assert.equal(dar.index.hash, dar2.index.hash, 'index hash equal');
      });
   });
});
