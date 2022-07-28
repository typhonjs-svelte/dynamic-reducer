import alias               from '@rollup/plugin-alias';
import { generateTSDef }   from '@typhonjs-build-test/esm-d-ts';

// Generate TS Definition.
await generateTSDef({
   main: './src/index.js',
   output: './types/index.d.ts',
   prependGen: ['./src/typedefs.js']
});

// Produce sourcemaps or not.
const s_SOURCEMAP = true;

export default () =>
{
   return [{   // This bundle is for the Node distribution.
         input: ['src/index.js'],
         output: [{
            file: `./dist/index.js`,
            format: 'es',
            preferConst: true,
            sourcemap: s_SOURCEMAP,
         }],
         plugins: [
            alias({
               entries: [
                  { find: '#common', replacement: './src/common/index.js' }
               ]
            })
         ]
      }
   ];
};
