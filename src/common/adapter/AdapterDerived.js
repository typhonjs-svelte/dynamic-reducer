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
    * @type {DerivedImpl<C>}
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
    * @param {DerivedImpl<C>}  DerivedImpl -
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

   /**
    * @param {OptionsDerivedCreate<C, T>} options -
    *
    * @returns {C}
    */
   create(options)
   {
      /** @type {string} */
      let name;

      /** @type {object} */
      let rest = {};

      /** @type {new () => C} */
      let impl;

      const DerivedImpl = this.#DerivedImpl;

      if (typeof options === 'string')
      {
         name = options;
         impl = DerivedImpl;
      }
      else if (DynReducerUtils.hasPrototype(options, DerivedImpl))
      {
         impl = options;
      }
      else if (typeof options === 'object' && options !== null)
      {
         ({ name, impl = DerivedImpl, ...rest } = options);
      }
      else
      {
         throw new TypeError(`'AdapterDerived.create error: 'options' does not conform to allowed parameters.`);
      }

      if (!DynReducerUtils.hasPrototype(impl, DerivedImpl))
      {
         throw new TypeError(`AdapterDerived.create error: 'impl' is not a '${DerivedImpl?.name}'.`);
      }

      /** @type {new () => C} */
      const DerivedReducer = impl;

      name = name ?? DerivedReducer?.name;

      if (typeof name !== 'string') { throw new TypeError(`AdapterDerived.create error: 'name' is not a string.`); }

      console.log(`! AdapterDerived.create - name: `, name);
      console.log(`! AdapterDerived.create - rest: `, rest);
      console.log(`! AdapterDerived.create - DerivedReducer: `, DerivedReducer);

      const derivedReducer = new DerivedReducer(this.#hostData, this.#parentIndex, rest);

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
