import Babel from 'rollup-plugin-babel';

export default [
  'index',
].map((name) => {
  return {
    input: `src/${name}.mjs`,
    output: {
      file: `./${name}.js`,
      format: 'umd',
      name: 'RelaksEventEmitter',
      exports: 'named',
    },
    plugins: [
      Babel({
        presets: [
          '@babel/env',
        ],
      }),
    ],
  };
});
