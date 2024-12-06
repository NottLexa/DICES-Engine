const mcfp = require('./mcfp/1/main.cjs');
const {effect_ordering} = require('./effect_ordering.cjs');
const effect_functions = require('./mcfp/mcfp_core_functions.cjs').functions;

const randint = (min, max) => (min + Math.floor(Math.random()*(max-min+1)));

const DicesObject = function() {
    this.attribute_iterators = {};
    this.get_iterator = function(attribute_name, effect_index) {
        if (!this.attribute_iterators.hasOwnProperty(attribute_name)) this.attribute_iterators[attribute_name] = {};
        let iterators = this.attribute_iterators[attribute_name];
        if (!iterators.hasOwnProperty(effect_index)) iterators[effect_index] = new DicesIterator();
        return iterators[effect_index];
    };
    this.reset_pointers = function() {
        for (let attribute_name in this.attribute_iterators) {
            if (this.attribute_iterators.hasOwnProperty(attribute_name)) {
                for (let effect_index in this.attribute_iterators[attribute_name]) {
                    if (this.attribute_iterators[attribute_name].hasOwnProperty(effect_index)) {
                        this.attribute_iterators[attribute_name][effect_index].reset_pointers();
                    }
                }
            }
        }
    };
};

const DicesIterator = function() {
    this.pointers = {};
    this.magnitudes = {};
    this.reset_pointers = function() {
        for (let key in this.pointers) {
            if (this.pointers.hasOwnProperty(key)) this.pointers[key] = 0;
        }
    }
    this.clear = function() {
        this.pointers = {};
        this.magnitudes = {};
    }
    this.get = function(magnitude) {
        if (!this.magnitudes.hasOwnProperty(magnitude)) this.magnitudes[magnitude] = [];
        if (!this.pointers.hasOwnProperty(magnitude)) this.pointers[magnitude] = 0;
        while (this.magnitudes[magnitude].length <= this.pointers[magnitude]) this.magnitudes[magnitude].push(randint(1, magnitude));
        return this.magnitudes[magnitude][this.pointers[magnitude]++];
    }
    this.reroll = function(magnitude, index) {
        if (!this.magnitudes.hasOwnProperty(magnitude)) this.magnitudes[magnitude] = [];
        if (!this.pointers.hasOwnProperty(magnitude)) this.pointers[magnitude] = 0;
        while (this.magnitudes[magnitude].length <= index) this.magnitudes[magnitude].push(randint(1, magnitude));
        this.magnitudes[magnitude][index] = randint(1, magnitude);
    }
    this.reroll_all = function(...magnitudes) {
        if (magnitudes.length === 0) {
            for (let magnitude in this.magnitudes) {
                if (!this.magnitudes.hasOwnProperty(magnitude)) continue;
                for (let index = 0; index < this.magnitudes[magnitude].length; index++) {
                    this.magnitudes[magnitude][index] = randint(1, magnitude);
                }
            }
        }
        else {
            for (let magnitude of magnitudes) {
                for (let index = 0; index < this.magnitudes[magnitude].length; index++) {
                    this.magnitudes[magnitude][index] = randint(1, magnitude);
                }
            }
        }
    }
};

const template_to_attributes = function(template_object) {
    let attributes_object = get_attributes(template_object.attributes);

    for (let attribute_name in attributes_object) {
        try {
            attributes_object[attribute_name] = parse_attribute_effects(attributes_object[attribute_name]);
        } catch (error) {
            throw new Error(attribute_name+': '+error);
        }
    }
    return attributes_object;
};

const get_attributes = function(json_object, name='', prefix='') {
    let attribute_data = {};
    if (json_object.hasOwnProperty('_type')) { // it is an attribute
        for (let key in json_object) {
            if (json_object.hasOwnProperty(key)) {
                if (Array.isArray(json_object[key])) json_object[key+'.default'] = [...json_object[key]];
                else json_object[key+'.default'] = json_object[key];
            }
        }
        attribute_data[prefix+name] = json_object;
        //attribute_data[prefix+name]['_default_value'] = json_object.hasOwnProperty('_value') ? json_object._value : null;
    }
    else { // must be a recursive json_object tree
        for (let key in json_object) {
            if (json_object.hasOwnProperty(key)) {
                attribute_data = {...attribute_data, ...get_attributes(json_object[key], key, name === '' ? '' : prefix+name+'.')};
            }
        }
    }
    return attribute_data;
};

const parse_attribute_effect = function (effect_string) {
    return mcfp.parse_effect(effect_string);
};

const convert_attribute_effect = function (effect_object) {
    return mcfp.js_convert(effect_object.target_attribute, effect_object.formula_block, effect_object.effect_type,
        effect_object.target_attribute_property);
};

const parse_attribute_effects = function(attribute_object) {
    let returned_object = {...attribute_object};
    if (returned_object.hasOwnProperty('_effects')) {
        let effect_strings = returned_object._effects;
        returned_object._effects = [];
        for (let effect_index = 0; effect_index < effect_strings.length; effect_index++) {
            let effect = parse_attribute_effect(effect_strings[effect_index]);
            if (effect.conclusion === 0) {
                let converted_effect = convert_attribute_effect(effect);
                returned_object._effects.push(converted_effect);
            }
            else {
                throw new Error('DICES Engine: error ['+effect.conclusion+'] at parsing effect #'+effect_index+' of attribute "'+attribute_object.name+'"');
            }
        }
        returned_object['_effects.default'] = [...returned_object['_effects']];
    }
    return returned_object;
};

const execute_ordered_effects = function(attributes_object, execution_order, dices_object) {
    dices_object.reset_pointers();
    for (let effect_path of execution_order) {
        let [executing_attribute_name, effect_index] = effect_path.split(':');
        effect_index = Number(effect_index);
        let executing_attribute = attributes_object[executing_attribute_name];
        let effect = executing_attribute._effects[effect_index];
        let dices_iterator = dices_object.get_iterator(executing_attribute_name, effect_index);
        effect.function(attributes_object, effect_functions, executing_attribute_name, dices_iterator);
    }
};

const reset_attributes = function(attributes_object, manual_set_attribute_callback) {
    for (let attribute_name in attributes_object) {
        if (attributes_object.hasOwnProperty(attribute_name))
        {
            let attribute = attributes_object[attribute_name];
            for (let property in attribute) {
                if (attribute.hasOwnProperty(property) && attribute.hasOwnProperty(property+'.default') && (property !== '_value') && (!property.endsWith('.default'))) {
                    if (attribute[property+'.default'].constructor === Array) {
                        attribute[property] = [...attribute[property+'.default']];
                    }
                    else attribute[property] = attribute[property+'.default'];
                }
            }
            if (attribute._set.includes('auto'))
            {
                attribute['_value'] = attribute['_value.default'];
            }
            else if (attribute._set.includes('manual'))
            {
                manual_set_attribute_callback(attribute_name);
            }
        }
    }
};

const post_effect_attributes_cleanup = function(attributes_object) {
    for (let attribute_name in attributes_object) {
        if (attributes_object.hasOwnProperty(attribute_name)) {
            let attribute = attributes_object[attribute_name]
            if (attribute._type === 'array') {
                attribute._value = attribute._value.filter((value)=>(attribute._variants.includes(value)));
            }
            if (attribute._type === 'integer' && attribute._set.includes('manual')) {
                let value_from_element = attribute._value;
                if (attribute.hasOwnProperty('_value_min'))
                    value_from_element = Math.max(value_from_element, attribute._value_min);
                if (attribute.hasOwnProperty('_value_max'))
                    value_from_element = Math.min(value_from_element, attribute._value_max);
                set_attribute(attributes_object, attribute_name, value_from_element);
            }
        }
    }
};

const find_checked_checkboxes = function(html_element, recursion) {
    let return_data = [];
    for (let child_index = 0; child_index < html_element.childElementCount; child_index++) {
        let child = html_element.children[child_index];
        if (child.tagName.toLowerCase() === 'input' && child.type === 'checkbox') {
            if (child.checked) return_data.push(child.name);
        }
        if (recursion) {
            return_data = return_data.concat(find_checked_checkboxes(child, recursion));
        }
    }
    return return_data;
};


const get_value_from_element = function(html_element, attributes_object_for_type_checking = undefined) {
    if (html_element.hasAttribute('name')) {
        let attribute_name = html_element.name;
        let attribute_type = 'undefined';
        if (attributes_object_for_type_checking !== undefined) {
            if (attributes_object_for_type_checking.hasOwnProperty(attribute_name) && attributes_object_for_type_checking[attribute_name].hasOwnProperty('_type')) {
                attribute_type = attributes_object_for_type_checking[attribute_name]._type;
            }
        }
        switch (html_element.tagName.toLowerCase()) {
            case 'input':
                switch (html_element.type + '|' + attribute_type) {
                    case 'text|string':
                    case 'text|undefined':
                        return {[attribute_name]: html_element.value};
                    case 'text|integer':
                    case 'number|integer':
                    case 'number|undefined':
                        return {[attribute_name]: Number(html_element.value)};
                }
                break;
            case 'select':
                switch (attribute_type) {
                    case 'boolean':
                        return {[attribute_name]: html_element.value.toString() === 'true'};
                    case 'undefined':
                    case 'string':
                        return {[attribute_name]: html_element.value};
                }
                break;
            case 'fieldset':
                switch (attribute_type) {
                    case 'array':
                    case 'undefined':
                        return {[attribute_name]: find_checked_checkboxes(html_element, true)};
                }
                break;
        }
        return {[attribute_name]:'INCORRECT'};
    }
    return {a:1};
};

const get_value_from_elements = function(html_elements, attributes_object_for_type_checking = undefined, manual_only = true) {
    let return_data = {};
    for (html_element of html_elements) {
        let element_value = get_value_from_element(html_element, attributes_object_for_type_checking);
        if (attributes_object_for_type_checking !== undefined && manual_only) {
            for (let attribute_name in element_value) {
                if (element_value.hasOwnProperty(attribute_name)) {
                    if (attributes_object_for_type_checking.hasOwnProperty(attribute_name)) {
                        if (attributes_object_for_type_checking[attribute_name].hasOwnProperty('_set')) {
                            if (attributes_object_for_type_checking[attribute_name]['_set'].includes('manual')) {
                                return_data = {...return_data, ...element_value};
                            }
                        }
                    }
                }
            }
        }
        else return_data = {...return_data, ...element_value};
    }
    return return_data;
};

const get_effects_by_targets = function(attributes_object, return_with_effect_index = true, only_effects_that_use_dices = false) {
    let effects_by_targets = {};
    for (let attribute_name in attributes_object) {
        if (attributes_object.hasOwnProperty(attribute_name)) effects_by_targets[attribute_name] = new Set();
    }
    for (let attribute_name in attributes_object) {
        if (!attributes_object.hasOwnProperty(attribute_name)) continue;
        let attribute = attributes_object[attribute_name];
        if (attribute.hasOwnProperty('_effects')) {
            for (let effect_index = 0; effect_index < attribute._effects.length; effect_index++) {
                let effect = attribute._effects[effect_index];
                if (!only_effects_that_use_dices || (effect.hasOwnProperty('use_dices') && effect.use_dices))
                effects_by_targets[effect.target_attribute].add(return_with_effect_index
                    ? attribute_name+':'+effect_index
                    : attribute_name);
            }
        }
    }
    return effects_by_targets
};

const set_attribute = function(attributes_object, attribute_reference, new_value) {
    let [attribute_name, property] = attribute_reference.split(':');
    if (property === undefined) property = 'value';
    property = '_'+property;
    if (attributes_object.hasOwnProperty(attribute_name)) {
        if (attributes_object[attribute_name].hasOwnProperty(property)) {
            attributes_object[attribute_name][property] = new_value;
        }
    }
};

const set_attributes = function(attributes_object, changes_object) {
    for (let attribute_reference in changes_object) {
        if (changes_object.hasOwnProperty(attribute_reference)) {
            set_attribute(attributes_object, attribute_reference, changes_object[attribute_reference])
        }
    }
};

module.exports = {randint, DicesObject, DicesIterator, template_to_attributes, get_attributes, parse_attribute_effect,
    convert_attribute_effect, parse_attribute_effects, effect_ordering, effect_functions, execute_ordered_effects,
    reset_attributes, post_effect_attributes_cleanup, find_checked_checkboxes, get_value_from_element,
    get_value_from_elements, set_attribute, set_attributes, get_effects_by_targets};