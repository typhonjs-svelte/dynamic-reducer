import { DynReducerUtils }    from '../DynReducerUtils.js';

import type {
   DynDerivedReducer,
   DynDerivedReducerCtor,
   DynDataOptions,
   DynDataHost,
   DynOptionsDerivedCreate }  from '../../types';

import type { IndexerAPI }    from '../api/IndexerAPI.js';

/**
 * Provides the `derived` API for all dynamic reducers.
 */
export class AdapterDerived<D, K, T>
{
   #hostData: DynDataHost<D>;

   readonly #DerivedReducerCtor: DynDerivedReducerCtor<T>;

   #parentIndex: IndexerAPI<K, T>;

   #derived: Map<string, DynDerivedReducer<D, K, T>> = new Map();

   #destroyed = false;

   /**
    * @param hostData - Hosted data structure.
    *
    * @param parentIndex - Any associated parent index API.
    *
    * @param DerivedReducerCtor - The default derived reducer constructor function.
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
    * @param options - Options defining the new derived reducer.
    *
    * @returns Newly created derived reducer.
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
         ({name, ctor = DerivedReducerCtor, ...rest} = options);
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

      // If the instantiated derived reducer has an `initialize` method then invoke it.
      if (this.#hasInitialize(derivedReducer))
      {
         const { filters, sort, ...optionsRest } = rest;

         derivedReducer.initialize(optionsRest);
      }

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
    * @param name - Name of the derived reducer.
    *
    * @returns true if an element in the Map existed and has been removed, or false if the element does not exist.
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
    * @param name - Name of derived reducer.
    *
    * @returns Any associated derived reducer.
    */
   get(name: string): DynDerivedReducer<D, K, T>
   {
      if (this.#destroyed) { throw Error(`AdapterDerived.get error: this instance has been destroyed.`); }

      return this.#derived.get(name);
   }

   /**
    * Type guard to check for presence of `initialize` method.
    *
    * @param instance - Instance to check.
    */
   #hasInitialize(instance: any): instance is { initialize: (options?: any) => void }
   {
      return typeof instance?.initialize === 'function';
   }

   /**
    * Updates all managed derived reducer indexes.
    *
    * @param [force=false] - Force an update to subscribers.
    */
   update(force: boolean = false)
   {
      if (this.#destroyed) { return; }

      for (const reducer of this.#derived.values()) { reducer.index.update(force); }
   }
}
