type DataDynArray<T> = {
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
type DataDynMap<K, T> = {
    /**
     * -
     */
    data?: Map<K, T>;
    /**
     * -
     */
    filters?: Iterable<FilterFn<T> | DataFilter<T>>;
    /**
     * -
     */
    sort?: CompareFn<T>;
};
type DataFilter<T> = {
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
type DataHost<D> = (D | null)[];
type DataIndexer<K, T> = {
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
     * - Any associated parent AdapterIndexer.
     */
    parent?: APIIndexer<K>;
};
type DataSort<T> = {
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
type CompareFn<T> = {
    (a: T, b: T): boolean;
    subscribe?: (handler: (value: any) => void) => () => void;
};
/**
 * -
 * Filter function that takes an element argument and returns a truthy value to keep it.
 *
 * This function has an optional subscribe function that follows the Svelte store Subscriber pattern. If a subscribe
 * function is provided automatic updates to the reduced index is performed.
 */
type FilterFn<T> = {
    (element: T): boolean;
    subscribe?: (handler: (value: any) => void) => () => void;
};
/**
 * -
 */
type DerivedReducerCtor<C> = new () => C;
type DataDerived<C, T> = {
    /**
     * -
     */
    name?: string;
    /**
     * -
     */
    ctor?: DerivedReducerCtor<C>;
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
type OptionsDerivedCreate<C, T> = string | DerivedReducerCtor<C> | DataDerived<C, T>;
type APIDerived<C, T> = {
    /**
     * -
     */
    create: (options: OptionsDerivedCreate<C, T>) => C;
    /**
     * -
     */
    delete: (name: string) => boolean;
    /**
     * -
     */
    get: (name: string) => C;
};
type APIImplIndexer = {
    /**
     * - Current hash value of the index.
     */
    hash: number | null;
    /**
     * - Returns whether the indexer is active (IE filter or sort function active).
     */
    isActive: boolean;
    /**
     * - Getter returning length of reduced / indexed elements.
     */
    length: number;
    /**
     * - Manually invoke an update of the index.
     */
    update: (force?: boolean) => void;
};
type APIIndexer<K> = APIImplIndexer & Iterable<K>;

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
 *
 * @template T
 */
declare class AdapterFilters<T> {
    /**
     * @param {Function} indexUpdate - update function for the indexer.
     *
     * @returns {[AdapterFilters<T>, {filters: DataFilter<T>[]}]} Returns this and internal storage for filter adapters.
     */
    constructor(indexUpdate: Function);
    /**
     * @returns {number} Returns the length of the
     */
    get length(): number;
    /**
     * @param {...(FilterFn<T>|DataFilter<T>)}   filters -
     */
    add(...filters: (FilterFn<T> | DataFilter<T>)[]): void;
    /**
     * Clears and removes all filters.
     */
    clear(): void;
    /**
     * @param {...(FilterFn<T>|DataFilter<T>)}   filters -
     */
    remove(...filters: (FilterFn<T> | DataFilter<T>)[]): void;
    /**
     * Remove filters by the provided callback. The callback takes 3 parameters: `id`, `filter`, and `weight`.
     * Any truthy value returned will remove that filter.
     *
     * @param {function(*, FilterFn<T>, number): boolean} callback - Callback function to evaluate each filter entry.
     */
    removeBy(callback: (arg0: any, arg1: FilterFn<T>, arg2: number) => boolean): void;
    /**
     * @param {*}  ids - Removes filters by ID.
     */
    removeById(...ids: any): void;
    /**
     * Provides an iterator for filters.
     *
     * @returns {Generator<DataFilter<T>, void, *> | void} Generator / iterator of filters.
     * @yields {DataFilter<T>}
     */
    [Symbol.iterator](): Generator<DataFilter<T>, void, any> | void;
    #private;
}

/**
 * @template T
 */
declare class AdapterSort<T> {
    /**
     * @param {Function} indexUpdate - Function to update indexer.
     *
     * @returns {[AdapterSort<T>, {compareFn: CompareFn<T>}]} This and the internal sort adapter data.
     */
    constructor(indexUpdate: Function);
    /**
     * @param {CompareFn<T>|DataSort<T>}  data -
     *
     * A callback function that compares two values. Return > 0 to sort b before a;
     * < 0 to sort a before b; or 0 to keep original order of a & b.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters
     */
    set(data: CompareFn<T> | DataSort<T>): void;
    reset(): void;
    #private;
}

/**
 * @template D, K, T
 */
declare class AdapterIndexer<D, K, T> {
    /**
     *
     * @param {DataHost<D>}       hostData -
     *
     * @param {Function}          hostUpdate -
     *
     * @param {APIIndexer<K>}     parentIndexer -
     *
     * @returns {[AdapterIndexer<T>, APIIndexer<K>]} Indexer instance and public API.
     */
    constructor(hostData: DataHost<D>, hostUpdate: Function, parentIndexer: APIIndexer<K>);
    /** @type {DataHost<D>} */
    hostData: DataHost<D>;
    /** @type {Function} */
    hostUpdate: Function;
    /** @type {DataIndexer<K, T>} */
    indexData: DataIndexer<K, T>;
    /**
     *
     * @param {boolean}  reversed -
     */
    set reversed(arg: boolean);
    /**
     * @returns {boolean}
     *
     * c8 ignore next
     */
    get reversed(): boolean;
    /**
     * Calculates a new hash value for the new index array if any. If the new index array is null then the hash value
     * is set to null. Set calculated new hash value to the index adapter hash value.
     *
     * After hash generation compare old and new hash values and perform an update if they are different. If they are
     * equal check for array equality between the old and new index array and perform an update if they are not equal.
     *
     * @param {number[]}    oldIndex - Old index array.
     *
     * @param {number|null} oldHash - Old index hash value.
     *
     * @param {boolean}     [force=false] - When true forces an update to subscribers.
     */
    calcHashUpdate(oldIndex: number[], oldHash: number | null, force?: boolean): void;
    /**
     * @returns {(a: K, b: K) => number}
     */
    createSortFn(): (a: K, b: K) => number;
    /**
     * Store associated filter and sort adapters that are constructed after the indexer.
     *
     * @param {{filters: FilterFn<T>[]}}   filtersAdapter - Associated AdapterFilters instance.
     *
     * @param {{compareFn: CompareFn<T>}}  sortAdapter - Associated AdapterSort instance.
     *
     * @param {AdapterDerived<*, T>}       derivedAdapter - Associated AdapterDerived instance.
     */
    initAdapters(filtersAdapter: {
        filters: FilterFn<T>[];
    }, sortAdapter: {
        compareFn: CompareFn<T>;
    }, derivedAdapter: AdapterDerived<any, T>): void;
    /** @type {{filters: FilterFn<T>[]}} */
    filtersAdapter: {
        filters: FilterFn<T>[];
    };
    /** @type {{compareFn: CompareFn<T>}} */
    sortAdapter: {
        compareFn: CompareFn<T>;
    };
    /** @type {AdapterDerived<*, T>} */
    derivedAdapter: AdapterDerived<any, T>;
    /** @type {(a: K, b: K) => number} */
    sortFn: (a: K, b: K) => number;
    /**
     * Returns whether the index is active.
     *
     * @returns {boolean} Index active.
     */
    isActive(): boolean;
}

/**
 * @template K, T
 *
 * @augments {AdapterIndexer<T[], K, T>}
 */
declare class Indexer<K, T> extends AdapterIndexer<T[], K, T> {
    constructor(hostData: DataHost<T[]>, hostUpdate: Function, parentIndexer: APIIndexer<K>);
    /**
     * Provides the custom filter / reduce step that is ~25-40% faster than implementing with `Array.reduce`.
     *
     * Note: Other loop unrolling techniques like Duff's Device gave a slight faster lower bound on large data sets,
     * but the maintenance factor is not worth the extra complication.
     *
     * @returns {number[]} New filtered index array.
     */
    reduceImpl(): number[];
    /**
     * Update the reducer indexes. If there are changes subscribers are notified. If data order is changed externally
     * pass in true to force an update to subscribers.
     *
     * @param {boolean}  [force=false] - When true forces an update to subscribers.
     */
    update(force?: boolean): void;
}

/**
 * @template T
 */
declare class DerivedArrayReducer<T> {
    /**
     *
     * @param {DataHost<T[]>}     array - Data host array.
     *
     * @param {Indexer<T>} parentIndex - Parent indexer.
     *
     * TODO: fix type
     *
     * @param {object}            options -
     */
    constructor(array: DataHost<T[]>, parentIndex: Indexer<T, any>, options: object);
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
    get index(): APIIndexer<number>;
    /**
     * Gets the main data / items length.
     *
     * @returns {number} Main data / items length.
     */
    get length(): number;
    /**
     * Sets reversed state and notifies subscribers.
     *
     * @param {boolean} reversed - New reversed state.
     */
    set reversed(arg: boolean);
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
     * Subscribe to this DerivedArrayReducer.
     *
     * @param {function(DerivedArrayReducer<T>): void} handler - Callback function that is invoked on update / changes.
     *                                                           Receives `this` reference.
     *
     * @returns {(function(): void)} Unsubscribe function.
     */
    subscribe(handler: (arg0: DerivedArrayReducer<T>) => void): (() => void);
    /**
     * Provides an iterator for data stored in DynArrayReducer.
     *
     * @returns {Generator<*, T, *>} Generator / iterator of all data.
     * @yields {T}
     */
    [Symbol.iterator](): Generator<any, T, any>;
    #private;
}

/**
 * Provides a managed array with non-destructive reducing / filtering / sorting capabilities with subscription /
 * Svelte store support.
 *
 * @template T
 */
declare class DynArrayReducer<T> {
    /**
     * Initializes DynArrayReducer. Any iterable is supported for initial data. Take note that if `data` is an array it
     * will be used as the host array and not copied. All non-array iterables otherwise create a new array / copy.
     *
     * @param {Iterable<T>|DataDynArray<T>}   [data] - Data iterable to store if array or copy otherwise.
     */
    constructor(data?: Iterable<T> | DataDynArray<T>);
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
     * @returns {APIDerived<DerivedArrayReducer<T>, T>}
     */
    get derived(): APIDerived<DerivedArrayReducer<T>, T>;
    /**
     * @returns {AdapterFilters<T>} The filters adapter.
     */
    get filters(): AdapterFilters<T>;
    /**
     * Returns the Indexer public API.
     *
     * @returns {APIIndexer<number>} Indexer API - is also iterable.
     */
    get index(): APIIndexer<number>;
    /**
     * Gets the main data / items length.
     *
     * @returns {number} Main data / items length.
     */
    get length(): number;
    /**
     * Sets reversed state and notifies subscribers.
     *
     * @param {boolean} reversed - New reversed state.
     */
    set reversed(arg: boolean);
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
     * Removes internal data and pushes new data. This does not destroy any initial array set to internal data unless
     * `replace` is set to true.
     *
     * @param {T[] | Iterable<T> | null} data - New data to set to internal data.
     *
     * @param {boolean} [replace=false] - New data to set to internal data.
     */
    setData(data: T[] | Iterable<T> | null, replace?: boolean): void;
    /**
     *
     * @param {(value: DynArrayReducer<T>) => void} handler - Callback function that is invoked on update / changes.
     *                                                       Receives `this` reference.
     *
     * @returns {() => void} Unsubscribe function.
     */
    subscribe(handler: (value: DynArrayReducer<T>) => void): () => void;
    /**
     * Provides an iterator for data stored in DynArrayReducer.
     *
     * @returns {Generator<*, T, *>} Generator / iterator of all data.
     * @yields {T}
     */
    [Symbol.iterator](): Generator<any, T, any>;
    #private;
}

export { DerivedArrayReducer, DynArrayReducer };
