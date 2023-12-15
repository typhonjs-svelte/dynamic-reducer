import { TestsuiteRunner }  from '@typhonjs-build-test/testsuite-runner';

import {
   ArrayAPIErrors,
   ArrayAPITests,
   ArrayDerivedTests }  from './tests/array/index.js';

import {
   MapAPIErrors,
   MapAPITests,
   MapDerivedTests }    from './tests/map/index.js';

export default new TestsuiteRunner(
{
   ArrayAPIErrors,
   ArrayAPITests,
   ArrayDerivedTests,

   MapAPIErrors,
   MapAPITests,
   MapDerivedTests
});
