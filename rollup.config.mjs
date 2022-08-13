import alias               from '@rollup/plugin-alias';
import typescript          from '@rollup/plugin-typescript';
import dts                 from 'rollup-plugin-dts';

// Produce sourcemaps or not.
const s_SOURCEMAP = true;

export default () =>
{
   return [{   // This bundle is for the Node distribution.
         input: ['src/index.ts'],
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
            }),
            typescript()
         ]
      },

      {   // This bundle is for the Node distribution.
         input: ['src/index.ts'],
         output: [{
            file: `./types/index.d.ts`,
            format: 'es',
            sourcemap: false
         }],
         plugins: [
            alias({
               entries: [
                  { find: '#common', replacement: './src/common/index.js' }
               ]
            }),
            typescript({ sourceMap: false, inlineSources: false }),
            dts()
         ]
      }
   ];
};
