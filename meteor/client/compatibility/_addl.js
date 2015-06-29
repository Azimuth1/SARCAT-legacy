
    _.mixin({
        // Get/set the value of a nested property
        deep: function (obj, key, value) {
            var keys = key.replace(/\[(["']?)([^\1]+?)\1?\]/g, '.$2')
                .replace(/^\./, '')
                .split('.'),
                root,
                i = 0,
                n = keys.length;
            // Set deep value
            if (arguments.length > 2) {
                root = obj;
                n--;
                while (i < n) {
                    key = keys[i++];
                    obj = obj[key] = _.isObject(obj[key]) ? obj[key] : {};
                }
                obj[keys[i]] = value;
                value = root;
                // Get deep value
            } else {
                while ((obj = obj[keys[i++]]) != null && i < n) {};
                value = i < n ? void 0 : obj;
            }
            return value;
        }
    });
    _.mixin({
        pluckDeep: function (obj, key) {
            return _.map(obj, function (value) {
                return _.deep(value, key);
            });
        }
    });