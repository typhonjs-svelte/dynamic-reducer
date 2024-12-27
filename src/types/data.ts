import type {
   DynIndexerAPI,
   DynDerivedReducerCtor,
   DynArrayReducerCtor,
   DynMapReducerCtor }  from './';

/**
 * Defines the additional options for filters and sort function.
 */
export type DynDataOptions<T> = {
   /**
    * Iterable list of filters.
    */
   filters?: Iterable<DynFilterFn<T> | DynDataFilter<T>>;

   /**
    * Compare function.
    */
   sort?: DynCompareFn<T> | DynDataSort<T>;
}

/**
 * The main options object for DynArrayReducer.
 */
export type DynArrayData<T> = {
   /**
    * Initial data iterable list.
    */
   data?: Iterable<T>;
} & DynDataOptions<T>;

/**
 * The main options object for DynMapReducer.
 */
export type DynMapData<K, T> = {
   /**
    * Optional initial backing Map.
    */
   data?: Map<K, T>;
} & DynDataOptions<T>;

/**
 * Defines the data object to configure a filter w/ additional configuration options.
 */
export type DynDataFilter<T> = {
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
export type DynDataHost<D> = (D | null)[];

/**
 * Defines the data object storing index data in AdapterIndexer.
 */
export type DynDataIndexer<K, T> = {
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
   parent?: DynIndexerAPI<K, T>;
};

/**
 * Updates associated dynamic reducer indexer.
 *
 * @param [force] - Force an update the index regardless of hash calculations.
 */
export type DynIndexerUpdateFn = (force?: boolean) => void;

/**
 * Defines an object to configure sort functionality.
 */
export type DynDataSort<T> = {
   /**
    * A callback function that compares two values.
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
export type DynCompareFn<T> = {
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
export type DynFilterFn<T> = {
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
export type DynDataDerivedCreate<T> = {
   /**
    * Name of derived reducer.
    */
   name?: string;

   /**
    * A DerivedReducer constructor function / class.
    */
   ctor?: DynDerivedReducerCtor<T>;

   /**
    * Extra data to pass through to `initialize`.
    */
   [key: string]: any;
} & DynDataOptions<T>;

/**
 * Creates a compound type for all derived reducer 'create' option combinations.
 */
export type DynOptionsDerivedCreate<T> = string | DynDerivedReducerCtor<T> | DynDataDerivedCreate<T>;

// -------------------------------------------------------------------------------------------------------------------

/**
 * Defines object / options for creating a dynamic array reducer.
 */
export type DynDataArrayCreate<T> = {
   /**
    * Name of dynamic array reducer.
    */
   name?: string;

   /**
    * A DynMapReducer constructor function / class.
    */
   ctor?: DynArrayReducerCtor<T>;
} & DynDataOptions<T>;

export type DynOptionsArrayCreate<T> = string | DynArrayReducerCtor<T> | DynDataArrayCreate<T>

// -------------------------------------------------------------------------------------------------------------------

/**
 * Defines object / options for creating a dynamic map reducer.
 */
export type DynDataMapCreate<K, T> = {
   /**
    * Name of dynamic map reducer.
    */
   name?: string;

   /**
    * A DynMapReducer constructor function / class.
    */
   ctor?: DynMapReducerCtor<K, T>;
} & DynDataOptions<T>;

export type DynOptionsMapCreate<K, T> = string | DynMapReducerCtor<K, T> | DynDataMapCreate<K, T>
