import type { DynArrayReducerDerived } from '../array';
import type { DynMapReducerDerived }   from '../map';

/**
 * Defines all public types for the `dynamic-reducer` library.
 */
export declare namespace DynReducer {
   /**
    * Defines the common interface for a derived list reducer.
    *
    * @typeParam T `any` - Type of data.
    */
   export interface DerivedList<T>
   {
      /**
       * @returns Provides an iterator for data stored in the derived reducer.
       */
      [Symbol.iterator](): IterableIterator<T>;

      /**
       * @returns Derived public API.
       */
      get derived(): API.DerivedList<T>;

      /**
       * @returns The filters adapter.
       */
      get filters(): API.Filters<T>;

      /**
       * @returns Returns the Indexer public API.
       */
      get index(): API.Index<number, T>;

      /**
       * @returns Returns whether this derived reducer is destroyed.
       */
      get destroyed(): boolean;

      /**
       * @returns Returns the main data items or indexed items length.
       */
      get length(): number;

      /**
       * @returns Returns current reversed state.
       */
      get reversed(): boolean;

      /**
       * @returns The sort adapter.
       */
      get sort(): API.Sort<T>;

      /**
       * Sets reversed state and notifies subscribers.
       *
       * @param reversed - New reversed state.
       */
      set reversed(reversed: boolean);

      /**
       * Removes all derived reducers, subscriptions, and cleans up all resources.
       */
      destroy(): void;

      /**
       * Add a subscriber to this DynMapReducer instance.
       *
       * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
       *
       * @returns Unsubscribe function.
       */
      subscribe(handler: (value: DerivedList<T>) => void): () => void;
   }

   /**
    * Defines the common interface for a derived map reducer.
    *
    * @typeParam K `any` - Key type.
    *
    * @typeParam T `any` - Type of data.
    */
   export interface DerivedMap<K, T>
   {
      /**
       * @returns Provides an iterator for data stored in the derived reducer.
       */
      [Symbol.iterator](): IterableIterator<T>;

      /**
       * @returns Derived public API.
       */
      get derived(): API.DerivedMap<K, T>;

      /**
       * @returns The filters adapter.
       */
      get filters(): API.Filters<T>;

      /**
       * @returns Returns the Indexer public API.
       */
      get index(): API.Index<K, T>;

      /**
       * @returns Returns whether this derived reducer is destroyed.
       */
      get destroyed(): boolean;

      /**
       * @returns Returns the main data items or indexed items length.
       */
      get length(): number;

      /**
       * @returns Returns current reversed state.
       */
      get reversed(): boolean;

      /**
       * @returns The sort adapter.
       */
      get sort(): API.Sort<T>;

      /**
       * Sets reversed state and notifies subscribers.
       *
       * @param reversed - New reversed state.
       */
      set reversed(reversed: boolean);

      /**
       * Removes all derived reducers, subscriptions, and cleans up all resources.
       */
      destroy(): void;

      /**
       * Add a subscriber to this DynMapReducer instance.
       *
       * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
       *
       * @returns Unsubscribe function.
       */
      subscribe(handler: (value: DerivedMap<K, T>) => void): () => void;
   }

   /**
    * Defines the main composed public API for top-level and derived reducers.
    */
   export namespace API {
      /**
       * Provides the public API for derived list reducers. There are several ways to create a derived reducer from
       * utilizing the default implementation or passing in a constructor function / class for a custom derived reducer.
       *
       * This API is accessible from the `derived` getter in the top-level and derived list reducers.
       *
       * ```
       * const dynArray = new DynArrayReducer([...]);
       * dynArray.derived.clear();
       * dynArray.derived.create(...);
       * dynArray.derived.delete(...);
       * dynArray.derived.destroy();
       * dynArray.derived.get(...);
       * ```
       *
       * @typeParam T `any` - Type of data.
       */
      export interface DerivedList<T>
      {
         /**
          * Removes all derived reducers and associated subscriptions.
          */
         clear(): void;

         /**
          * @param options - Options for creating a reducer.
          *
          * @returns Newly created derived reducer.
          */
         create<O extends Options.DerivedListCreate<T>>(options: O): O extends typeof DynArrayReducerDerived<T>
            ? InstanceType<O>
            : O extends { ctor: typeof DynArrayReducerDerived<T> }
               ? InstanceType<O['ctor']>
               : DynReducer.DerivedList<T>;

         /**
          * Deletes and destroys a derived reducer.
          *
          * @param name - Name of the derived reducer
          *
          * @returns Whether the derived reducer was deleted.
          */
         delete(name: string): boolean;

         /**
          * Removes all derived reducers, associated subscriptions, and cleans up all resources.
          */
         destroy(): void;

         /**
          * Returns an existing derived reducer.
          *
          * @param name - Name of derived reducer.
          *
          * @returns Any associated derived reducer.
          */
         get(name: string): DynReducer.DerivedList<T> | undefined;
      }

      /**
       * Provides the public API for derived map reducers. There are several ways to create a derived reducer from
       * utilizing the default implementation or passing in a constructor function / class for a custom derived reducer.
       *
       * This API is accessible from the `derived` getter in the top-level and derived map reducers.
       *
       * ```
       * const dynMap = new DynMapReducer([...]);
       * dynMap.derived.clear();
       * dynMap.derived.create(...);
       * dynMap.derived.delete(...);
       * dynMap.derived.destroy();
       * dynMap.derived.get(...);
       * ```
       *
       * @typeParam K `any` - Key type.
       *
       * @typeParam T `any` - Type of data.
       */
      export interface DerivedMap<K, T>
      {
         /**
          * Removes all derived reducers and associated subscriptions.
          */
         clear(): void;

         /**
          * @param options - Options for creating a reducer.
          *
          * @returns Newly created derived reducer.
          */
         create<O extends Options.DerivedMapCreate<K, T>>(options: O): O extends typeof DynMapReducerDerived<K, T>
            ? InstanceType<O>
            : O extends { ctor: typeof DynMapReducerDerived<K, T> }
               ? InstanceType<O['ctor']>
               : DynReducer.DerivedMap<K, T>;

         /**
          * Deletes and destroys a derived reducer.
          *
          * @param name - Name of the derived reducer
          *
          * @returns Whether the derived reducer was deleted.
          */
         delete(name: string): boolean;

         /**
          * Removes all derived reducers, associated subscriptions, and cleans up all resources.
          */
         destroy(): void;

         /**
          * Returns an existing derived reducer.
          *
          * @param name - Name of derived reducer.
          *
          * @returns Any associated derived reducer.
          */
         get(name: string): DynReducer.DerivedMap<K, T> | undefined;
      }

      /**
       * Provides the storage and sequencing of managed filters. Each filter added may be a bespoke function or a
       * {@link DynReducer.Data.Filter} object containing an `id`, `filter`, and `weight` attributes; `filter` is the
       * only required attribute.
       *
       * The `id` attribute can be anything that creates a unique ID for the filter; recommended strings or numbers.
       * This allows filters to be removed by ID easily.
       *
       * The `weight` attribute is a number between 0 and 1 inclusive that allows filters to be added in a
       * predictable order which is especially handy if they are manipulated at runtime. A lower weighted filter always
       * runs before a higher weighted filter. For speed and efficiency always set the heavier / more inclusive filter
       * with a lower weight; an example of this is a keyword / name that will filter out many entries making any
       * further filtering faster. If no weight is specified the default of '1' is assigned and it is appended to the
       * end of the filters list.
       *
       * This class forms the public API which is accessible from the `.filters` getter in the main reducer
       * implementation.
       * ```
       * const dynArray = new DynArrayReducer([...]);
       * dynArray.filters.add(...);
       * dynArray.filters.clear();
       * dynArray.filters.length;
       * dynArray.filters.remove(...);
       * dynArray.filters.removeBy(...);
       * dynArray.filters.removeById(...);
       * ```
       *
       * @typeParam T `any` - Type of data.
       */
      export interface Filters<T>
      {
         /**
          * @returns Provides an iterator for filters.
          */
         [Symbol.iterator](): IterableIterator<Data.Filter<T>>;

         /**
          * @returns Returns the length of the filter data.
          */
         get length(): number;

         /**
          * @param filters - One or more filter functions / DynDataFilter to add.
          */
         add(...filters: (Data.FilterFn<T> | Data.Filter<T>)[]): void;

         /**
          * Clears and removes all filters.
          */
         clear(): void;

         /**
          * @param filters - One or more filter functions / DynDataFilter to remove.
          */
         remove(...filters: (Data.FilterFn<T> | Data.Filter<T>)[]): void;

         /**
          * Remove filters by the provided callback. The callback takes 3 parameters: `id`, `filter`, and `weight`.
          * Any truthy value returned will remove that filter.
          *
          * @param callback - Callback function to evaluate each filter entry.
          */
         removeBy(callback: (id: any, filter: Data.FilterFn<T>, weight: number) => boolean): void;

         /**
          * @param ids - Removes filters by ID.
          */
         removeById(...ids: any[]): void;
      }

      /**
       * Provides the public API for accessing the index API.
       *
       * This class forms the public API which is accessible from the `.index` getter in the main reducer
       * implementation.
       * ```
       * const dynArray = new DynArrayReducer([...]);
       * dynArray.index.active;
       * dynArray.index.hash;
       * dynArray.index.length;
       * dynArray.index.update(...);
       * ```
       *
       * @typeParam K `any` - Key type.
       *
       * @typeParam T `any` - Type of data.
       */
      export interface Index<K, T>
      {
         /**
          * @returns Returns whether the index is active.
          */
         get active(): boolean;

         /**
          * @returns Returns length of reduced index.
          */
         get length(): number;

         /**
          * Manually invoke an update of the index.
          *
          * @param [force] - Force update to any subscribers.
          */
         update(force?: boolean): void;

         /**
          * @returns Current hash value of the index.
          */
         get hash(): number | null;

         /**
          * Provides an iterator over the index array.
          *
          * @returns Iterator for the index array.
          */
         [Symbol.iterator](): IterableIterator<K>;
      }

      /**
       * Provides the storage and sequencing of a managed sort function. The sort function set may be a bespoke function
       * or a {@link Data.Sort} object containing an `compare`, and `subscribe` attributes; `compare` is the only
       * required attribute.
       *
       * Note: You can set a compare function that also has a subscribe function attached as the `subscribe` attribute.
       * If a subscribe function is provided the sort function can notify any updates that may change sort order and
       * this triggers an index update.
       *
       * This class forms the public API which is accessible from the `.sort` getter in the main reducer implementation.
       * ```
       * const dynArray = new DynArrayReducer([...]);
       * dynArray.sort.clear();
       * dynArray.sort.set(...);
       * ```
       *
       * @typeParam T `any` - Type of data.
       */
      export interface Sort<T>
      {
         /**
          * Clears & removes any assigned sort function and triggers an index update.
          */
         clear(): void;

         /**
          * @param sort - A callback function that compares two values. Return > 0 to sort `b` before `a`;
          * < 0 to sort `a` before `b`; or 0 to keep original order of `a` & `b`.
          *
          * Note: You can set a compare function that also has a subscribe function attached as the `subscribe`
          * attribute.
          *
          * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters
          */
         set(sort: Data.CompareFn<T> | Data.Sort<T> | null | undefined): void;
      }
   }

   /**
    * Defines data utilized by the `dynamic-reducer` library.
    */
   export namespace Data {
      /**
       * A callback function that compares two values. Return > 0 to sort 'b' before 'a'; < 0 to sort 'a' before 'b';
       * or 0 to keep original order of 'a' & 'b'.
       *
       * This function has an optional subscribe function that follows the Svelte store Subscriber pattern. If a
       * subscribe function is provided automatic updates to the reduced index is performed.
       *
       * @typeParam T `any` - Type of data.
       */
      export interface CompareFn<T> {
         /**
          * @param a - Element 'a' of backing data to sort.
          *
          * @param b - Element 'b' of backing data to sort.
          */
         (a: T, b: T): number;

         /**
          * Optional subscribe function following the Svelte store / subscribe pattern.
          *
          * @param indexUpdate - Callback function that is invoked on update / changes. Receives `index update`
          *        function.
          */
         subscribe?: (indexUpdate: IndexUpdateFn) => () => void;
      }

      /**
       * Defines object / options for creating a derived list reducer.
       *
       * @typeParam T `any` - Type of data.
       */
      export interface DerivedListCreate<T> extends Options.Common<T> {
         /**
          * Name of derived reducer.
          */
         name?: string;

         /**
          * A DerivedReducer constructor function / class.
          */
         ctor?: typeof DynArrayReducerDerived<T>;

         /**
          * Extra data to pass through to `initialize`.
          */
         [key: string]: any;
      }

      /**
       * Defines object / options for creating a derived map reducer.
       *
       * @typeParam K `any` - Key type.
       *
       * @typeParam T `any` - Type of data.
       */
      export interface DerivedMapCreate<K, T> extends Options.Common<T> {
         /**
          * Name of derived reducer.
          */
         name?: string;

         /**
          * A DerivedReducer constructor function / class.
          */
         ctor?: typeof DynMapReducerDerived<K, T>;

         /**
          * Extra data to pass through to `initialize`.
          */
         [key: string]: any;
      }

      /**
       * Defines the data object to configure a filter w/ additional configuration options.
       *
       * @typeParam T `any` - Type of data.
       */
      export type Filter<T> = {
         /**
          * An optional ID associated with this filter. Can be used to remove the filter.
          */
         id?: any;

         /**
          * Filter function that takes a value argument and returns a truthy value to keep it.
          */
         filter: FilterFn<T>;

         /**
          * An optional number between 0 and 1 inclusive to position this filter against others.
          */
         weight?: number;

         /**
          * Optional subscribe function following the Svelte store / subscribe pattern.
          *
          * @param indexUpdate - Callback function that is invoked on update / changes.
          */
         subscribe?: (indexUpdate: IndexUpdateFn) => () => void;
      };

      /**
       * Filter function that takes an element argument and returns a truthy value to keep it.
       *
       * This function has an optional subscribe function that follows the Svelte store Subscriber pattern. If a
       * subscribe function is provided automatic updates to the reduced index is performed.
       *
       * @typeParam T `any` - Type of data.
       */
      export interface FilterFn<T> {
         /**
          * @param element - Element of backing data structure to filter.
          *
          * @returns Does the element pass the filter test.
          */
         (element: T): boolean;

         /**
          * Optional subscribe function following the Svelte store / subscribe pattern.
          *
          * @param indexUpdate - Callback function that is invoked on update / changes. Receives `this` reference.
          */
         subscribe?: (indexUpdate: IndexUpdateFn) => () => void;
      }

      /**
       * Updates associated dynamic reducer indexer.
       *
       * @param [force] - Force an update the index regardless of hash calculations.
       */
      export type IndexUpdateFn = (force?: boolean) => void;

      /**
       * Defines an object to configure sort functionality.
       *
       * @typeParam T `any` - Type of data.
       */
      export type Sort<T> = {
         /**
          * A callback function that compares two values.
          */
         compare: CompareFn<T>;

         /**
          * Optional subscribe function following the Svelte store / subscribe pattern.
          *
          * @param indexUpdate - Callback function that is invoked on update / changes.
          */
         subscribe?: (indexUpdate: IndexUpdateFn) => () => void;
      };
   }

   /**
    * Defines all options objects utilized by the `dynamic-reducer` library.
    */
   export namespace Options {
      /**
       * The main options object for DynArrayReducer.
       *
       * @typeParam T `any` - Type of data.
       */
      export interface ListReducer<T> extends Common<T> {
         /**
          * Initial data iterable list.
          */
         data?: Iterable<T>;
      }

      /**
       * Defines the additional options for filters and sort function.
       *
       * @typeParam T `any` - Type of data.
       */
      export interface Common<T> {
         /**
          * Iterable list of filters.
          */
         filters?: Iterable<Data.FilterFn<T> | Data.Filter<T>>;

         /**
          * Compare function.
          */
         sort?: Data.CompareFn<T> | Data.Sort<T>;
      }

      /**
       * Creates a compound type for all derived list reducer 'create' option combinations.
       *
       * Includes additional type inference constraints for {@link Data.DerivedListCreate}.
       *
       * @typeParam T `any` - Type of data.
       */
      export type DerivedListCreate<T> =
         | string
         | typeof DynArrayReducerDerived<T>
         | (Data.DerivedListCreate<T> & { ctor: typeof DynArrayReducerDerived<T> })
         | (Data.DerivedListCreate<T> & { name: string } & (
            | { filters: Iterable<Data.FilterFn<T> | Data.Filter<T>> }
            | { sort: Data.CompareFn<T> | Data.Sort<T> }
         ));

      /**
       * Creates a compound type for all derived map reducer 'create' option combinations.
       *
       * Includes additional type inference constraints for {@link Data.DerivedMapCreate}.
       *
       * @typeParam K `any` - Key type.
       *
       * @typeParam T `any` - Type of data.
       */
      export type DerivedMapCreate<K, T> =
         | string
         | typeof DynMapReducerDerived<K, T>
         | (Data.DerivedMapCreate<K, T> & { ctor: typeof DynMapReducerDerived<K, T> })
         | (Data.DerivedMapCreate<K, T> & { name: string } & (
            | { filters: Iterable<Data.FilterFn<T> | Data.Filter<T>> }
            | { sort: Data.CompareFn<T> | Data.Sort<T> }
         ));

      /**
       * The main options object for DynMapReducer.
       *
       * @typeParam K `any` - Key type.
       *
       * @typeParam T `any` - Type of data.
       */
      export interface MapReducer<K, T> extends Common<T> {
         /**
          * Optional initial backing Map.
          */
         data?: Map<K, T>;
      }
   }
}
