import type { AdapterDerived }         from '#common';

import type { DynArrayReducerDerived } from './DynArrayReducerDerived';

import type { DynReducer }             from '../../types';

/**
 * Provides a public API for managing derived reducers.
 */
export class DerivedListAPI<D, K, T> implements DynReducer.API.DerivedList<T>
{
   clear: () => void;

   create: <O extends DynReducer.Options.DerivedListCreate<T>>(options: O) =>
      O extends typeof DynArrayReducerDerived<T>
         ? InstanceType<O>
         : O extends { ctor: typeof DynArrayReducerDerived<T> }
            ? InstanceType<O['ctor']>
            : DynReducer.DerivedList<T>;

   delete: (name: string) => boolean;

   destroy: () => void;

   get: (name: string) => DynReducer.DerivedList<T> | undefined

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
