const HtmlWebPackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const path = require('path');

const deps = require("./package.json").dependencies;
const pathresolver = `promise new Promise(resolve => {
      const urlParams = new URLSearchParams(window.location.search)
	  console.log(resolve);
	  console.log(window.location.search);
	  console.log(window.location.href);
      const version = 'appname';
      // This part depends on how you plan on hosting and versioning your federated modules
      const remoteUrlWithVersion = 'http://localhost:9000/' + 'appname' + 'app/' + 'appname' + '-app.js'
      const script = document.createElement('script')
      script.src = remoteUrlWithVersion
      script.onload = () => {
        // the injected script has loaded and is available on window
        // we can now resolve this Promise
        const proxy = {
          get: (request) => window.appname.get(request),
          init: (...arg) => {
            try {
              return window.appname.init(...arg)
            } catch(e) {
              console.log('remote container already initialized')
            }
          }
        }
        resolve(proxy)
      }
      // inject this script with the src set to the versioned remoteEntry.js
      document.head.appendChild(script);
    })
    `;


module.exports = (_, argv) => ({
  output: {
    //publicPath: '/main/',
    //path: path.resolve(__dirname, 'dist', 'main'),
	filename: 'container-[name].bundle.js',
	chunkFilename: 'container-[name].chunk.bundle.js',	
	path: path.resolve(__dirname, 'dist'),
	clean: true,
  },

  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },

  devServer: {
    port: 9000,
	open: ['/'],
    historyApiFallback: true,
	//proxy: {
    //  '/productapp': 'http://localhost:9001',
	//  '/orderapp': 'http://localhost:9002',
	//  '/deliveryapp': 'http://localhost:9003',
    //},
	proxy : [
	  {
        context: ['/productapp'],
        target: 'http://localhost:9001',
      },
	  {
        context: ['/orderapp'],
        target: 'http://localhost:9002',
      },
	  {
        context: ['/deliveryapp'],
        target: 'http://localhost:9003',
      },
	  {
        context: ['/delivery'],
        target: 'http://localhost:9000/main/',
		pathRewrite: { '/delivery$': '' },
      },
	  {
        context: ['/orders'],
        target: 'http://localhost:9000/main/',
		pathRewrite: { '/orders$': '' },
      },
	  {
        context: ['/products'],
        target: 'http://localhost:9000/main/',
		pathRewrite: { '/products$': '' },
      },	  
	]
  },

  module: {
    rules: [
      {
        test: /\.m?js/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(css|s[ac]ss)$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: "main",
      filename: "remoteEntry.js",
      remotes: {
        "product": "product@http://localhost:9001/product-app.js",
		"order":"order@http://localhost:9002/order-app.js",
		"delivery": "delivery@http://localhost:9003/delivery-app.js"	
      },
      exposes: {},
      shared: {
        ...deps,
        react: {
          singleton: true,
          requiredVersion: deps.react,
        },
        "react-dom": {
          singleton: true,
          requiredVersion: deps["react-dom"],
        },
        "react-router-dom": {
          singleton: true,
          requiredVersion: deps["react-router-dom"],
        },
      },
    }),
    new HtmlWebPackPlugin({
      template: "./src/index.html",
    }),
  ],
});
