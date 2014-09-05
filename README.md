simple-ember-store
==============================

[![Build Status][]](https://travis-ci.org/toranb/simple-ember-store)

This store includes a bare bones identity map for [Ember.js][]

Installing
----------

1. bower install simple-ember-store
2. include the script in your ES6 build
3. register the store and inject it

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


A few more examples
----------

Below I'll show how you can use the store with a simple ember object to find/add/remove/update

The example below relies heavily on this [PromiseMixin][]

```js
import PromiseMixin from 'js/mixins/promise';

var Person = Ember.Object.extend({
    firstName: '',
    lastName: '',
    phone: ''
}).reopenClass(PromiseMixin, {
    find: function(store) {
        return this.xhr('/api/people/', 'GET').then(function(response) {
            response.forEach(function(person) {
                store.push('person', person);
            });
            return store.getEverything('person');
        });
    },
    findById: function(store, id) {
        return store.getById('person', id);
    },
    insert: function(store, person) {
        var self = this;
        var hash = {data: JSON.parse(JSON.stringify(person))};
        return new Ember.RSVP.Promise(function(resolve,reject) {
            return self.xhr("/api/people/", "POST", hash).then(function(persisted) {
                var inserted = store.push('person', Person.create(persisted));
                resolve(inserted);
            }, function(err) {
                reject(err);
            });
        });
    },
    update: function(person) {
        var person_id = person.get("id");
        var hash = {data: JSON.parse(JSON.stringify(person))};
        var endpoint = "/api/people/%@/".fmt(person_id);
        return this.xhr(endpoint, "PUT", hash);
    },
    remove: function(store, person) {
        var self = this;
        var person_id = person.get("id");
        var endpoint = "/api/people/%@/".fmt(person_id);
        return new Ember.RSVP.Promise(function(resolve,reject) {
            return self.xhr(endpoint, "DELETE").then(function(arg) {
                store.remove('person', person_id);
                resolve(arg);
            }, function(err) {
                reject(err);
            });
        });
    }
});

export default Person;
```


License
-------

Copyright © 2014 Toran Billups http://toranbillups.com

Licensed under the MIT License


[Build Status]: https://secure.travis-ci.org/toranb/simple-ember-store.png?branch=master
[Ember.js]: http://emberjs.com/
[PromiseMixin]: https://gist.github.com/toranb/98abc9616f2abecde0d4
