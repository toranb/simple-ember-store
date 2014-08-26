A simple identity map for ember.js

To use this in your project

1) pull down the store.js file from this repository
2) include the script in your index.html or build tool
3) import the store in your app.js using ES6
4) register the store and inject it

    App.initializer({
        name: "store",
        initialize: function(container, application) {
            application.register('store:main', Store);
            application.inject('controller', 'store', 'store:main');
            application.inject('route', 'store', 'store:main');
        }
    });

Want to run the tests for this store?

npm install
gulp test

Want to see a working ember app with this in the mix?

https://github.com/toranb/ember-store-example
