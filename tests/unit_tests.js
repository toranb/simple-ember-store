import Store from 'js/store';

var store, Person;

module('store push single tests', {
  setup: function() {
    Person = Ember.Object.extend({
        firstName: '',
        lastName: ''
    });
    var container = new Ember.Container();
    this.container = container;
    container.register('store:main', Store);
    container.register('model:person', Person);
    store = container.lookup('store:main');
  }
});

test("records can be pushed into the store", function() {
  store.push("person", {
    id: "toranb",
    firstName: "Toran",
    lastName: "Billups"
  });

  var toranb = store.getById('person', 'toranb');
  ok(toranb, "The toranb record was found");

  equal(toranb.get('firstName'), "Toran", "the firstName property is correct");
  equal(toranb.get('lastName'), "Billups", "the lastName property is correct");
  equal(toranb.get('id'), "toranb", "the id property is correct");
});

test("push returns the created record", function() {
  var pushedToranb = store.push('person', {
    id: 'toranb',
    firstName: "Toran",
    lastName: "Billups"
  });

  var gottenToranb = store.getById('person', 'toranb');

  strictEqual(pushedToranb, gottenToranb, "both records are identical");
});

test("pushing a record into the store twice updates the original record", function() {
  store.push('person', {
    id: 'toranb',
    firstName: "Toran",
    lastName: "Billups"
  });

  var toranb = store.getById('person', 'toranb');
  ok(toranb, "The toranb record was found");

  equal(toranb.get('firstName'), "Toran", "the firstName property is correct");
  equal(toranb.get('lastName'), "Billups", "the lastName property is correct");
  equal(toranb.get('id'), "toranb", "the id property is correct");

  store.push('person', {
    id: 'toranb',
    firstName: "X",
    lastName: "Y"
  });

  equal(toranb.get('firstName'), "X", "the firstName property is correct");
  equal(toranb.get('lastName'), "Y", "the lastName property is correct");
  equal(toranb.get('id'), "toranb", "the id property is is correct");
});

test("pushing doesn't mangle string ids", function() {
  store.push('person', {
    id: 'toranb',
    firstName: 'Toran',
    lastName: 'Billups'
  });

  var toranb = store.getById('person', 'toranb');
  strictEqual(toranb.get('id'), 'toranb');
});

test("models with int based ids can be lookedup by either str or int values", function() {
  store.push('person', {
    id: 123,
    firstName: 'Toran',
    lastName: 'Billups'
  });

  var toranbByStr = store.getById('person', '123');
  strictEqual(toranbByStr.get('id'), 123);
  ok(toranbByStr instanceof Person);

  var toranbByNum = store.getById('person', 123);
  strictEqual(toranbByNum.get('id'), 123);
  ok(toranbByNum instanceof Person);
});

test("uses lookupFactory somewhere as part of a push", function() {
  var orig = this.container.lookupFactory,
      yipee;

  this.container.lookupFactory = function() {
    yipee = 'doodah';
    return orig.apply(this, arguments);
  };

  store.push('person', {
    id: 1,
    firstName: 'Toran',
    lastName: 'Billups'
  });

  equal(yipee, 'doodah', "lookupFactory gets called");
});

test("uses container's returned typeFactory create() for instantiation", function() {
  var orig = this.container.lookupFactory('model:person'),
      origCreate = orig.create,
      ping;

  orig.create = function(opts) {
    ping = 'pong';
    return origCreate.apply(this, arguments);
  };

  store.push('person', {
    id: 1,
    firstName: 'Toran',
    lastName: 'Billups'
  });

  equal(ping, 'pong', "create on the lookupFactory gets called");
});

test("return everything should return array of models", function() {
  store.push('person', {
    id: 1,
    firstName: 'Toran',
    lastName: 'Billups'
  });

  store.push('person', {
    id: 2,
    firstName: 'Brandon',
    lastName: 'Williams'
  });

  equal(store.getEverything('person').length, 2);
  equal(store.getEverything('person')[0].get('firstName'), 'Toran');
  equal(store.getEverything('person')[1].get('firstName'), 'Brandon');
});

test("remove should destory the item by type", function() {
  var first = store.push('person', {
    id: 1,
    firstName: 'Toran',
    lastName: 'Billups'
  });

  var last = store.push('person', {
    id: 2,
    firstName: 'Brandon',
    lastName: 'Williams'
  });

  equal(store.getEverything('person').length, 2);
  store.remove('person', first);
  equal(store.getEverything('person').length, 1);

  var first_person = store.getById('person', first.id);
  ok(!first_person, "The toran record was still found");

  var last_person = store.getById('person', last.id);
  ok(last_person, "The brandon record was not found");
});
