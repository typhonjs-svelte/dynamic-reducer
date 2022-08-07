interface IDerivedReducerCtor {
    new (hostData: DataHost<any>, parentIndex: IndexerAPI<any, any>, options: object): IDerivedReducer;
}
interface IDerivedReducer {
    /**
     * @returns Returns the Indexer public API.
     */
    get index(): IndexerAPI<any, any>;
}
declare type DataDynArray<T> = {
    /**
     * -
     */
    data?: Iterable<T>;
    /**
     * -
     */
    filters?: Iterable<FilterFn<T> | DataFilter<T>>;
    /**
     * -
     */
    sort?: CompareFn<T>;
};
declare type DataFilter<T> = {
    /**
     * - An ID associated with this filter. Can be used to remove the filter.
     */
    id?: any;
    /**
     * - Filter function that takes a value argument and returns a truthy value to
     *   keep it.
     */
    filter: FilterFn<T>;
    /**
     * - A number between 0 and 1 inclusive to position this filter against others.
     */
    weight?: number;
    /**
     * - Optional subscribe function following the Svelte store / subscribe pattern.
     */
    subscribe?: Function;
};
declare type DataHost<D> = (D | null)[];
declare type DataIndexer<K, T> = {
    /**
     * - The index array.
     */
    index: K[] | null;
    /**
     * - Hashcode for current index content.
     */
    hash: number | null;
    /**
     * - Is iteration reversed?
     */
    reversed: boolean;
    /**
     * - Any associated parent index data.
     */
    parent?: IndexerAPI<K, T>;
};
declare type DataSort<T> = {
    /**
     * - An ID associated with this filter. Can be used to remove the filter.
     */
    id?: any;
    /**
     * - A callback function that compares two values.
     */
    compare: CompareFn<T>;
    /**
     * - Optional subscribe function following the Svelte store / subscribe pattern.
     */
    subscribe?: Function;
};
/**
 * -
 * A callback function that compares two values. Return > 0 to sort b before a; < 0 to sort a before b; or 0 to keep
 * original order of a & b.
 *
 * This function has an optional subscribe function that follows the Svelte store Subscriber pattern. If a subscribe
 * function is provided automatic updates to the reduced index is performed.
 */
declare type CompareFn<T> = {
    (a: T, b: T): number;
    subscribe?: (handler: (value: any) => void) => () => void;
};
/**
 * -
 * Filter function that takes an element argument and returns a truthy value to keep it.
 *
 * This function has an optional subscribe function that follows the Svelte store Subscriber pattern. If a subscribe
 * function is provided automatic updates to the reduced index is performed.
 */
declare type FilterFn<T> = {
    (element: T): boolean;
    subscribe?: (handler: (value: any) => void) => () => void;
};
/**
 * -
 */
declare type DataDerived<T> = {
    /**
     * -
     */
    name?: string;
    /**
     * -
     */
    ctor?: IDerivedReducerCtor;
    /**
     * -
     */
    filters?: Iterable<FilterFn<T>>;
    /**
     * -
     */
    sort?: CompareFn<T>;
};
/**
 * -
 */
declare type OptionsDerivedCreate<T> = string | IDerivedReducerCtor | DataDerived<T>;

declare class IndexerAPI<K, T> {
    #private;
    /**
     * Provides a getter to determine if the index is active.
     */
    readonly isActive: boolean;
    /**
     * Manually invoke an update of the index.
     *
     * @param force - Force update to any subscribers.
     */
    readonly update: (force?: boolean) => void;
    constructor(adapterIndexer: AdapterIndexer<any, K, T>);
    /**
     * - Current hash value of the index.
     */
    get hash(): number | null;
    /**
     * @returns Returns length of reduced / indexed elements.
     */
    get length(): number;
    /**
     * Provides an iterator over the index array.
     *
     * @returns Iterator / generator
     * @yields {K}
     */
    [Symbol.iterator](): Generator<K, K, K>;
}

/**
 * Provides the `derived` API for all dynamic reducers.
 */
declare class AdapterDerived<D, K, T> {
    #private;
    /**
     * @param hostData -
     *
     * @param parentIndex -
     *
     * @param DerivedReducerCtor -
     */
    constructor(hostData: DataHost<D>, parentIndex: IndexerAPI<K, T>, DerivedReducerCtor: IDerivedReducerCtor);
    /**
     * @param options -
     *
     * @returns Newly created derived reducer.
     */
    create(options: OptionsDerivedCreate<T>): IDerivedReducer;
    /**
     * Deletes and destroys a derived reducer.
     *
     * @param name - Name of the derived reducer.
     */
    delete(name: string): boolean;
    /**
     * Returns an existing derived reducer.
     *
     * @param name - Name of derived reducer.
     */
    get(name: string): IDerivedReducer;
    update(force?: boolean): void;
}

/**
 * Provides the storage and sequencing of managed filters. Each filter added may be a bespoke function or a
 * {@link DataFilter} object containing an `id`, `filter`, and `weight` attributes; `filter` is the only required
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
 * This class forms the public API which is accessible from the `.filters` getter in the main DynArrayReducer instance.
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

declare class AdapterFilters<T> {
    #private;
    /**
     * @param indexUpdate - update function for the indexer.
     *
     * @param filtersAdapter - Stores the filter function data.
     */
    constructor(indexUpdate: any, filtersAdapter: {
        filters: DataFilter<T>[];
    });
    /**
     * @returns Returns the length of the filter data.
     */
    get length(): number;
    /**
     * Provides an iterator for filters.
     *
     * @returns Generator / iterator of filters.
     * @yields {DataFilter<T>}
     */
    [Symbol.iterator](): Generator<DataFilter<T>, DataFilter<T>, DataFilter<T>> | void;
    /**
     * @param filters -
     */
    add(...filters: (FilterFn<T> | DataFilter<T>)[]): void;
    /**
     * Clears and removes all filters.
     */
    clear(): void;
    /**
     * @param filters -
     */
    remove(...filters: (FilterFn<T> | DataFilter<T>)[]): void;
    /**
     * Remove filters by the provided callback. The callback takes 3 parameters: `id`, `filter`, and `weight`.
     * Any truthy value returned will remove that filter.
     *
     * @param callback - Callback function to evaluate each filter entry.
     */
    removeBy(callback: (id: any, filter: FilterFn<T>, weight: number) => boolean): void;
    /**
     * @param ids - Removes filters by ID.
     */
    removeById(...ids: any[]): void;
}

/**
 */
declare abstract class AdapterIndexer<D, K, T> {
    derivedAdapter: AdapterDerived<D, K, T>;
    filtersAdapter: {
        filters: DataFilter<T>[];
    };
    hostData: DataHost<D>;
    hostUpdate: Function;
    indexData: DataIndexer<K, T>;
    sortAdapter: {
        compareFn: CompareFn<T>;
    };
    sortFn: (a: K, b: K) => number;
    /**
     *
     * @param hostData -
     *
     * @param hostUpdate -
     *
     * @param [parentIndexer] -
     *
     * @returns Indexer instance and public API.
     */
    constructor(hostData: DataHost<D>, hostUpdate: Function, parentIndexer?: IndexerAPI<K, T>);
    /**
     * @returns Returns whether the index is active.
     */
    get isActive(): boolean;
    /**
     * @returns Returns length of reduced index.
     */
    get length(): number;
    /**
     * @returns Returns reversed state.
     */
    get reversed(): boolean;
    /**
     * @param reversed -
     */
    set reversed(reversed: boolean);
    /**
     * Calculates a new hash value for the new index array if any. If the new index array is null then the hash value
     * is set to null. Set calculated new hash value to the index adapter hash value.
     *
     * After hash generation compare old and new hash values and perform an update if they are different. If they are
     * equal check for array equality between the old and new index array and perform an update if they are not equal.
     *
     * @param oldIndex - Old index array.
     *
     * @param oldHash - Old index hash value.
     *
     * @param [force=false] - When true forces an update to subscribers.
     */
    calcHashUpdate(oldIndex: number[], oldHash: number | null, force?: boolean): void;
    /**
     * @returns Sort function adapting host data.
     */
    abstract createSortFn(): (a: K, b: K) => number;
    /**
     * Store associated filter and sort adapters that are constructed after the indexer.
     *
     * @param filtersAdapter - Associated AdapterFilters instance.
     *
     * @param sortAdapter - Associated AdapterSort instance.
     *
     * @param derivedAdapter - Associated AdapterDerived instance.
     */
    initAdapters(filtersAdapter: {
        filters: DataFilter<T>[];
    }, sortAdapter: {
        compareFn: CompareFn<T>;
    }, derivedAdapter: any): void;
    abstract update(force: boolean): void;
}

declare class AdapterSort<T> {
    #private;
    /**
     * @param indexUpdate - Function to update indexer.
     *
     * @param sortAdapter - Storage for compare function.
     */
    constructor(indexUpdate: Function, sortAdapter: {
        compareFn: CompareFn<T>;
    });
    /**
     * @param data - A callback function that compares two values. Return > 0 to sort b before a;
     * < 0 to sort a before b; or 0 to keep original order of a & b.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters
     */
    set(data: CompareFn<T> | DataSort<T>): void;
    reset(): void;
}

declare class DerivedAPI<K, T> {
    /**
     * @param options -
     *
     * @returns Newly created derived reducer.
     */
    create: (options: OptionsDerivedCreate<T>) => IDerivedReducer;
    /**
     * Deletes and destroys a derived reducer.
     *
     * @param name - Name of the derived reducer
     */
    delete: (name: string) => boolean;
    /**
     * Returns an existing derived reducer.
     *
     * @param name - Name of derived reducer.
     */
    get: (name: string) => IDerivedReducer;
    constructor(adapterDerived: AdapterDerived<any, K, T>);
}

/**
 * Provides a managed array with non-destructive reducing / filtering / sorting capabilities with subscription /
 * Svelte store support.
 */
declare class DynArrayReducer<T> {
    #private;
    /**
     * Initializes DynArrayReducer. Any iterable is supported for initial data. Take note that if `data` is an array it
     * will be used as the host array and not copied. All non-array iterables otherwise create a new array / copy.
     *
     * @param [data] - Data iterable to store if array or copy otherwise.
     */
    constructor(data?: Iterable<T> | DataDynArray<T>);
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * Note: if an array is set as initial data then that array is used as the internal data. If any changes are
     * performed to the data externally do invoke {@link AdapterIndexer.index.update} with `true` to recalculate the
     * index and notify all subscribers.
     *
     * @returns The internal data.
     */
    get data(): T[] | null;
    /**
     * @returns Derived public API.
     */
    get derived(): DerivedAPI<number, T>;
    /**
     * @returns The filters adapter.
     */
    get filters(): AdapterFilters<T>;
    /**
     * @returns Returns the Indexer public API.
     */
    get index(): IndexerAPI<number, T>;
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
    get sort(): AdapterSort<T>;
    /**
     * Sets reversed state and notifies subscribers.
     *
     * @param reversed - New reversed state.
     */
    set reversed(reversed: boolean);
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
     *
     * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler: (value: DynArrayReducer<T>) => void): () => void;
    /**
     * Provides an iterator for data stored in DynArrayReducer.
     *
     * @returns Generator / iterator of all data.
     * @yields {T}
     */
    [Symbol.iterator](): Generator<T, T, T>;
}

/**
 * @template T
 */
declare class DerivedArrayReducer<T> implements IDerivedReducer {
    #private;
    /**
     *
     * @param array - Data host array.
     *
     * @param parentIndex - Parent indexer.
     *
     * TODO: fix type
     *
     * @param options -
     */
    constructor(array: DataHost<T[]>, parentIndex: IndexerAPI<number, T>, options: object);
    /**
     * Returns the internal data of this instance. Be careful!
     *
     * Note: if an array is set as initial data then that array is used as the internal data. If any changes are
     * performed to the data externally do invoke {@link index.update} with `true` to recalculate the index and notify
     * all subscribers.
     *
     * @returns {T[]|null} The internal data.
     */
    get data(): T[];
    /**
     * @returns {AdapterFilters<T>} The filters adapter.
     */
    get filters(): AdapterFilters<T>;
    /**
     * Returns the Indexer public API.
     *
     * @returns {APIIndexer<number>} Indexer API - is also iterable.
     */
    get index(): IndexerAPI<number, T>;
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
     * @returns {AdapterSort<T>} The sort adapter.
     */
    get sort(): AdapterSort<T>;
    /**
     * Sets reversed state and notifies subscribers.
     *
     * @param {boolean} reversed - New reversed state.
     */
    set reversed(reversed: boolean);
    /**
     * Provides an iterator for data stored in DynArrayReducer.
     *
     * @returns {Generator<*, T, *>} Generator / iterator of all data.
     * @yields {T}
     */
    [Symbol.iterator](): Generator<T, void, unknown>;
    /**
     * Subscribe to this DerivedArrayReducer.
     *
     * @param {function(DerivedArrayReducer<T>): void} handler - Callback function that is invoked on update / changes.
     *                                                           Receives `this` reference.
     *
     * @returns {(function(): void)} Unsubscribe function.
     */
    subscribe(handler: any): () => void;
}

export { DerivedArrayReducer, DynArrayReducer };
