# react-micro-frontend
React Micro Frontend using Wepback 5 + Monorepo + Turborepo + AEM Compliant

![microfrontend drawio(3)](https://github.com/kunalznk/react-micro-frontend/assets/50258809/dcae60c3-6ba2-4c8f-b168-6b883b0e8549)
![microfrontend drawio](https://github.com/kunalznk/react-micro-frontend/assets/50258809/e42582df-67fb-4573-aaea-382072e84328)

# Demo react-micro-frontend

![home](https://github.com/kunalznk/react-micro-frontend/assets/50258809/46b0ff0c-ef4f-4e74-ba2c-5a8422bf5aea)
![prodList](https://github.com/kunalznk/react-micro-frontend/assets/50258809/a7d0dcf6-d1a6-45ad-a91c-76c222661cd2)
![prod](https://github.com/kunalznk/react-micro-frontend/assets/50258809/aee7ae5c-ac57-410b-abae-625b65587ba6)
![checkout](https://github.com/kunalznk/react-micro-frontend/assets/50258809/f3ba61f3-d215-4793-88b4-a6951dff5f98)
![orders](https://github.com/kunalznk/react-micro-frontend/assets/50258809/db896115-f719-4e69-8d1c-dc3e1808e887)
![delivery](https://github.com/kunalznk/react-micro-frontend/assets/50258809/279ea315-19f0-431d-bbb4-980e3c3e0068)


# app structure

## Child(Producer) modules - product, delivery, order modules

These modules expose the microfrontends for product, delivery and order functionality

```javascript
    new ModuleFederationPlugin({
      name: "product",
      filename: "product-app.js",
      remotes: {

      },
      exposes: {
        "./ProductApp": "./src/App.jsx",
        "./ProductCard": "./src/Components/ProudctCard.jsx"
      },
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
    })
```

Please ensure that output file and chunknames follow a specific naming convention with appname add as prefix *appname*-*name*.bundle.js, *appname*-*name*.bundle.css:
```javascript
product-[name].bundle.js
product-[name].bundle.css
```
This will ensure that in dist folder we have unique names for module files.

Following scripts will be used to **build** and **run** the individual microfrontends:
`yarn run build`

`yarn run start`

**turbo** will also use these scripts to build and start the mircrofrontend at global/monorepo level:
`turbo run build`

`turbo run start`

```json
  "scripts": {
    "build": "webpack --mode production && cp -R dist/. ../dist/.",
    "build:dev": "webpack --mode development",
    "build:start": "cd dist && PORT=9001 npx serve",
    "start": "webpack serve --mode development",
    "start:live": "webpack serve --open --mode development --live-reload --hot"
  }
```

## Container(Consumer/Main) application

This application consumes the child modules to build a react application:

For running application locally we will have created "webpack.config.js"

```javascript
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
    })
```

For building the application to make it compatible with production builds
The remote entries details for remote modules will be determined at runtime
using Promise API. The Promise would read the hostname and path from were the child modules would be accessible from HTML to build the path.

Refer **webpack-production.config**

```javascript
const pathresolver = `promise new Promise(resolve => {
      const urlParams = new URLSearchParams(window.location.search)
	  console.log("static domain key", document.querySelector("link[rel=canonical]").getAttribute("href"));
      const version = 'appname';
      // This part depends on how you plan on hosting and versioning your federated modules
      //const remoteUrlWithVersion = 'http://localhost:3000/' + 'appname' + '-app.js'
	  const remoteUrlWithVersion = document.querySelector("link[rel=canonical]").getAttribute("href") + 'appname' + '-app.js'
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
    ...
    new ModuleFederationPlugin({
      name: "main",
      filename: "remoteEntry.js",
      remotes: {	
	   "product":  pathresolver.replaceAll('appname','product'),
	   "delivery":  pathresolver.replaceAll('appname','delivery'),
	   "order":  pathresolver.replaceAll('appname','order')
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
```

## Steps to build and run application

```console
npm install
turbo run build
turbo run start
```
Access application on url: http://localhost:9000/

Run for from dist folder (this simulates production build)
```console
turbo run build
npm run serve
```
Access application on url: http://localhost:3000/



