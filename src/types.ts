import type {
    AdapterFilters,
    AdapterSort,
    DerivedAPI,
    IndexerAPI }    from './common/index.js';

/**
 * Defines the shape of derived reducers constructor functions.
 */
export interface IDerivedReducerCtor<T>
{
   new (hostData: DataHost<any>, parentIndex: IndexerAPI<any, T>, options: object): IDerivedReducer<any, any, T>;
}

/**
 * Defines the interface for all derived reducers.
 */
export interface IDerivedReducer<D, K, T>
{
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
    get derived(): DerivedAPI<D, K, T>

    /**
     * @returns The filters adapter.
     */
    get filters(): AdapterFilters<T>;

    /**
     * @returns Returns the Indexer public API.
     */
    get index(): IndexerAPI<K, T>;

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
    get sort(): AdapterSort<T>;

    /**
     * Sets reversed state and notifies subscribers.
     *
     * @param reversed - New reversed state.
     */
    set reversed(reversed: boolean);

    /**
     * Subscribe to this IDerivedReducer.
     *
     * @param handler - Callback function that is invoked on update / changes. Receives derived reducer reference.
     *
     * @returns Unsubscribe function.
     */
    subscribe(handler: (value: IDerivedReducer<D, K, T>) => void): () => void;
}

/**
 * The main options object for DynArrayReducer.
 */
export type DataDynArray<T> = {
    /**
     * Initial data iterable list.
     */
    data?: Iterable<T>;

    /**
     * Iterable list of filters.
     */
    filters?: Iterable<FilterFn<T> | DataFilter<T>>;

    /**
     * Compare function.
     */
    sort?: CompareFn<T> | DataSort<T>;
};

/**
 * The main options object for DynMapReducer.
 */
export type DataDynMap<K, T> = {
    /**
     * Optional initial backing Map.
     */
    data?: Map<K, T>;

    /**
     * Iterable list of filters.
     */
    filters?: Iterable<FilterFn<T> | DataFilter<T>>;

    /**
     * Compare function.
     */
    sort?: CompareFn<T> | DataSort<T>;
};

/**
 * Defines the data object to configure a filter w/ additional configuration options.
 */
export type DataFilter<T> = {
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
     * @param handler - Callback function that is invoked on update / changes.
     */
    subscribe?: (handler: (value: any) => void) => () => void;
};

/**
 * Provides a compound type for the backing data structure stored in reducers.
 */
export type DataHost<D> = (D | null)[];

/**
 * Defines the data object storing index data in AdapterIndexer.
 */
export type DataIndexer<K, T> = {
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

/**
 * Defines an object to configure sort functionality.
 */
export type DataSort<T> = {
    /**
     * - A callback function that compares two values.
     */
    compare: CompareFn<T>;

    /**
     * Optional subscribe function following the Svelte store / subscribe pattern.
     *
     * @param handler - Callback function that is invoked on update / changes.
     */
    subscribe?: (handler: (value: any) => void) => () => void;
};

/**
 * A callback function that compares two values. Return > 0 to sort b before a; < 0 to sort a before b; or 0 to keep
 * original order of a & b.
 *
 * This function has an optional subscribe function that follows the Svelte store Subscriber pattern. If a subscribe
 * function is provided automatic updates to the reduced index is performed.
 */
export type CompareFn<T> = {
    /**
     * @param a - Element 'a' of backing data to sort.
     *
     * @param b - Element 'b' of backing data to sort.
     */
    (a: T, b: T): number;

    /**
     * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
     */
    subscribe?: (handler: (value: any) => void) => () => void;
};

/**
 * Filter function that takes an element argument and returns a truthy value to keep it.
 *
 * This function has an optional subscribe function that follows the Svelte store Subscriber pattern. If a subscribe
 * function is provided automatic updates to the reduced index is performed.
 */
export type FilterFn<T> = {
    /**
     * @param element - Element of backing data structure to filter.
     *
     * @returns Does the element pass the filter test.
     */
    (element: T): boolean;

    /**
     * @param handler - Callback function that is invoked on update / changes. Receives `this` reference.
     */
    subscribe?: (handler: (value: any) => void) => () => void;
};

/**
 * Defines object / options for creating a derived reducer.
 */
export type DataDerived<T> = {
    /**
     * - Name of derived reducer.
     */
    name?: string;

    /**
     * - A DerivedReducer constructor function / class.
     */
    ctor?: IDerivedReducerCtor<T>;
} & DataDerivedOptions<T>;

/**
 * Defines the additional options for filters and sort function for derived reducers.
 */
export type DataDerivedOptions<T> = {
    /**
     * Iterable list of filters.
     */
    filters?: Iterable<FilterFn<T> | DataFilter<T>>;

    /**
     * Compare function.
     */
    sort?: CompareFn<T> | DataSort<T>;
}

/**
 * Creates a compound type for all derived reducer 'create' option combinations.
 */
export type OptionsDerivedCreate<T> = string | IDerivedReducerCtor<T> | DataDerived<T>;
