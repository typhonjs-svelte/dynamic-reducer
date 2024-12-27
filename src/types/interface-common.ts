import type {
   DynDerivedReducer,

   DynCompareFn,
   DynDataFilter,
   DynDataSort,
   DynDerivedReducerCtor,
   DynFilterFn,
   DynOptionsDerivedCreate }  from './';

/**
 * Provides the storage and sequencing of managed filters. Each filter added may be a bespoke function or a
 * {@link DynDataFilter} object containing an `id`, `filter`, and `weight` attributes; `filter` is the only required
 * attribute.
 *
 * The `id` attribute can be anything that creates a unique ID for the filter; recommended strings or numbers. This
 * allows filters to be removed by ID easily.
 *
 * The `weight` attribute is a number between 0 and 1 inclusive that allows filters to be added in a
 * predictable order which is especially handy if they are manipulated at runtime. A lower weighted filter always runs
 * before a higher weighted filter. For speed and efficiency always set the heavier / more inclusive filter with a
 * lower weight; an example of this is a keyword / name that will filter out many entries making any further filtering
 * faster. If no weight is specified the default of '1' is assigned and it is appended to the end of the filters list.
 *
 * This class forms the public API which is accessible from the `.filters` getter in the main reducer implementation.
 * ```
 * const dynArray = new DynArrayReducer([...]);
 * dynArray.filters.add(...);
 * dynArray.filters.clear();
 * dynArray.filters.length;
 * dynArray.filters.remove(...);
 * dynArray.filters.removeBy(...);
 * dynArray.filters.removeById(...);
 * ```
 */
export interface DynAdapterFilters<T>
{
   /**
    * @returns Provides an iterator for filters.
    */
   [Symbol.iterator](): IterableIterator<DynDataFilter<T>>;

   /**
    * @returns Returns the length of the filter data.
    */
   get length(): number;

   /**
    * @param filters - One or more filter functions / DynDataFilter to add.
    */
   add(...filters: (DynFilterFn<T> | DynDataFilter<T>)[]): void;

   /**
    * Clears and removes all filters.
    */
   clear(): void;

   /**
    * @param filters - One or more filter functions / DynDataFilter to remove.
    */
   remove(...filters: (DynFilterFn<T> | DynDataFilter<T>)[]): void;

   /**
    * Remove filters by the provided callback. The callback takes 3 parameters: `id`, `filter`, and `weight`.
    * Any truthy value returned will remove that filter.
    *
    * @param callback - Callback function to evaluate each filter entry.
    */
   removeBy(callback: (id: any, filter: DynFilterFn<T>, weight: number) => boolean): void;

   /**
    * @param ids - Removes filters by ID.
    */
   removeById(...ids: any[]): void;
}

/**
 * Provides the storage and sequencing of a managed sort function. The sort function set may be a bespoke function or a
 * {@link DynDataSort} object containing an `compare`, and `subscribe` attributes; `compare` is the only required
 * attribute.
 *
 * Note: You can set a compare function that also has a subscribe function attached as the `subscribe` attribute.
 * If a subscribe function is provided the sort function can notify any updates that may change sort order and this
 * triggers an index update.
 *
 * This class forms the public API which is accessible from the `.sort` getter in the main reducer implementation.
 * ```
 * const dynArray = new DynArrayReducer([...]);
 * dynArray.sort.clear();
 * dynArray.sort.set(...);
 * ```
 */
export interface DynAdapterSort<T>
{
   /**
    * Clears & removes any assigned sort function and triggers an index update.
    */
   clear(): void;

   /**
    * @param sort - A callback function that compares two values. Return > 0 to sort `b` before `a`;
    * < 0 to sort `a` before `b`; or 0 to keep original order of `a` & `b`.
    *
    * Note: You can set a compare function that also has a subscribe function attached as the `subscribe` attribute.
    *
    * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters
    */
   set(sort: DynCompareFn<T> | DynDataSort<T>): void;
}

/**
 * Provides the public API for derived reducers. There are several ways to create a derived reducer from utilizing the
 * default implementation or passing in a constructor function / class for a custom derived reducer.
 *
 * This class forms the public API which is accessible from the `.derived` getter in the main reducer implementation.
 * ```
 * const dynArray = new DynArrayReducer([...]);
 * dynArray.derived.clear();
 * dynArray.derived.create(...);
 * dynArray.derived.delete(...);
 * dynArray.derived.destroy();
 * dynArray.derived.get(...);
 * ```
 */
export interface DynDerivedAPI<D, K, T>
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
   create<O extends DynOptionsDerivedCreate<T>>(options: O): O extends DynDerivedReducerCtor<T>
      ? InstanceType<O>
      : O extends { ctor: DynDerivedReducerCtor<T> }
         ? InstanceType<O['ctor']>
         : DynDerivedReducer<D, K, T>;

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
   get(name: string): DynDerivedReducer<D, K, T>;
}

/**
 * Provides the public API for accessing the index API.
 *
 * This class forms the public API which is accessible from the `.index` getter in the main reducer implementation.
 * ```
 * const dynArray = new DynArrayReducer([...]);
 * dynArray.index.active;
 * dynArray.index.hash;
 * dynArray.index.length;
 * dynArray.index.update(...);
 * ```
 */
export interface DynIndexerAPI<K, T>
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
