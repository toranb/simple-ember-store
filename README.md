simple-ember-store
==============================

[![Build Status][]](https://travis-ci.org/toranb/simple-ember-store)

This store includes a bare bones identity map for [Ember.js][]

Installing
----------

1. bower install simple-ember-store
2. include the script in your ES6 build tool of choice
3. import the store in your app.js
4. register the store and inject it

```js
App.initializer({
  name: "store",
  initialize: function(container, application) {
    application.register("store:main", Store);
    application.inject("controller", "store", "store:main");
    application.inject("route", "store", "store:main");
  }
});
```

What about relationship support?
----------
With this simple reference implementation you can side step the relationship complexity by adding what you need in your route(s)

```js
import Action from "js/models/action";
import Person from "js/models/person";

var PeoplePersonRoute = Ember.Route.extend({
  model: function(params) {
    var store = this.get("store");
    var person = Person.findById(store, params.person_id);
    var actions = Action.findByPerson(store, params.person_id);
    return Ember.RSVP.hash({person: person, actions: actions});
  },
  setupController: function(controller, hash) {
    controller.set("model", hash.person);
    controller.set("actions", hash.actions);
  }
});
```

This approach is not without it's tradeoffs (ie- additional http calls to fetch related data instead of using embedded json for example). I've personally found this is a great approach for apps that want to avoid the "kitchen-sink" problem.


What about the missing MyObject.save() abstraction
----------
Because this is a simple identity map you won't get a rich model object to inherit from that offers up save/remove/update/find. You can think of this store as the primitive in which to build something like that if and when you need it.


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
