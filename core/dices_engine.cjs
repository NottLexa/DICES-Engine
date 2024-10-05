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
    this.reroll_all = function(magnitude) {
        for (let index = 0; index < this.magnitudes[magnitude].length; index++) {
            this.magnitudes[magnitude][index] = randint(1, magnitude);
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
}

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
}

const convert_attribute_effect = function (effect_object) {
    return mcfp.js_convert(effect_object.target_attribute, effect_object.formula_block, effect_object.effect_type,
        effect_object.target_attribute_property);
}

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
}

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
}

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
}

const post_effect_attributes_cleanup = function(attributes_object) {
    for (let attribute_name in attributes_object) {
        if (attributes_object.hasOwnProperty(attribute_name)) {
            let attribute = attributes_object[attribute_name]
            if (attribute._type === 'array') {
                attribute._value = attribute._value.filter((value)=>(attribute._variants.includes(value)));
            }
        }
    }
};

module.exports = {randint, DicesObject, DicesIterator, template_to_attributes, get_attributes, parse_attribute_effect,
    convert_attribute_effect, parse_attribute_effects, effect_ordering, effect_functions, execute_ordered_effects,
    reset_attributes, post_effect_attributes_cleanup};