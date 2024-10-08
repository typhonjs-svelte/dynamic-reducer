import { DynReducerUtils } from '../DynReducerUtils.js';

import type {
   DynDerivedReducer,
   DynDerivedReducerCtor,
   DynDataOptions,
   DynDataHost,
   DynOptionsDerivedCreate }  from '../../types';

import type { IndexerAPI } from '../api/IndexerAPI.js';

/**
 * Provides the `derived` API for all dynamic reducers.
 *
 * @template D, K, T
 */
export class AdapterDerived<D, K, T>
{
   #hostData: DynDataHost<D>;

   readonly #DerivedReducerCtor: DynDerivedReducerCtor<T>;

   #parentIndex: IndexerAPI<K, T>;

   #derived: Map<string, DynDerivedReducer<D, K, T>> = new Map();

   #destroyed = false;

   /**
    * @param {DynDataHost<D>} hostData - Hosted data structure.
    *
    * @param {IndexerAPI<K, T>}  parentIndex - Any associated parent index API.
    *
    * @param {DynDerivedReducerCtor<T>} DerivedReducerCtor - The default derived reducer constructor function.
    */
   constructor(hostData: DynDataHost<D>, parentIndex: IndexerAPI<K, T>, DerivedReducerCtor: DynDerivedReducerCtor<T>)
   {
      this.#hostData = hostData;

      this.#parentIndex = parentIndex;

      this.#DerivedReducerCtor = DerivedReducerCtor;

      Object.freeze(this);
   }

   /**
    * Creates a new derived reducer.
    *
    * @param {DynOptionsDerivedCreate<T>} options - Options defining the new derived reducer.
    *
    * @returns {DynDerivedReducer<D, K, T>} Newly created derived reducer.
    */
   create(options: DynOptionsDerivedCreate<T>): DynDerivedReducer<D, K, T>
   {
      if (this.#destroyed) { throw Error(`AdapterDerived.create error: this instance has been destroyed.`); }

      let name: string;

      let rest: DynDataOptions<T> = {};

      let ctor: DynDerivedReducerCtor<T>;

      const DerivedReducerCtor: DynDerivedReducerCtor<T> = this.#DerivedReducerCtor;

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
    * Removes all derived reducers and associated subscriptions.
    */
   clear()
   {
      if (this.#destroyed) { return; }

      for (const reducer of this.#derived.values()) { reducer.destroy(); }

      this.#derived.clear();
   }

   /**
    * Deletes and destroys a derived reducer by name.
    *
    * @param {string}   name - Name of the derived reducer.
    *
    * @returns {boolean} true if an element in the Map existed and has been removed, or false if the element does not
    *          exist.
    */
   delete(name: string): boolean
   {
      if (this.#destroyed) { throw Error(`AdapterDerived.delete error: this instance has been destroyed.`); }

      const reducer = this.#derived.get(name);

      if (reducer) { reducer.destroy(); }

      return this.#derived.delete(name);
   }

   /**
    * Removes all derived reducers, subscriptions, and cleans up all resources.
    */
   destroy()
   {
      if (this.#destroyed) { return; }

      this.clear();

      this.#hostData = [null];
      this.#parentIndex = null;

      this.#destroyed = true;
   }

   /**
    * Returns an existing derived reducer.
    *
    * @param {string}   name - Name of derived reducer.
    *
    * @returns {DynDerivedReducer<D, K, T>} Any associated derived reducer.
    */
   get(name: string): DynDerivedReducer<D, K, T>
   {
      if (this.#destroyed) { throw Error(`AdapterDerived.get error: this instance has been destroyed.`); }

      return this.#derived.get(name);
   }

   /**
    * Updates all managed derived reducer indexes.
    *
    * @param {boolean}  [force=false] - Force an update to subscribers.
    */
   update(force: boolean = false)
   {
      if (this.#destroyed) { return; }

      for (const reducer of this.#derived.values()) { reducer.index.update(force); }
   }
}
