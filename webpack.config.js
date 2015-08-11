/*
 * Webpack configuration.
 * @author Frank Wood
 */

var Path = require('path');

module.exports = {
    // Modules to loaded on startup.
    // Last modules in the list is exported as specified in 'output'.
    entry: [
        './src/img/favicon.ico',        // file loader copies to the output path
        './src/img/OpenHalonLogo.png',  // file loader copies to the output path
        './src/index.html',             // file loader copies to the output path
        './src/js/index.jsx'            // entry point
    ],
    // Output directory and file name of the generated "entry point".
    output: {
        filename: 'bundle.js',
        path: './build'
    },
    module: {
        // Each loader can have these properties:
        //  test: A condition that must be met
        //  exclude: A condition that must not be me
        //  include: A condition that must be met
        //  loader: A string of "!" separated loaders
        //  loaders: An array of loaders as a string
        loaders: [
            // Match all .js|.jsx files -> .js
            // Performs the transpiling of jsx.
            // Only searches the included directories.
            {
                test: /\.(js|jsx)$/, loader: 'babel',
                include: [
                    Path.resolve(__dirname, 'src/js'),
                    // Needed by Grommet
                    Path.resolve(__dirname, 'node_modules/grommet/components'),
                    Path.resolve(__dirname, 'node_modules/grommet/mixins')
                ],
            },
            // Match all .woff (web open font format) files.
            // Needed by Grommet & FontAwesome
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file?name=[name].[ext]'
            },
            // Match all .otf (open type font) files.
            // Needed by Grommet & FontAwesome
            {
                test: /\.(otf|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file?name=[name].[ext]'
            },
            // Match all .scss files => .css.
            // Use expanded output style.
            // Allow .scss files to find @imports in original script's working
            //  direcotry under 'node_modules'.
            {
                test: /\.scss$/,
                loader: 'style!css!sass?outputStyle=expanded&' +
                    'includePaths[]=' +
                        (Path.resolve(__dirname, 'node_modules/grommet/node_modules')) + '&' +
                        (Path.resolve(__dirname, 'node_modules'))
            },
            // Match all .css files.
            {
                test: /\.css$/,
                loader: 'style!css?' +
                    'includePaths[]=' +
                        (Path.resolve(__dirname, 'node_modules/grommet/node_modules')) + '&' +
                        (Path.resolve(__dirname, 'node_modules'))
            },
            // Match all .json files.
            // Allows loading JSON as a require module (i.e. package.json).
            {
                test: /\.json$/,
                loader: 'json'
            },
            // Match all .html|.ico files
            // Copies files (as is) to the build directory.
            {
                test: /\.(html|ico|png)$/,
                loader:'file?name=[name].[ext]'
            },
            // Match all .js|.jsx files.
            // Performs eslint using .eslintrc configuration.
            // Only use the included directory.
            // Check this AFTER transpiling loaders!!!
            {
                test: /\.(js|jsx)$/,
                loader: 'eslint',
                include: [
                    Path.resolve(__dirname, "src/js")
                ]
            }
        ]
    },
    resolve: {
        // There are 3 types of resolving for 'require'
        //  absolute: require('/home/file')
        //  relative: relative to the directory of the resource file that
        //      contains the require (i.e. require('../src/file'))
        //  module: all search directories for maodules are gathered, this
        //      includes the following 'root' directories which are prepended
        //      to the directory list (note that 'modulesDirectories' is also
        //      available).
        root: [
            Path.resolve(__dirname, 'src/js/main'),
            Path.resolve(__dirname, 'src/js/utils'),
            Path.resolve(__dirname, 'src/js/actions'),
            Path.resolve(__dirname, 'src/js/components'),
            Path.resolve(__dirname, 'src/js/stores'),
            Path.resolve(__dirname, 'src/js/views'),
            Path.resolve(__dirname, 'node_modules'),
            Path.resolve(__dirname)
        ],
        // Extensions that can be dropped from require calls.
        // Webpack will append extensions and use the first existing file.
        // Allows the use of 'require(module)' instead of 'require(module.js').
        extensions: [ '', '.webpack.js', '.web.js', '.js', '.jsx', '.json' ]
    }
}
