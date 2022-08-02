import { DynReducerUtils } from '../DynReducerUtils.js';

/**
 * Provides the `derived` API for all dynamic reducers.
 *
 * @template C
 *
 * @template T
 */
export class AdapterDerived
{
   #hostData;

   /**
    * @type {new () => C}
    */
   #DerivedImpl;

   #parentIndex;

   /**
    * @type {Map<string, T>}
    */
   #derived = new Map();

   /**
    * @param {*}  hostData -
    *
    * @param {*}  parentIndex -
    *
    * @param {new () => C}  DerivedImpl -
    */
   constructor(hostData, parentIndex, DerivedImpl)
   {
      this.#hostData = hostData;

      this.#parentIndex = parentIndex;

      this.#DerivedImpl = DerivedImpl;

      const publicAPI = {
         create: this.create.bind(this),
         delete: this.delete.bind(this),
         get: this.get.bind(this)
      };

      return [this, publicAPI];
   }

   create({ name, ...options } = {})
   {
      if (typeof name !== 'string') { throw new TypeError(`AdapterDerived.create error: 'name' is not a string.`); }

      const DerivedReducer = this.#DerivedImpl;

      let derivedReducer;

      // A specific derived class implementation is provided. Verify that the `DerivedReducer` is in the prototype
      // chain.
      if (typeof options.class === 'function')
      {
         if (!DynReducerUtils.hasPrototype(options.class, DerivedReducer))
         {
            throw new TypeError(`AdapterDerived.create error: 'options.class' is not a '${DerivedReducer?.name}'.`);
         }

         const CustomDerivedReducer = options.class;

         derivedReducer = new CustomDerivedReducer(this.#hostData, this.#parentIndex, options);
      }
      else
      {
         derivedReducer = new DerivedReducer(this.#hostData, this.#parentIndex, options);
      }

      this.#derived.set(name, derivedReducer);

      return derivedReducer;
   }

   delete(name)
   {

   }

   get(name)
   {
      return this.#derived.get(name);
   }

   update(force = false)
   {
      for (const reducer of this.#derived.values())
      {
         reducer.index.update(force);
      }
   }
}
