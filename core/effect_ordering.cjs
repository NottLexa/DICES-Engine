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

const get_dependencies = function(attributes) {
    let effect_dependencies = {}; // Object, values are sets
    let attribute_dependencies = {}; // Object, values are sets
    for (let attribute_name in attributes) {
        if (attributes.hasOwnProperty(attribute_name)) attribute_dependencies[attribute_name] = new Set();
    }
    for (let attribute_name in attributes) {
        if (attributes.hasOwnProperty(attribute_name)) {
            let attribute = attributes[attribute_name];
            if (attribute.hasOwnProperty('_effects')) {
                for (let effect_id = 0; effect_id < attribute._effects.length; effect_id++) {
                    let effect = attribute._effects[effect_id];
                    let effect_path = attribute_name+':'+effect_id;
                    effect_dependencies[effect_path] = new Set();
                    effect.dependecies.forEach((effect_dependency) => {
                        effect_dependencies[effect_path].add(effect_dependency === '@self' ? attribute_name : effect_dependency);
                    });
                    attribute_dependencies[effect.target_attribute].add(effect_path);
                }
            }

            //dependencies[attribute_name] = new Set();
        }
    }
    console.log(effect_dependencies);
    console.log(attribute_dependencies);
    return [effect_dependencies, attribute_dependencies];
}

const effect_ordering = function(attributes) {
    let [effect_dependencies, attribute_dependencies] = get_dependencies(attributes);
    let effect_order = [];
    for (let effect_path in effect_dependencies) {
        if (effect_dependencies.hasOwnProperty(effect_path) && (!effect_order.includes(effect_path)))
        {
            let ordering_result = effect_ordering_recursive(effect_order, effect_dependencies, attribute_dependencies, effect_path, []);
            if (ordering_result === null) return null;
        }
    }
    return effect_order;
}

const effect_ordering_recursive = function(effect_order_array, effect_dependencies, attribute_dependencies, effect_path, already_used_attributes = []) {
    if (!effect_dependencies.hasOwnProperty(effect_path)) return null;
    effect_dependencies[effect_path].forEach((attribute_to_process)=>{
        if (!attribute_dependencies.hasOwnProperty(attribute_to_process)) return null;
        if (already_used_attributes.hasOwnProperty(attribute_to_process)) return null;
        attribute_dependencies[attribute_to_process].forEach((effect_path_that_affect_attribute)=>{
            if (!effect_order_array.includes(effect_path_that_affect_attribute)) {
                let ordering_result = effect_ordering_recursive(effect_order_array, effect_dependencies,
                    attribute_dependencies, effect_path_that_affect_attribute, [...already_used_attributes, attribute_to_process]);
                if (ordering_result === null) return null;
            }

        });
    });
    effect_order_array.push(effect_path);
    return true;
}

/*const order_recursive = function(order_array, dependencies_object, attribute, already_used_attributes = []) {
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
}*/

module.exports = {effect_ordering};