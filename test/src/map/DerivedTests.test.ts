import { assert }          from 'vitest';

import {
   DynArrayReducerDerived,
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

describe(`(Map) Derived Tests`, () =>
{
   describe(`direct API`, () =>
   {
      it(`derived of derived - length with and without index`, () =>
      {
         const map = new Map([[1, 1], [2, 2], [3, 3], [4, 4]]);

         const dar = createReducer(map);
         const drA = dar.derived.create('test');
         const drB = dar.derived.create('test2');
         const dr2A = drA.derived.create('test');
         const dr2B = drB.derived.create('test2');

         assert.equal(dar.length, [...dar].length, 'initial length is correct / no index');
         assert.equal(drA.length, [...drA].length, 'initial length is correct / no index');
         assert.equal(drB.length, [...drB].length, 'initial length is correct / no index');
         assert.equal(dr2A.length, [...dr2A].length, 'initial length is correct / no index');
         assert.equal(dr2B.length, [...dr2B].length, 'initial length is correct / no index');

         assert.deepEqual([...dar], [1, 2, 3, 4], 'correct initial values');
         assert.deepEqual([...drA], [1, 2, 3, 4], 'correct initial values');
         assert.deepEqual([...drB], [1, 2, 3, 4], 'correct initial values');
         assert.deepEqual([...dr2A], [1, 2, 3, 4], 'correct initial values');
         assert.deepEqual([...dr2B], [1, 2, 3, 4], 'correct initial values');

         drA.filters.add((entry) => entry >= 2);

         assert.equal(dar.length, [...dar].length, 'filtered length is correct w/ index');
         assert.equal(drA.length, [...drA].length, 'filtered length is correct w/ index');
         assert.equal(drB.length, [...drB].length, 'filtered length is correct w/ index');
         assert.equal(dr2A.length, [...dr2A].length, 'filtered length is correct w/ index');
         assert.equal(dr2B.length, [...dr2B].length, 'filtered length is correct w/ index');

         assert.deepEqual([...dar], [1, 2, 3, 4], 'correct initial values');
         assert.deepEqual([...drA], [2, 3, 4], 'correct filtered values');
         assert.deepEqual([...drB], [1, 2, 3, 4], 'correct initial values');
         assert.deepEqual([...dr2A], [2, 3, 4], 'correct filtered values');
         assert.deepEqual([...dr2B], [1, 2, 3, 4], 'correct initial values');

         dar.sort.set((a, b) => b - a);

         assert.equal(dar.length, [...dar].length, 'filtered length is correct w/ parent index');
         assert.equal(drA.length, [...drA].length, 'filtered length is correct w/ parent index');
         assert.equal(drB.length, [...drB].length, 'filtered length is correct w/ parent index');
         assert.equal(dr2A.length, [...dr2A].length, 'filtered length is correct w/ parent index');
         assert.equal(dr2B.length, [...dr2B].length, 'filtered length is correct w/ parent index');

         assert.deepEqual([...dar], [4, 3, 2, 1], 'correct initial sorted values');
         assert.deepEqual([...drA], [4, 3, 2], 'correct sorted filtered values');
         assert.deepEqual([...drB], [4, 3, 2, 1], 'correct initial sorted values');
         assert.deepEqual([...dr2A], [4, 3, 2], 'correct sorted filtered values');
         assert.deepEqual([...dr2B], [4, 3, 2, 1], 'correct initial sorted values');

         drA.reversed = true;

         assert.equal(dar.length, [...dar].length, 'filtered length is correct w/ parent index');
         assert.equal(drA.length, [...drA].length, 'filtered length is correct w/ parent index');
         assert.equal(drB.length, [...drB].length, 'filtered length is correct w/ parent index');
         assert.equal(dr2A.length, [...dr2A].length, 'filtered length is correct w/ parent index');
         assert.equal(dr2B.length, [...dr2B].length, 'filtered length is correct w/ parent index');

         assert.deepEqual([...dar], [4, 3, 2, 1], 'correct initial sorted values');
         assert.deepEqual([...drA], [2, 3, 4], 'correct sorted filtered reversed values');
         assert.deepEqual([...drB], [4, 3, 2, 1], 'correct initial sorted values');
         assert.deepEqual([...dr2A], [2, 3, 4], 'correct sorted filtered reversed values');
         assert.deepEqual([...dr2B], [4, 3, 2, 1], 'correct initial sorted values');

         drA.filters.clear();

         assert.equal(dar.length, [...dar].length, 'filtered length is correct w/ parent index');
         assert.equal(drA.length, [...drA].length, 'filtered length is correct w/ parent index');
         assert.equal(drB.length, [...drB].length, 'filtered length is correct w/ parent index');
         assert.equal(dr2A.length, [...dr2A].length, 'filtered length is correct w/ parent index');
         assert.equal(dr2B.length, [...dr2B].length, 'filtered length is correct w/ parent index');

         assert.deepEqual([...dar], [4, 3, 2, 1], 'correct initial sorted values');
         assert.deepEqual([...drA], [1, 2, 3, 4], 'correct sorted filtered reversed values');
         assert.deepEqual([...drB], [4, 3, 2, 1], 'correct initial sorted values');
         assert.deepEqual([...dr2A], [1, 2, 3, 4], 'correct sorted filtered reversed values');
         assert.deepEqual([...dr2B], [4, 3, 2, 1], 'correct initial sorted values');

         dar.reversed = true;

         assert.equal(dar.length, [...dar].length, 'filtered length is correct w/ parent index');
         assert.equal(drA.length, [...drA].length, 'filtered length is correct w/ parent index');
         assert.equal(drB.length, [...drB].length, 'filtered length is correct w/ parent index');
         assert.equal(dr2A.length, [...dr2A].length, 'filtered length is correct w/ parent index');
         assert.equal(dr2B.length, [...dr2B].length, 'filtered length is correct w/ parent index');

         assert.deepEqual([...dar], [1, 2, 3, 4], 'correct initial sorted values');
         assert.deepEqual([...drA], [4, 3, 2, 1], 'correct sorted filtered reversed values');
         assert.deepEqual([...drB], [1, 2, 3, 4], 'correct initial sorted values');
         assert.deepEqual([...dr2A], [4, 3, 2, 1], 'correct sorted filtered reversed values');
         assert.deepEqual([...dr2B], [1, 2, 3, 4], 'correct initial sorted values');

         drA.reversed = false;
         dar.reversed = false;

         assert.equal(dar.length, [...dar].length, 'initial length is correct w/ parent index');
         assert.equal(drA.length, [...drA].length, 'initial length is correct w/ parent index');
         assert.equal(drB.length, [...drB].length, 'initial length is correct w/ parent index');
         assert.equal(dr2A.length, [...dr2A].length, 'initial length is correct w/ parent index');
         assert.equal(dr2B.length, [...dr2B].length, 'initial length is correct w/ parent index');

         assert.deepEqual([...dar], [4, 3, 2, 1], 'correct initial sorted values');
         assert.deepEqual([...drA], [4, 3, 2, 1], 'correct initial sorted values');
         assert.deepEqual([...drB], [4, 3, 2, 1], 'correct initial sorted values');
         assert.deepEqual([...dr2A], [4, 3, 2, 1], 'correct initial sorted values');
         assert.deepEqual([...dr2B], [4, 3, 2, 1], 'correct initial sorted values');

         dar.sort.clear();

         assert.equal(dar.length, [...dar].length, 'initial length is correct without parent index');
         assert.equal(drA.length, [...drA].length, 'initial length is correct without parent index');
         assert.equal(drB.length, [...drB].length, 'initial length is correct without parent index');
         assert.equal(dr2A.length, [...dr2A].length, 'initial length is correct without parent index');
         assert.equal(dr2B.length, [...dr2B].length, 'initial length is correct without parent index');

         assert.deepEqual([...dar], [1, 2, 3, 4], 'correct initial values');
         assert.deepEqual([...drA], [1, 2, 3, 4], 'correct initial values');
         assert.deepEqual([...drB], [1, 2, 3, 4], 'correct initial values');
         assert.deepEqual([...dr2A], [1, 2, 3, 4], 'correct initial values');
         assert.deepEqual([...dr2B], [1, 2, 3, 4], 'correct initial values');
      });
   });

   describe(`Custom`, () =>
   {
      it(`Custom`, () =>
      {
         const data = createData();
         const customReducer = new CustomDynMap(data);

         assert.deepEqual([...customReducer], [
            { type: 'equipment', name: 'backpack' },
            { type: 'consumable', name: 'potion' },
            { type: 'class', name: 'sorcerer', level: 1 },
            { type: 'spell', name: 'bane', level: 1 },
            { type: 'spell', name: 'silence', level: 2 },
            { type: 'consumable', name: 'ham' },
            { type: 'spell', name: 'shield', level: 1 },
            { type: 'equipment', name: 'icepick' },
            { type: 'class', name: 'cleric', level: 4 },
            { type: 'spell', name: 'spirit guardians', level: 3 }
         ], 'matches initial data');

         assert.deepEqual([...customReducer.class], [
            { type: 'class', name: 'cleric', level: 4 },
            { type: 'class', name: 'sorcerer', level: 1 }
         ], 'matches class data');

         assert.equal(customReducer.class.totalLevel, 5, 'synthesized data is correct');

         assert.deepEqual([...customReducer.spells], [
            { type: 'spell', name: 'bane', level: 1 },
            { type: 'spell', name: 'shield', level: 1 },
            { type: 'spell', name: 'silence', level: 2 },
            { type: 'spell', name: 'spirit guardians', level: 3 }
         ], 'matches spells data');

         assert.deepEqual([...customReducer.spells.one], [
            { type: 'spell', name: 'bane', level: 1 },
            { type: 'spell', name: 'shield', level: 1 }
         ], 'matches spells level 1 data');

         assert.deepEqual([...customReducer.spells.two], [
            { type: 'spell', name: 'silence', level: 2 }
         ], 'matches spells level 2 data');

         assert.deepEqual([...customReducer.spells.three], [
            { type: 'spell', name: 'spirit guardians', level: 3 }
         ], 'matches spells level 3 data');

         customReducer.spells.destroy();

         assert.deepEqual([...customReducer.spells], [], 'no data');
         assert.deepEqual([...customReducer.spells.one], [], 'no data');
         assert.deepEqual([...customReducer.spells.two], [], 'no data');
         assert.deepEqual([...customReducer.spells.three], [], 'no data');

         customReducer.destroy();

         assert.deepEqual([...customReducer], [], 'no data');
         assert.deepEqual([...customReducer.class], [], 'no data');
         assert.equal(customReducer.class.totalLevel, 0, 'no data');
      });
   });
});

interface CommonData {
   type: string;
   name: string;
}

interface LevelData extends CommonData {
   type: 'class' | 'spell'
   level: number;
}

type CustomData = CommonData | LevelData;

/**
 * Creates hypothetical list of mixed items of a TTRPG game setting that defines the characteristics and equipment of a
 * character.
 *
 * @returns Test data.
 */
function createData(): Map<string, CustomData>
{
   return new Map([
      ['1', { type: 'equipment', name: 'backpack' }],
      ['2', { type: 'consumable', name: 'potion' }],
      ['3', { type: 'class', name: 'sorcerer', level: 1 }],
      ['4', { type: 'spell', name: 'bane', level: 1 }],
      ['5', { type: 'spell', name: 'silence', level: 2 }],
      ['6', { type: 'consumable', name: 'ham' }],
      ['7', { type: 'spell', name: 'shield', level: 1 }],
      ['8', { type: 'equipment', name: 'icepick' }],
      ['9', { type: 'class', name: 'cleric', level: 4 }],
      ['10', { type: 'spell', name: 'spirit guardians', level: 3 }]
   ]);
}

// -------------------------------------------------------------------------------------------------------------------

/**
 * A derived custom reducer that filters by item `class` and provides a subscriber to calculate derived
 * values (total level) from filtered data.
 */
class ClassDerivedReducer extends DynMapReducerDerived<string, LevelData>
{
   #totalLevel: number;

   destroy()
   {
      super.destroy();
      this.#totalLevel = 0;
   }

   initialize(optionsRest: { extra: string; foo: string }) // eslint-disable-line no-unused-vars
   {
      // Ensure that additional rest options are received.
      assert.deepEqual(optionsRest, { extra: 'data', foo: 'bar' });

      this.filters.add((item: CustomData) => item.type === 'class');
      this.sort.set((a: CustomData, b: CustomData) => a.name.localeCompare(b.name));

      this.subscribe(() => this.#calculate());
   }

   get totalLevel(): number { return this.#totalLevel; }

   #calculate(): void
   {
      this.#totalLevel = 0;

      for (const clazz of this) { this.#totalLevel += clazz.level; }
   }
}

/**
 * A derived custom reducer that filters by item type `spell` and provides further derived reducers for
 * spell levels 1-3.
 */
class SpellsDerivedReducer extends DynMapReducerDerived<string, LevelData>
{
   #levels: {
      one: DynReducer.DerivedMap<string, LevelData>,
      two: DynReducer.DerivedMap<string, LevelData>,
      three: DynReducer.DerivedMap<string, LevelData>,
   }

   initialize()
   {
      this.filters.add((item: CustomData): boolean => item.type === 'spell');
      this.sort.set((a: LevelData, b: LevelData): number => a.level - b.level);

      this.#levels = {
         one: this.derived.create('one'),
         two: this.derived.create('two'),
         three: this.derived.create('three')
      };

      this.#levels.one.filters.add((item: LevelData): boolean => item.level === 1);
      this.#levels.two.filters.add((item: LevelData): boolean => item.level === 2);
      this.#levels.three.filters.add((item: LevelData): boolean => item.level === 3);
   }

   get one(): DynReducer.DerivedMap<string, LevelData> { return this.#levels.one; }

   get two(): DynReducer.DerivedMap<string, LevelData> { return this.#levels.two; }

   get three(): DynReducer.DerivedMap<string, LevelData> { return this.#levels.three; }
}

/**
 * Provides a custom dynamic map reducer with custom reducer classes defined above.
 */
class CustomDynMap extends DynMapReducer<string, CustomData>
{
   readonly #class: ClassDerivedReducer;
   readonly #spells: SpellsDerivedReducer;

   constructor(data?: Map<string, CustomData>)
   {
      super(data);

      this.#class = this.derived.create({
         ctor: ClassDerivedReducer,

         // Add additional options passed to `ClassDerivedReducer.initialize`.
         extra: 'data',
         foo: 'bar'
      });

      this.#spells = this.derived.create(SpellsDerivedReducer);
   }

   /**
    * @returns Class derived reducer
    */
   get class(): ClassDerivedReducer { return this.#class; }

   /**
    * @returns Spells derived reducer
    */
   get spells(): SpellsDerivedReducer { return this.#spells; }
}
