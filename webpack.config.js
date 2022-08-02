const path = require('path')
const webpack = require('webpack')

const MODE = "development";
//const MODE = "production";

const prod = MODE === 'production';

module.exports = {
	mode: MODE,
	context: path.resolve(__dirname, 'web/front/javascripts'),
    entry: {
		login: './login.js',
		home: './home.js',
		common: './common.js',
	},
    output: {
        path: path.resolve(__dirname, 'web/dist'),
        publicPath: '/manage/dist/',
        filename: '[name].js'
    },
    devtool: false,
	watchOptions: {
		ignored: [ 'node_modules', 'public', 'views', 'tests', 'temp', 'models', 'migrations', 'dist', 'config', 'routes' ]
	},
	module: {
        rules: [
			{
				test: /\.svelte$/,
				use: {
					loader: 'svelte-loader',
					options: {
						compilerOptions: {
							dev: !prod
						},
						emitCss: prod,
						hotReload: !prod
					}
				}
			},
			{
				test: /\.css/,
				use: [
					'style-loader',
					'css-loader'
				]
			},
			{	//	https://stackoverflow.com/questions/68468150/webpack-custom-font-loading-resulted-ots-parsing-error-invalid-sfntversion
				test: /\.woff(2)?(\?v=[0-9]\.[0-9])?$/,
				type: 'asset/resource',
    			dependency: { not: ['url'] }
			},
            {
				test: /\.svg(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [
                  {loader: 'file-loader'},
                  {
                    loader: 'svgo-loader',
                    /*options: {
                      plugins: [
                        {removeXMLNS: true},
                        {removeOffCanvasPaths: true},
                        {removeDimensions: true},
                        {reusePaths: true}
                      ]
                    }*/
                  }
				]
			},
			{
                test: /\.(ttf|eot|gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: [{
                    loader: 'file-loader',
                }]
            }
		]
    },
	resolve: {
		alias: {
			path: "path-browserify",
		},
		modules: [
			'node_modules',
			'web/front/javascripts',
			'libs'
		],
	}
}
