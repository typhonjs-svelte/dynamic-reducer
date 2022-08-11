import TestsuiteRunner  from '@typhonjs-build-test/testsuite-runner';

import {
   ArrayAPIErrors,
   ArrayAPITests,
   ArrayDerivedTests }  from './tests/array/index.js';

// import {
//    MapAPIErrors,
//    MapAPITests,
// }                       from './tests/map/index.js';

export default new TestsuiteRunner(
{
   ArrayAPIErrors,
   ArrayAPITests,
   ArrayDerivedTests,

   // MapAPIErrors,
   // MapAPITests
   // MapPerfTest
});
