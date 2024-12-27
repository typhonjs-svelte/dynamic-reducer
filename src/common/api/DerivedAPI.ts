import type { AdapterDerived }   from '../adapter/AdapterDerived.js';

import type {
   DynDerivedAPI,
   DynDerivedReducer,
   DynDerivedReducerCtor,
   DynOptionsDerivedCreate }     from '../../types';

/**
 * Provides a public API for managing derived reducers.
 */
export class DerivedAPI<D, K, T> implements DynDerivedAPI<D, K, T>
{
   clear: () => void;

   create: <O extends DynOptionsDerivedCreate<T>>(options: O) =>
      O extends DynDerivedReducerCtor<T>
         ? InstanceType<O>
         : O extends { ctor: DynDerivedReducerCtor<T> }
            ? InstanceType<O['ctor']>
            : DynDerivedReducer<D, K, T>;

   delete: (name: string) => boolean;

   destroy: () => void;

   get: (name: string) => DynDerivedReducer<D, K, T>

   constructor(adapterDerived: AdapterDerived<D, K, T>)
   {
      this.clear = adapterDerived.clear.bind(adapterDerived);
      this.create = adapterDerived.create.bind(adapterDerived);
      this.delete = adapterDerived.delete.bind(adapterDerived);
      this.destroy = adapterDerived.destroy.bind(adapterDerived);
      this.get = adapterDerived.get.bind(adapterDerived);

      Object.freeze(this);
   }
}
