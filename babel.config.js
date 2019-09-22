module.exports = {
  presets: [
    [
      '@babel/env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
  plugins: [['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }]],
};
