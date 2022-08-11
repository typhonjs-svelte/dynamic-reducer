import { DynReducerUtils } from '../DynReducerUtils.js';

import type {
   IDerivedReducer,
   IDerivedReducerCtor,
   DataDerivedOptions,
   DataHost,
   OptionsDerivedCreate }  from '../../types/index.js';

import type { IndexerAPI } from '../api/IndexerAPI.js';

/**
 * Provides the `derived` API for all dynamic reducers.
 */
export class AdapterDerived<D, K, T>
{
   readonly #hostData: DataHost<D>;

   readonly #DerivedReducerCtor: IDerivedReducerCtor<T>;

   readonly #parentIndex: IndexerAPI<K, T>;

   #derived: Map<string, IDerivedReducer<D, K, T>> = new Map();

   /**
    * @param hostData -
    *
    * @param parentIndex -
    *
    * @param DerivedReducerCtor -
    */
   constructor(hostData: DataHost<D>, parentIndex: IndexerAPI<K, T>, DerivedReducerCtor: IDerivedReducerCtor<T>)
   {
      this.#hostData = hostData;

      this.#parentIndex = parentIndex;

      this.#DerivedReducerCtor = DerivedReducerCtor;

      Object.freeze(this);
   }

   /**
    * @param options -
    *
    * @returns Newly created derived reducer.
    */
   create(options: OptionsDerivedCreate<T>): IDerivedReducer<D, K, T>
   {
      let name: string;

      let rest: DataDerivedOptions<T> = {};

      let ctor: IDerivedReducerCtor<T>;

      const DerivedReducerCtor: IDerivedReducerCtor<T> = this.#DerivedReducerCtor;

      if (typeof options === 'string')
      {
         name = options;
         ctor = DerivedReducerCtor;
      }
      else if (typeof options === 'function' && DynReducerUtils.hasPrototype(options, DerivedReducerCtor))
      {
         ctor = options;
      }
      else if (typeof options === 'object' && options !== null)
      {
         ({ name, ctor = DerivedReducerCtor, ...rest } = options);
      }
      else
      {
         throw new TypeError(`AdapterDerived.create error: 'options' does not conform to allowed parameters.`);
      }

      if (!DynReducerUtils.hasPrototype(ctor, DerivedReducerCtor))
      {
         throw new TypeError(`AdapterDerived.create error: 'ctor' is not a '${DerivedReducerCtor?.name}'.`);
      }

      name = name ?? ctor?.name;

      if (typeof name !== 'string') { throw new TypeError(`AdapterDerived.create error: 'name' is not a string.`); }

      const derivedReducer = new ctor(this.#hostData, this.#parentIndex, rest);

      this.#derived.set(name, derivedReducer);

      return derivedReducer;
   }

   /**
    * Deletes and destroys a derived reducer.
    *
    * @param name - Name of the derived reducer.
    */
   delete(name: string): boolean
   {
      return this.#derived.delete(name);
   }

   /**
    * Returns an existing derived reducer.
    *
    * @param name - Name of derived reducer.
    */
   get(name: string): IDerivedReducer<D, K, T>
   {
      return this.#derived.get(name);
   }

   /**
    * Updates all managed derived reducer indexes.
    *
    * @param [force] - Force an update to subscribers.
    */
   update(force: boolean = false)
   {
      for (const reducer of this.#derived.values()) { reducer.index.update(force); }
   }
}
