simple-ember-store
==============================

[![Build Status][]](https://travis-ci.org/toranb/simple-ember-store)

This store includes a bare bones identity map for [Ember.js][]

Installing
----------

* pull down the store.js file from this repository
* include the script in your index.html or build tool
* import the store in your app.js using ES6
* register the store and inject it

    App.initializer({
        name: "store",
        initialize: function(container, application) {
            application.register('store:main', Store);
            application.inject('controller', 'store', 'store:main');
            application.inject('route', 'store', 'store:main');
        }
    });


Running the unit tests
----------

    npm install
    gulp test


Example project
----------

https://github.com/toranb/ember-store-example


License
-------

Copyright © 2014 Toran Billups http://toranbillups.com

Licensed under the MIT License


[Build Status]: https://secure.travis-ci.org/toranb/simple-ember-store.png?branch=master
[Ember.js]: http://emberjs.com/
