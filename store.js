function buildRecord(type, data, store) {
    var containerKey = 'model:' + type;
    var factory = store.container.lookupFactory(containerKey);
    var recordObject = factory.extend({
        isDirty: false,
        set: function(key, value) {
            if(this.get(key) !== value && !this.get('isDirty')) {
                this._super('isDirty', true);
            }
            return this._super(key, value);
        },
        save: function() {
            this.set('isDirty', false);
            this._super();
        },
        revert: function() {
            this.set('isDirty', false);
            this._super();
        }
    });
    var record = recordObject.create(data);
    identityMapForType(type, store)[data.id] = record;
    arrayForType(type, store).pushObject(record);
    return record;
};

function arrayForType(type, store) {
    var all = store.get('array');
    var models = all[type] || [];
    all[type] = models;
    return models;
}

function identityMapForType(type, store) {
    var typeIdentityMap = store.get('identityMap');
    var idIdentityMap = typeIdentityMap[type] || {};
    typeIdentityMap[type] = idIdentityMap;
    return idIdentityMap;
}

var Store = Ember.Object.extend({
    init: function() {
        this.set('identityMap', {});
        this.set('array', {});
    },
    clear: function(type) {
        delete this.get('identityMap')[type]
        arrayForType(type, this).clear();
    },
    push: function(type, data) {
        var record = this.getById(type, data.id);
        if (record) {
            record.setProperties(data);
        } else {
            record = buildRecord(type, data, this);
        }
        return record;
    },
    remove: function(type, id) {
        var record = this.getById(type, id);
        if (record) {
            delete this.get('identityMap')[type][record.id];
            arrayForType(type, this).removeObject(record);
        }
    },
    getById: function(type, id) {
        var identityMap = identityMapForType(type, this);
        return identityMap[id] || null;
    },
    getEverything: function(type) {
        return arrayForType(type, this);
    },
    filterEverything: function(type, filter_attr, filter_value) {
        var computed_string = 'source.@each.' + filter_attr;
        return Em.ArrayProxy.extend({
          source: undefined,
          content: function () {
            var filter_value = this.get('filter_value');
            return this.get('source').filterBy(filter_attr, filter_value);
          }.property(computed_string)
        }).create({
          filter_value: filter_value,
          source: this.getEverything(type)
        });
    }
});

export default Store;
