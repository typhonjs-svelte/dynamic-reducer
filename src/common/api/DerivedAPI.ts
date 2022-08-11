import type { AdapterDerived }  from '../adapter/AdapterDerived.js';

import type {
    IDerivedReducer,
    OptionsDerivedCreate }      from '../../types/index.js';

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
    create: (options: OptionsDerivedCreate<T>) => IDerivedReducer<D, K, T>;

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
    get: (name: string) => IDerivedReducer<D, K, T>

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
