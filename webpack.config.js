/* eslint-disable @typescript-eslint/no-var-requires */

const Packer = require('@ekz/packer');

module.exports = Packer.webpack.createLibraryConfiguration('Formix', {
    entry: {
        index: './src/index.ts'
    },
    output: {
        path: 'lib',
        publicPath: '/'
    },
    externals: {
        react: 'react',
        immutable: 'immutable',
        '@ekz/option': '@ekz/option'
    }
});
