import type { AdapterDerived }   from '#common';

import type { DynReducer }       from '../../types';

/**
 * Provides a public API for managing derived reducers.
 */
export class DerivedMapAPI<D, K, T> implements DynReducer.API.DerivedMap<K, T>
{
   clear: () => void;

   create: <O extends DynReducer.Options.DerivedMapCreate<K, T>>(options: O) =>
      O extends DynReducer.Ctor.DerivedMapReducer<K, T>
         ? InstanceType<O>
         : O extends { ctor: DynReducer.Ctor.DerivedMapReducer<K, T> }
            ? InstanceType<O['ctor']>
            : DynReducer.DerivedMap<K, T>;

   delete: (name: string) => boolean;

   destroy: () => void;

   get: (name: string) => DynReducer.DerivedMap<K, T> | undefined

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
