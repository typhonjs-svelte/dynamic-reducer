import type { DynReducer } from './';

export namespace Internal {
   export namespace Ctor {
      /**
       * Defines the shape of a generic derived reducer constructor function.
       */
      export interface DerivedReducer<K, T>
      {
         new (hostData: Data.Host<any>, parentIndex: DynReducer.API.Index<any> | null,
          options: DynReducer.Options.Common<T>): DynReducer.DerivedList<T> | DynReducer.DerivedMap<K, T>;
      }
   }

   export namespace Data {
      /**
       * Provides a compound type for the backing data structure stored in reducers.
       */
      export type Host<D> = (D | null)[];

      /**
       * Defines the data object storing index data in AdapterIndexer.
       */
      export type Index<K> = {
         /**
          * The index array.
          */
         index: K[] | null;

         /**
          * Hashcode for current index content.
          */
         hash: number | null;

         /**
          * Is iteration reversed?
          */
         reversed: boolean;

         /**
          * Any associated parent index data.
          */
         parent?: DynReducer.API.Index<K> | null;
      };
   }

   export namespace Options {
      /**
       * Provides a compound type accepting either derived reducer options types.
       */
      export type DerivedCreate<K, T> = DynReducer.Options.DerivedListCreate<T> |
       DynReducer.Options.DerivedMapCreate<K, T>;
   }
}
