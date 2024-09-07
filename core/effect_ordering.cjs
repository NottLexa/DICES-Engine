const object_length = function(obj) {
    let property_count = 0;
    for (var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            property_count += 1;
        }
    }
    return property_count;
}

const is_object_empty = function(obj) {
    for (var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            return false;
        }
    }
    return true;
}

const effect_dependencies = function(attributes) {
    let dependencies = {};
    for (let attribute_name in attributes) {
        if (attributes.hasOwnProperty(attribute_name)) dependencies[attribute_name] = new Set();
    }
    for (let attribute_name in attributes) {
        if (attributes.hasOwnProperty(attribute_name)) {
            let attribute = attributes[attribute_name];
            if (attribute.hasOwnProperty('_effects'))
            {
                for (let effect of attribute._effects) {
                    for (let dependency of effect.dependecies) {
                        if (dependency === '@self') dependencies[effect.target].add(attribute_name);
                        else dependencies[effect.target].add(dependency);
                    }
                }
            }
        }
    }
    return dependencies;
}

const effect_ordering = function(attributes) {
    let dependencies = effect_dependencies(attributes);
    let order = [];
    for (let attribute_name in attributes) {
        if (attributes.hasOwnProperty(attribute_name) && (!order.includes(attribute_name)))
        {
            order_recursive(order, dependencies, attribute_name, []);
        }
    }
    return order;
}

const order_recursive = function(order_array, dependencies_object, attribute, already_used_attributes = []) {
    if (!dependencies_object.hasOwnProperty(attribute)) return null;
    let attribute_dependencies = dependencies_object[attribute];
    for (let dependency of attribute_dependencies) {
        if (already_used_attributes.includes(dependency)) return null;
        if (!order_array.includes(dependency)) {
            order_recursive(order_array, dependencies_object, dependency, [...already_used_attributes, attribute]);
        }
        if (order_array[dependency] === null) return null;
    }
    order_array.push(attribute);
}

module.exports = {effect_ordering};