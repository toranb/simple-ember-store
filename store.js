function buildRecord(type, data, store) {
    var containerKey = 'model:' + type;
    var factory = store.container.lookupFactory(containerKey);
    var record = factory.create(data);
    var id = data.id;
    identityMapForType(type, store)[id] = record;
    arrayForType(type, store).pushObject(record);
    return record;
}

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
    push: function(type, data) {
        var record = this.getById(type, data.id);
        if (record) {
            record.setProperties(data);
        } else {
            record = buildRecord(type, data, this);
        }
        return record;
    },
    remove: function(type, data) {
        var record = this.getById(type, data.id);
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
    }
});

export default Store;
