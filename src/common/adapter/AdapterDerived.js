import { DynReducerUtils } from '../DynReducerUtils.js';

/**
 * Provides the `derived` API for all dynamic reducers.
 *
 * @template D
 *
 * @template C
 *
 * @template T
 */
export class AdapterDerived
{
   /**
    * @type {DataHost<D>}
    */
   #hostData;

   /**
    * @type {DerivedReducerCtor<C>}
    */
   #DerivedReducerCtor;

   #parentIndex;

   /**
    * @type {Map<string, T>}
    */
   #derived = new Map();

   /**
    * @param {DataHost<D>}  hostData -
    *
    * @param {*}  parentIndex -
    *
    * @param {DerivedReducerCtor<C>}  DerivedReducerCtor -
    */
   constructor(hostData, parentIndex, DerivedReducerCtor)
   {
      this.#hostData = hostData;

      this.#parentIndex = parentIndex;

      this.#DerivedReducerCtor = DerivedReducerCtor;

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
    * @returns {C} Newly created derived reducer.
    */
   create(options)
   {
      /** @type {string} */
      let name;

      /** @type {object} */
      let rest = {};

      /** @type {new () => C} */
      let ctor;

      const DerivedReducerCtor = this.#DerivedReducerCtor;

      if (typeof options === 'string')
      {
         name = options;
         ctor = DerivedReducerCtor;
      }
      else if (DynReducerUtils.hasPrototype(options, DerivedReducerCtor))
      {
         ctor = options;
      }
      else if (typeof options === 'object' && options !== null)
      {
         ({ name, ctor = DerivedReducerCtor, ...rest } = options);
      }
      else
      {
         throw new TypeError(`'AdapterDerived.create error: 'options' does not conform to allowed parameters.`);
      }

      if (!DynReducerUtils.hasPrototype(ctor, DerivedReducerCtor))
      {
         throw new TypeError(`AdapterDerived.create error: 'impl' is not a '${DerivedReducerCtor?.name}'.`);
      }

      /** @type {new () => C} */
      const DerivedReducer = ctor;

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
      return this.#derived.delete(name);
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
