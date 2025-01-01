# Changelog
## Release 0.2.0 (major)
- Refined type declarations for precise usage.
- Derived reducers may now use private variables / methods when overriding `initialize`.
- Fixed edge case where the index for Map reducers with just a `sort` function did not recalculate the index when
  setting new data via `setData`.

## Release 0.1.2 (minor)
- Derived reducers via `derived.create()` when specifying a `DynDataDerivedCreate` object may now specify additional
options that are passed to the derived reducers `initialize` implementation.

- Removed leading `I` from all interfaces in type declarations.

## Release 0.1.1 (minor)
- Clarified JSDoc / types for improved documentation.

## Release 0.1.0
- Initial release

