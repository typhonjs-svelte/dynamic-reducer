/**
 * @template T
 */
export class AdapterDerived
{
   #hostData;

   /**
    * @type {T}
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
    * @param {T}  DerivedImpl -
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

   create(name, options)
   {
      const ReducerClass = this.#DerivedImpl;

      const reducer = new ReducerClass(this.#hostData, this.#parentIndex, options);

      this.#derived.set(name, reducer);

      return reducer;
   }

   delete(name)
   {

   }

   get(name)
   {
      return this.#derived.get(name);
   }

   update(force)
   {
      for (const reducer of this.#derived.values())
      {
         reducer.index.update();
      }
   }
}
