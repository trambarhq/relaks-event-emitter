const Babel = require('rollup-plugin-babel');

module.exports = [
  'index',
].map((name) => {
  return {
    input: `src/${name}.mjs`,
    output: {
      file: `./${name}.js`,
      format: 'umd',
      name: 'RelaksEventEmitter',
    },
    plugins: [
      Babel({
        presets: [
          '@babel/env',
        ],
        plugins: [
        ]
      }),
    ]
  };
});
