import Store from 'js/store';

var store, Person, Cat, superSave, superRevert;

module('store push single tests', {
  setup: function() {
    Person = Ember.Object.extend({
        firstName: '',
        lastName: '',
        cat_id: null,
        save: function() {
            superSave = 'super';
        },
        revert: function() {
            superRevert = 'revert';
        }
    });
    Cat = Ember.Object.extend({
        color: ''
    });
    var container = new Ember.Container();
    this.container = container;
    container.register('store:main', Store);
    container.register('model:person', Person);
    container.register('model:cat', Cat);
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

test("uses container's returned typeFactory extend() for instantiation", function() {
  var orig = this.container.lookupFactory('model:person'),
      origExtend = orig.extend,
      ping;

  orig.extend = function(opts) {
    ping = 'pong';
    return origExtend.apply(this, arguments);
  };

  store.push('person', {
    id: 1,
    firstName: 'Toran',
    lastName: 'Billups'
  });

  equal(ping, 'pong', "extend on the lookupFactory gets called");
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
  store.remove('person', first.get('id'));
  equal(store.getEverything('person').length, 1);

  var first_person = store.getById('person', first.id);
  ok(!first_person, "The toran record was still found");

  var last_person = store.getById('person', last.id);
  ok(last_person, "The brandon record was not found");
});

test("filter everything should return array of models filtered by value", function() {
  store.push('person', {
    id: 9,
    firstName: 'Jarrod',
    lastName: 'Taylor',
    cat_id: 1
  });

  store.push('person', {
    id: 8,
    firstName: 'Brandon',
    lastName: 'Williams',
    cat_id: 2
  });

  store.push('person', {
    id: 7,
    firstName: 'Toran',
    lastName: 'Billups',
    cat_id: 1
  });

  store.push('cat', {
    id: 1,
    color: 'red'
  });

  store.push('cat', {
    id: 2,
    color: 'blue'
  });

  equal(store.getEverything('person').length, 3);
  equal(store.getEverything('person')[0].get('cat_id'), 1);
  equal(store.getEverything('person')[1].get('cat_id'), 2);
  equal(store.getEverything('person')[2].get('cat_id'), 1);

  equal(store.filterEverything('person', 'cat_id', 1).get('length'), 2);
  equal(store.filterEverything('person', 'cat_id', 2).get('length'), 1);

  store.push('person', {
      id: 14,
      firstName: 'wat',
      lastName: 'hat',
      cat_id: 1
  });
  equal(store.filterEverything('person', 'cat_id', 1).get('length'), 3);
  equal(store.filterEverything('person', 'cat_id', 2).get('length'), 1);

  store.push('person', {
      id: 15,
      firstName: 'xor',
      lastName: 'nope',
      cat_id: 2
  });
  equal(store.filterEverything('person', 'cat_id', 2).get('length'), 2);
  equal(store.filterEverything('person', 'cat_id', 1).get('length'), 3);

  equal(store.getEverything('person').length, 5);
});

test("filter everything should return array of models that tracks changes without asking for an update", function() {
  store.push('person', {
    id: 9,
    firstName: 'Brandon',
    lastName: 'Williams',
    cat_id: 1
  });

  store.push('person', {
    id: 8,
    firstName: 'Toran',
    lastName: 'Billups',
    cat_id: 1
  });

  store.push('cat', {
    id: 1,
    color: 'red'
  });

  var firstBoundProperty = store.filterEverything('person', 'cat_id', 1);
  equal(firstBoundProperty.get('length'), 2);

  store.push('person', {
      id: 14,
      firstName: 'Another',
      lastName: 'Person',
      cat_id: 1
  });

  equal(firstBoundProperty.get('length'), 3);
});

test("filter everything works with string based values", function() {
  store.push('person', {
    id: 9,
    firstName: 'Jarrod',
    lastName: 'Taylor',
    nickname: "foo"
  });

  store.push('person', {
    id: 8,
    firstName: 'Brandon',
    lastName: 'Williams',
    nickname: "bar"
  });

  store.push('person', {
    id: 7,
    firstName: 'Toran',
    lastName: 'Billups',
    nickname: "foo"
  });

  var foo_data = store.filterEverything('person', 'nickname', 'foo');
  var bar_data = store.filterEverything('person', 'nickname', 'bar');

  equal(foo_data.get('length'), 2);
  equal(bar_data.get('length'), 1);
  equal(foo_data.objectAt(0).get('firstName'), 'Jarrod');
  equal(foo_data.objectAt(1).get('firstName'), 'Toran');
  equal(bar_data.objectAt(0).get('firstName'), 'Brandon');
});

test("clear will destroy everything for a given type", function() {
  store.push('person', {
    id: 9,
    firstName: 'Brandon',
    lastName: 'Williams',
    cat_id: 1
  });

  store.push('person', {
    id: 8,
    firstName: 'Toran',
    lastName: 'Billups',
    cat_id: 1
  });

  store.push('cat', {
    id: 1,
    color: 'red'
  });

  var catBefore = store.getById('cat', 1);
  equal(catBefore.get('color'), 'red');

  var catsBefore = store.getEverything('cat');
  equal(catsBefore.get('length'), 1);

  var firstBoundProperty = store.filterEverything('person', 'cat_id', 1);
  equal(firstBoundProperty.get('length'), 2);

  var individualFirstBefore = store.getById('person', 9);
  equal(individualFirstBefore.get('firstName'), 'Brandon');

  var individualLastAfter = store.getById('person', 8);
  equal(individualLastAfter.get('firstName'), 'Toran');

  store.clear('person');

  equal(firstBoundProperty.get('length'), 0);

  var all = store.getEverything('person');
  equal(all.get('length'), 0);

  var individualFirstAfter = store.getById('person', 9);
  equal(individualFirstAfter, null);

  var individualLastAfter = store.getById('person', 8);
  equal(individualLastAfter, null);

  var catAfter = store.getById('cat', 1);
  equal(catAfter.get('color'), 'red');

  var catsAfter = store.getEverything('cat');
  equal(catsAfter.get('length'), 1);
});

test('isDirty property on class will check if object has been changed for known set property', function(){
  var brandon = store.push('person', {
    id: 9,
    firstName: 'Brandon',
    lastName: 'Williams',
    foo: 'bar'
  });
  equal(false, brandon.get('isDirty'));

  brandon.set('foo', 'baz');
  equal(true, brandon.get('isDirty'));
});

test('isDirty property on class will check if object has been changed for unknown property', function(){
  var brandon = store.push('person', {
    id: 9,
    firstName: 'Brandon',
    lastName: 'Williams',
    foo: 'bar'
  });
  equal(false, brandon.get('isDirty'));

  brandon.set('wat', 'baz');
  equal(true, brandon.get('isDirty'));
});

test('isDirty property on class will check if object has been changed for unknown property', function(){
  var brandon = store.push('person', {
    id: 9,
    firstName: 'Brandon',
    lastName: 'Williams',
    foo: 'bar'
  });
  equal(false, brandon.get('isDirty'));

  brandon.set('foo', 'bar');
  equal(false, brandon.get('isDirty'));
});

test('save method on object will call this._super()', function(){
  var brandon = store.push('person', {
    id: 9,
    firstName: 'Brandon',
    lastName: 'Williams',
    foo: 'bar'
  });

  brandon.save();
  equal(superSave, 'super', 'this._super() was not called on save');
});

test('save method on object will set dirty back to false', function(){
  var brandon = store.push('person', {
    id: 9,
    firstName: 'Brandon',
    lastName: 'Williams',
    foo: 'bar'
  });
  equal(false, brandon.get('isDirty'));

  brandon.set('wat', 'baz');
  equal(true, brandon.get('isDirty'));

  brandon.save();
  equal(false, brandon.get('isDirty'));
});

test('revert method on object will call this._super()', function(){
  var brandon = store.push('person', {
    id: 9,
    firstName: 'Brandon',
    lastName: 'Williams',
    foo: 'bar'
  });

  brandon.revert();
  equal('revert', superRevert, 'this._super() was not called on revert');
});

test('revert method on object will set dirty back to false', function(){
  var brandon = store.push('person', {
    id: 9,
    firstName: 'Brandon',
    lastName: 'Williams',
    foo: 'bar'
  });
  equal(false, brandon.get('isDirty'));

  brandon.set('foo', 'baz');
  equal(true, brandon.get('isDirty'));

  brandon.revert();
  equal(false, brandon.get('isDirty'));
});

test('revert method on object will set properties back to pre-dirty state', function(){
  var brandon = store.push('person', {
    id: 9,
    firstName: 'Brandon',
    lastName: 'Williams',
    foo: 'bar'
  });
  equal(false, brandon.get('isDirty'));

  brandon.set('foo', 'baz');
  equal(true, brandon.get('isDirty'));

  brandon.revert();
  equal(false, brandon.get('isDirty'));
  equal('bar', brandon.get('foo'));
});
