import type { AdapterDerived }  from '../adapter/AdapterDerived.js';

import type {
    IDynDerivedReducer,
    DynOptionsDerivedCreate }      from '../../types/index.js';

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
export class DerivedAPI<D, K, T>
{
    /**
     * Removes all derived reducers and associated subscriptions.
     */
    clear: () => void;

    /**
     * @param options - Options for creating a reducer.
     *
     * @returns Newly created derived reducer.
     */
    create: (options: DynOptionsDerivedCreate<T>) => IDynDerivedReducer<D, K, T>;

    /**
     * Deletes and destroys a derived reducer.
     *
     * @param name - Name of the derived reducer
     */
    delete: (name: string) => boolean;

    /**
     * Removes all derived reducers, associated subscriptions, and cleans up all resources.
     */
    destroy: () => void;

    /**
     * Returns an existing derived reducer.
     *
     * @param name - Name of derived reducer.
     */
    get: (name: string) => IDynDerivedReducer<D, K, T>

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
