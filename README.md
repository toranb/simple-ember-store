simple-ember-store
==============================

[![Build Status][]](https://travis-ci.org/toranb/simple-ember-store)

This store includes a bare bones identity map for [Ember.js][]

Installing
----------

note: ember-cli users should instead use the addon [Ember-Cli-Simple-Store][]

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

## You get 5 methods: push/remove/find/findOne/clear

```js
//create or update person model

this.store.push("person", {id: 1, name: "toran"});
```

```js
//remove person model with id=123

this.store.remove("person", 123);
```

```js
//find all person models

this.store.find("person");
```

```js
//find a single person model with id=123

this.store.find("person", 123);
```

```js
//find all person models with account_id=789

this.store.find("person", {account_id: 789});
```

```js
//find the first person model

this.store.findOne("person");
```

```js
//clear the entire identity map of all person models

this.store.clear("person");
```

## Using the store by example

Below I'll show how you can use the store with a simple ember object to find/add/remove/update

The full example below relies on a small xhr mixin [PromiseMixin][]

```js
import PromiseMixin from "js/mixins/promise";

var Person = Ember.Object.extend({
    firstName: "",
    lastName: "",
    phone: ""
}).reopenClass({
    find: function(store) {
        return PromiseMixin.xhr("/api/people/", "GET").then(function(response) {
            response.forEach(function(person) {
                store.push("person", person);
            });
            return store.find("person");
        });
    },
    findById: function(store, id) {
        return store.find("person", id);
    },
    insert: function(store, person) {
        var self = this;
        var hash = {data: JSON.stringify(person)};
        return new Ember.RSVP.Promise(function(resolve,reject) {
            return PromiseMixin.xhr("/api/people/", "POST", hash).then(function(persisted) {
                var inserted = store.push("person", persisted);
                resolve(inserted);
            }, function(err) {
                reject(err);
            });
        });
    },
    update: function(person) {
        var person_id = person.get("id");
        var hash = {data: JSON.stringify(person)};
        var endpoint = "/api/people/%@/".fmt(person_id);
        return PromiseMixin.xhr(endpoint, "PUT", hash);
    },
    remove: function(store, person) {
        var self = this;
        var person_id = person.get("id");
        var endpoint = "/api/people/%@/".fmt(person_id);
        return new Ember.RSVP.Promise(function(resolve,reject) {
            return PromiseMixin.xhr(endpoint, "DELETE").then(function(arg) {
                store.remove("person", person_id);
                resolve(arg);
            }, function(err) {
                reject(err);
            });
        });
    }
});

export default Person;
```

## What about relationship support?

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

This approach is not without it's tradeoffs

* additional http calls to fetch related data instead of using embedded json. You could make a single http call and parse this out if latency becomes problematic but you might find yourself managing complex object hierarchies all over again.
* you will find yourself passing the store instance into model object class methods from the route/controller
* you begin to use a different pattern for object materialization/filtering in the route objects because the models themselves are relationship-less.

I've personally found this is a great approach for apps that want to avoid the complexity of bigger projects like ember-data, but still need a single pointer /reference for the models in your ember application.

## What about the missing MyObject.save() abstraction

Because this is a simple identity map you won't get a rich model object to inherit from that offers up save/remove/update/find. You can think of this store as the primitive in which to build something like that if and when you need it.

## Running the unit tests

    npm install
    gulp test

## Example project

https://github.com/toranb/ember-store-example

## License

Copyright © 2015 Toran Billups http://toranbillups.com

Licensed under the MIT License

[Build Status]: https://secure.travis-ci.org/toranb/simple-ember-store.png?branch=master
[Ember.js]: http://emberjs.com/
[PromiseMixin]: https://gist.github.com/toranb/98abc9616f2abecde0d4
[Ember-Cli-Simple-Store]: https://github.com/toranb/ember-cli-simple-store
