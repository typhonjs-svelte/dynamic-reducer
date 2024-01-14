/**
 * Defines the additional options for filters and sort function.
 */
type DynDataOptions<T> = {
    /**
     * Iterable list of filters.
     */
    filters?: Iterable<DynFilterFn<T> | DynDataFilter<T>>;
    /**
     * Compare function.
     */
    sort?: DynCompareFn<T> | DynDataSort<T>;
};
/**
 * The main options object for DynArrayReducer.
 */
type DynArrayData<T> = {
    /**
     * Initial data iterable list.
     */
    data?: Iterable<T>;
} & DynDataOptions<T>;
/**
 * The main options object for DynMapReducer.
 */
type DynMapData<K, T> = {
    /**
     * Optional initial backing Map.
     */
    data?: Map<K, T>;
} & DynDataOptions<T>;
/**
 * Defines the data object to configure a filter w/ additional configuration options.
 */
type DynDataFilter<T> = {
    /**
     * An optional ID associated with this filter. Can be used to remove the filter.
     */
    id?: any;
    /**
     * Filter function that takes a value argument and returns a truthy value to keep it.
     */
    filter: DynFilterFn<T>;
    /**
     * An optional number between 0 and 1 inclusive to position this filter against others.
     */
    weight?: number;
    /**
     * Optional subscribe function following the Svelte store / subscribe pattern.
     *
     * @param handler - Callback function that is invoked on update / changes.
     */
    subscribe?: (indexUpdate: DynIndexerUpdateFn) => () => void;
};
/**
 * Provides a compound type for the backing data structure stored in reducers.
 */
type DynDataHost<D> = (D | null)[];
/**
 * Updates associated dynamic reducer indexer.
 *
 * @param [force] - Force an update the index regardless of hash calculations.
 */
type DynIndexerUpdateFn = (force?: boolean) => void;
/**
 * Defines an object to configure sort functionality.
 */
type DynDataSort<T> = {
    /**
     * - A callback function that compares two values.
     */
    compare: DynCompareFn<T>;
    /**
     * Optional subscribe function following the Svelte store / subscribe pattern.
     *
     * @param handler - Callback function that is invoked on update / changes.
     */
    subscribe?: (indexUpdate: DynIndexerUpdateFn) => () => void;
};
/**
 * A callback function that compares two values. Return > 0 to sort 'b' before 'a'; < 0 to sort 'a' before 'b'; or 0 to
 * keep original order of 'a' & 'b'.
 *
 * This function has an optional subscribe function that follows the Svelte store Subscriber pattern. If a subscribe
 * function is provided automatic updates to the reduced index is performed.
 */
type DynCompareFn<T> = {
    /**
     * @param a - Element 'a' of backing data to sort.
     *
     * @param b - Element 'b' of backing data to sort.
     */
    (a: T, b: T): number;
    /**
     * Optional subscribe function following the Svelte store / subscribe pattern.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives `index update` function.
     */
    subscribe?: (indexUpdate: DynIndexerUpdateFn) => () => void;
};
/**
 * Filter function that takes an element argument and returns a truthy value to keep it.
 *
 * This function has an optional subscribe function that follows the Svelte store Subscriber pattern. If a subscribe
 * function is provided automatic updates to the reduced index is performed.
 */
type DynFilterFn<T> = {
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
    subscribe?: (indexUpdate: DynIndexerUpdateFn) => () => void;
};
/**
 * Defines object / options for creating a derived reducer.
 */
type DynDataDerivedCreate<T> = {
    /**
     * - Name of derived reducer.
     */
    name?: string;
    /**
     * - A DerivedReducer constructor function / class.
     */
    ctor?: IDynDerivedReducerCtor<T>;
} & DynDataOptions<T>;
/**
 * Creates a compound type for all derived reducer 'create' option combinations.
 */
type DynOptionsDerivedCreate<T> = string | IDynDerivedReducerCtor<T> | DynDataDerivedCreate<T>;
/**
 * Defines object / options for creating a dynamic array reducer.
 */
type DynDataArrayCreate<T> = {
    /**
     * - Name of dynamic array reducer.
     */
    name?: string;
    /**
     * - A DynMapReducer constructor function / class.
     */
    ctor?: IDynArrayReducerCtor<T>;
} & DynDataOptions<T>;
type DynOptionsArrayCreate<T> = string | IDynArrayReducerCtor<T> | DynDataArrayCreate<T>;
/**
 * Defines object / options for creating a dynamic map reducer.
 */
type DynDataMapCreate<K, T> = {
    /**
     * - Name of dynamic map reducer.
     */
    name?: string;
    /**
     * - A DynMapReducer constructor function / class.
     */
    ctor?: IDynMapReducerCtor<K, T>;
} & DynDataOptions<T>;
type DynOptionsMapCreate<K, T> = string | IDynMapReducerCtor<K, T> | DynDataMapCreate<K, T>;

/**
 * Provides a managed Map with non-destructive reducing / filtering / sorting capabilities with subscription /
 * Svelte store support.
 *
 * @template K, T
 */
declare class DynMapReducer<K, T> {
    #private;
    /**
     * Initializes DynMapReducer. Any iterable is supported for initial data. Take note that if `data` is an array it
     * will be used as the host array and not copied. All non-array iterables otherwise create a new array / copy.
     *
     * @param [data] - Data iterable to store if array or copy otherwise.
     */
    constructor(data?: Map<K, T> | DynMapData<K, T>);
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * Note: When a map is set as data then that map is used as the internal data. If any changes are performed to the
     * data externally do invoke `update` via {@link DynMapReducer.index} with `true` to recalculate the  index and
     * notify all subscribers.
     *
     * @returns The internal data.
     */
    get data(): Map<K, T> | null;
    /**
     * @returns Derived public API.
     */
    get derived(): IDynDerivedAPI<Map<K, T>, K, T>;
    /**
     * @returns The filters adapter.
     */
    get filters(): IDynAdapterFilters<T>;
    /**
     * @returns Returns the Indexer public API.
     */
    get index(): IDynIndexerAPI<K, T>;
    /**
     * Returns whether this instance is destroyed.
     */
    get destroyed(): boolean;
    /**
     * Gets the main data / items length.
     *
     * @returns {number} Main data / items length.
     */
    get length(): number;
    /**
     * Gets current reversed state.
     *
     * @returns {boolean} Reversed state.
     */
    get reversed(): boolean;
    /**
     * @returns The sort adapter.
     */
    get sort(): IDynAdapterSort<T>;
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
     * Provides a callback for custom reducers to initialize any data / custom configuration. This allows
     * child classes to avoid implementing the constructor.
     *
     * @protected
     */
    initialize(): void;
    /**
     * Removes internal data and pushes new data. This does not destroy any initial array set to internal data unless
     * `replace` is set to true.
     *
     * @param data - New data to set to internal data.
     *
     * @param replace=false - New data to set to internal data.
     */
    setData(data: Map<K, T> | null, replace?: boolean): void;
    /**
     * Add a subscriber to this DynMapReducer instance.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler: (value: DynMapReducer<K, T>) => void): () => void;
    /**
     * Provides an iterator for data stored in DynMapReducer.
     *
     * @returns {IterableIterator<T>}
     * @yields {T}
     */
    [Symbol.iterator](): IterableIterator<T>;
}

/**
 * Provides the base implementation derived reducer for Maps / DynMapReducer.
 *
 * Note: That you should never directly create an instance of a derived reducer, but instead use the
 * {@link DynMapReducerDerived.initialize} callback to set up any initial state in a custom derived reducer.
 *
 * @template K, T
 */
declare class DynMapReducerDerived<K, T> implements IDynDerivedReducer<Map<K, T>, K, T> {
    #private;
    /**
     * @param {DynDataHost<Map<K, T>>}  map - Data host Map.
     *
     * @param {IDynIndexerAPI<K, T>}    parentIndex - Parent indexer.
     *
     * @param {DynDataOptions<T>}       options - Any filters and sort functions to apply.
     */
    constructor(map: DynDataHost<Map<K, T>>, parentIndex: IDynIndexerAPI<K, T>, options: DynDataOptions<T>);
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * Note: The returned map is the same map set by the main reducer. If any changes are performed to the data
     * externally do invoke {@link IndexerAPI.update} with `true` to recalculate the index and notify all subscribers.
     *
     * @returns The internal data.
     */
    get data(): Map<K, T> | null;
    /**
     * @returns Derived public API.
     */
    get derived(): IDynDerivedAPI<Map<K, T>, K, T>;
    /**
     * @returns The filters adapter.
     */
    get filters(): IDynAdapterFilters<T>;
    /**
     * Returns the Indexer public API.
     *
     * @returns Indexer API - is also iterable.
     */
    get index(): IDynIndexerAPI<K, T>;
    /**
     * Returns whether this derived reducer is destroyed.
     */
    get destroyed(): boolean;
    /**
     * @returns Main data / items length or indexed length.
     */
    get length(): number;
    /**
     * @returns Gets current reversed state.
     */
    get reversed(): boolean;
    /**
     * @returns The sort adapter.
     */
    get sort(): IDynAdapterSort<T>;
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
     * Provides a callback for custom derived reducers to initialize any data / custom configuration. This allows
     * child classes to avoid implementing the constructor.
     *
     * @protected
     */
    initialize(): void;
    /**
     * Provides an iterator for data stored in DerivedMapReducer.
     *
     * @returns {IterableIterator<T>}
     * @yields {T}
     */
    [Symbol.iterator](): IterableIterator<T>;
    /**
     * Subscribe to this DerivedMapReducer.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler: (value: DynMapReducerDerived<K, T>) => void): () => void;
}

/**
 * Defines the shape of a dynamic array constructor function.
 */
interface IDynArrayReducerCtor<T> {
    new (data?: Iterable<T> | DynArrayData<T>): DynArrayReducer<T>;
}
/**
 * Defines the shape of a dynamic map constructor function.
 */
interface IDynMapReducerCtor<K, T> {
    new (data?: Map<K, T> | DynMapData<K, T>): DynMapReducer<K, T>;
}
/**
 * Defines the shape of a derived reducer constructor function.
 */
interface IDynDerivedReducerCtor<T> {
    new (hostData: DynDataHost<any>, parentIndex: IDynIndexerAPI<any, T>, options: DynDataOptions<T>): IDynDerivedReducer<any, any, T>;
}
/**
 * Defines the interface for a derived reducer.
 */
interface IDynDerivedReducer<D, K, T> {
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * Note: if an array is set as initial data then that array is used as the internal data. If any changes are
     * performed to the data externally do invoke {@link index.update} with `true` to recalculate the index and notify
     * all subscribers.
     *
     * @returns The internal data.
     */
    get data(): D | null;
    /**
     * @returns Derived public API.
     */
    get derived(): IDynDerivedAPI<D, K, T>;
    /**
     * @returns The filters adapter.
     */
    get filters(): IDynAdapterFilters<T>;
    /**
     * @returns Returns the Indexer public API.
     */
    get index(): IDynIndexerAPI<K, T>;
    /**
     * Returns whether this derived reducer is destroyed.
     */
    get destroyed(): boolean;
    /**
     * @returns Main data / items length or indexed length.
     */
    get length(): number;
    /**
     * @returns Gets current reversed state.
     */
    get reversed(): boolean;
    /**
     * @returns The sort adapter.
     */
    get sort(): IDynAdapterSort<T>;
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
     * Subscribe to this IDerivedReducer.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives derived reducer reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler: (value: IDynDerivedReducer<D, K, T>) => void): () => void;
}

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
 *
 * @template T
 */
interface IDynAdapterFilters<T> {
    /**
     * @returns Returns the length of the filter data.
     */
    get length(): number;
    /**
     * Provides an iterator for filters.
     *
     * @returns {IterableIterator<DynDataFilter<T>>}
     * @yields {DynDataFilter<T>}
     */
    [Symbol.iterator](): IterableIterator<DynDataFilter<T>> | void;
    /**
     * @param filters -
     */
    add(...filters: (DynFilterFn<T> | DynDataFilter<T>)[]): void;
    /**
     * Clears and removes all filters.
     */
    clear(): void;
    /**
     * @param filters -
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
 *
 * @template T
 */
interface IDynAdapterSort<T> {
    /**
     * Clears & removes any assigned sort function and triggers an index update.
     */
    clear(): void;
    /**
     * @param {DynCompareFn<T>|DynDataSort<T>} sort - A callback function that compares two values. Return > 0 to sort b
     * before a; < 0 to sort a before b; or 0 to keep original order of a & b.
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
 *
 * @template D, K, T
 */
interface IDynDerivedAPI<D, K, T> {
    /**
     * Removes all derived reducers and associated subscriptions.
     */
    clear(): void;
    /**
     * @param options - Options for creating a reducer.
     *
     * @returns Newly created derived reducer.
     */
    create(options: DynOptionsDerivedCreate<T>): IDynDerivedReducer<D, K, T>;
    /**
     * Deletes and destroys a derived reducer.
     *
     * @param name - Name of the derived reducer
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
     */
    get(name: string): IDynDerivedReducer<D, K, T>;
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
 *
 * @template K, T
 */
interface IDynIndexerAPI<K, T> {
    get active(): boolean;
    get length(): number;
    /**
     * Manually invoke an update of the index.
     *
     * @param force - Force update to any subscribers.
     */
    update(force?: boolean): void;
    /**
     * - Current hash value of the index.
     */
    get hash(): number | null;
    /**
     * Provides an iterator over the index array.
     *
     * @returns {IterableIterator<K>}
     * @yields {K}
     */
    [Symbol.iterator](): IterableIterator<K>;
}

/**
 * Provides a managed array with non-destructive reducing / filtering / sorting capabilities with subscription /
 * Svelte store support.
 *
 * @template T
 */
declare class DynArrayReducer<T> {
    #private;
    /**
     * Initializes DynArrayReducer. Any iterable is supported for initial data. Take note that if `data` is an array it
     * will be used as the host array and not copied. All non-array iterables otherwise create a new array / copy.
     *
     * @param [data] - Data iterable to store if array or copy otherwise.
     */
    constructor(data?: Iterable<T> | DynArrayData<T>);
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * Note: if an array is set as initial data then that array is used as the internal data. If any changes are
     * performed to the data externally do invoke `update` via {@link DynArrayReducer.index} with `true` to recalculate
     * the index and notify all subscribers.
     *
     * @returns The internal data.
     */
    get data(): T[] | null;
    /**
     * @returns Derived public API.
     */
    get derived(): IDynDerivedAPI<T[], number, T>;
    /**
     * @returns The filters adapter.
     */
    get filters(): IDynAdapterFilters<T>;
    /**
     * @returns Returns the Indexer public API.
     */
    get index(): IDynIndexerAPI<number, T>;
    /**
     * Returns whether this instance is destroyed.
     */
    get destroyed(): boolean;
    /**
     * Gets the main data / items length.
     *
     * @returns {number} Main data / items length.
     */
    get length(): number;
    /**
     * Gets current reversed state.
     *
     * @returns {boolean} Reversed state.
     */
    get reversed(): boolean;
    /**
     * @returns The sort adapter.
     */
    get sort(): IDynAdapterSort<T>;
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
     * Provides a callback for custom reducers to initialize any data / custom configuration. This allows
     * child classes to avoid implementing the constructor.
     *
     * @protected
     */
    initialize(): void;
    /**
     * Removes internal data and pushes new data. This does not destroy any initial array set to internal data unless
     * `replace` is set to true.
     *
     * @param data - New data to set to internal data.
     *
     * @param replace=false - New data to set to internal data.
     */
    setData(data: T[] | Iterable<T> | null, replace?: boolean): void;
    /**
     * Add a subscriber to this DynArrayReducer instance.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler: (value: DynArrayReducer<T>) => void): () => void;
    /**
     * Provides an iterator for data stored in DynArrayReducer.
     *
     * @yields {T}
     */
    [Symbol.iterator](): IterableIterator<T>;
}

/**
 * Provides the base implementation derived reducer for arrays / DynArrayReducer.
 *
 * Note: That you should never directly create an instance of a derived reducer, but instead use the
 * {@link DynArrayReducerDerived.initialize} callback to set up any initial state in a custom derived reducer.
 *
 * @template T
 */
declare class DynArrayReducerDerived<T> implements IDynDerivedReducer<T[], number, T> {
    #private;
    /**
     * @param {DynDataHost<T[]>}           array - Data host array.
     *
     * @param {IDynIndexerAPI<number, T>}  parentIndex - Parent indexer.
     *
     * @param {DynDataOptions<T>}          options - Any filters and sort functions to apply.
     */
    constructor(array: DynDataHost<T[]>, parentIndex: IDynIndexerAPI<number, T>, options: DynDataOptions<T>);
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * Note: if an array is set as initial data then that array is used as the internal data. If any changes are
     * performed to the data externally do invoke {@link IndexerAPI.update} with `true` to recalculate the index and
     * notify all subscribers.
     *
     * @returns The internal data.
     */
    get data(): T[] | null;
    /**
     * @returns Derived public API.
     */
    get derived(): IDynDerivedAPI<T[], number, T>;
    /**
     * @returns The filters adapter.
     */
    get filters(): IDynAdapterFilters<T>;
    /**
     * Returns the Indexer public API.
     *
     * @returns Indexer API - is also iterable.
     */
    get index(): IDynIndexerAPI<number, T>;
    /**
     * Returns whether this derived reducer is destroyed.
     */
    get destroyed(): boolean;
    /**
     * @returns Main data / items length or indexed length.
     */
    get length(): number;
    /**
     * @returns Gets current reversed state.
     */
    get reversed(): boolean;
    /**
     * @returns The sort adapter.
     */
    get sort(): IDynAdapterSort<T>;
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
     * Provides a callback for custom derived reducers to initialize any data / custom configuration. This allows
     * child classes to avoid implementing the constructor.
     *
     * @protected
     */
    initialize(): void;
    /**
     * Provides an iterator for data stored in DerivedArrayReducer.
     *
     * @returns {IterableIterator<T>}
     * @yields {T}
     */
    [Symbol.iterator](): IterableIterator<T>;
    /**
     * Subscribe to this DerivedArrayReducer.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler: (value: DynArrayReducerDerived<T>) => void): () => void;
}

export { type DynArrayData, DynArrayReducer, DynArrayReducerDerived, type DynCompareFn, type DynDataArrayCreate, type DynDataDerivedCreate, type DynDataFilter, type DynDataHost, type DynDataMapCreate, type DynDataOptions, type DynDataSort, type DynFilterFn, type DynIndexerUpdateFn, type DynMapData, DynMapReducer, DynMapReducerDerived, type DynOptionsArrayCreate, type DynOptionsDerivedCreate, type DynOptionsMapCreate, type IDynAdapterFilters, type IDynAdapterSort, type IDynArrayReducerCtor, type IDynDerivedAPI, type IDynDerivedReducer, type IDynDerivedReducerCtor, type IDynIndexerAPI, type IDynMapReducerCtor };
