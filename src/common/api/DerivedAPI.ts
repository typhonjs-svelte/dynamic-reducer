import type { AdapterDerived }   from '../adapter/AdapterDerived';

import type { DynReducer }       from '../../types';

/**
 * Provides a public API for managing derived reducers.
 */
export class DerivedAPI<D, K, T> implements DynReducer.API.Derived<K, T>
{
   clear: () => void;

   create: <O extends DynReducer.Options.DerivedCreate<T>>(options: O) =>
      O extends DynReducer.Ctor.DerivedReducer<T>
         ? InstanceType<O>
         : O extends { ctor: DynReducer.Ctor.DerivedReducer<T> }
            ? InstanceType<O['ctor']>
            : DynReducer.DerivedMap<K, T>;

   delete: (name: string) => boolean;

   destroy: () => void;

   get: (name: string) => DynReducer.DerivedMap<K, T>

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
