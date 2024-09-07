// by NotLexa & arkain123

const platform = document.getElementById('script').hasAttribute('platform')
    ? document.getElementById('script').getAttribute('platform') : 'WEB';

var attributes_frame = document.getElementById('attributes_frame');
var templates_select_list = document.getElementById('templates_select_list');

var fs, path;

const mcfp = require('./core/mcfp/1/main.cjs');
const {effect_ordering} = require('./core/effect_ordering.cjs');
const effect_functions = require('./core/mcfp/mcfp_core_functions.cjs').functions;

var server = '127.0.0.1:63342';
var template_list = [];

var attributes = {};

const get_attributes = function(attribute, name='', prefix='') {
    let data = {};
    if (attribute.hasOwnProperty('_type')) { // it is an attribute
        data[prefix+name] = attribute;
        data[prefix+name]['_default_value'] = attribute.hasOwnProperty('_value') ? attribute._value : null;
    }
    else { // must be a recursive attribute tree
        for (let key in attribute) {
            if (attribute.hasOwnProperty(key)) {
                data = {...data, ...get_attributes(attribute[key], key, name === '' ? '' : prefix+name+'.')};
            }
        }
    }
    return data;
}

const change_template = function(option_element) {
    let template_index = option_element.value;
    attributes = get_attributes(template_list[template_index].attributes);
    for (let attribute_name in attributes) {
        let attribute = attributes[attribute_name];
        if (attribute.hasOwnProperty('_effects')) {
            let temporary_effects = attribute._effects;
            attribute._effects = [];
            for (let i in temporary_effects) {
                if (temporary_effects.hasOwnProperty(i)) {
                    let effect = mcfp.parse_effect(temporary_effects[i]);
                    if (effect.conclusion === 0) {
                        let converted_effect = mcfp.js_convert(effect.target_attribute, effect.formula_block, effect.effect_type);
                        console.log(converted_effect.function);
                        attribute._effects.push(converted_effect);
                    }
                }
            }
        }
    }
    update_attributes_list();
}

const update_templates_list = async function() {
    if (platform === 'NODE') {
        fs = require('fs');
        path = require('path');
        try {
            let templates = fs.readdirSync('data/templates', {encoding: "utf8"});
            template_list.splice(0, template_list.length);
            for (let template of templates) {
                if (path.extname(template) === '.json')
                {
                    console.log(template);
                    let template_path = path.join('data/templates', template);
                    let template_data = JSON.parse(fs.readFileSync(template_path, {encoding: "utf8"}));
                    template_list.push(template_data);
                }
            }
        }
        catch (error) {
            alert(error);
        }
    }
    else if (platform === 'WEB') {
        // add later;
    }

    templates_select_list.innerHTML = '<option disabled selected value> -- Select Template -- </option>';
    for (let i in template_list)
    {
        if (template_list.hasOwnProperty(i))
        {
            let template_data = template_list[i];
            let template_option = document.createElement('option');
            template_option.value = i;
            template_option.innerText = template_data.name;
            templates_select_list.appendChild(template_option);
        }

    }
};

const create_attribute_test_frame = function(attribute_data, attribute_name) {
    let element = document.createElement('div');
    element.className = 'attribute-test-frame';
    element.id = 'attribute-test-frame:'+attribute_name;

    let elementName = document.createElement('div');
    elementName.innerText = attribute_data._name;
    element.appendChild(elementName);

    let elementValue;
    if (attribute_data._type === 'boolean')
    {
        elementValue = document.createElement('select');
        elementValue.innerHTML = String(attribute_data._value);
        let elementValueTrue = document.createElement('option');
        elementValueTrue.value = 'true';
        elementValueTrue.innerText = 'true';
        //elementValueTrue.selected = attribute_data._value === true;
        elementValue.appendChild(elementValueTrue);
        let elementValueFalse = document.createElement('option');
        elementValueFalse.value = 'false';
        elementValueFalse.innerText = 'false';
        //elementValueFalse.selected = attribute_data._value === false;
        elementValue.appendChild(elementValueFalse);
        elementValue.value = attribute_data._value;
    }
    else {
        elementValue = document.createElement('input');
        if (attribute_data._type === 'integer') {
            elementValue.type = 'number';
        }
        else {
            elementValue.type = 'text';
        }
        elementValue.value = attribute_data._value;
    }
    elementValue.disabled = !attribute_data._set.includes('manual');
    element.appendChild(elementValue);

    let elementAttributeID = document.createElement('a');
    elementAttributeID.innerText = attribute_name;
    elementAttributeID.style = 'opacity: 0.5; font-size: 80%';
    elementAttributeID.title = attribute_data.hasOwnProperty('_effects') ? attribute_data._effects.map((value)=>(value.function.toString())).join('\n\n\n') : undefined;
    element.appendChild(elementAttributeID);

    return element;
}

const update_attributes_list = function() {
    attributes_frame.innerHTML = '';
    for (let attribute_id in attributes) {
        let attribute = attributes[attribute_id];
        attributes_frame.appendChild(create_attribute_test_frame(attribute, attribute_id));
    }
};

const update_attribute_values = function() {
    let effect_execution_order = effect_ordering(attributes);
    //console.log(JSON.stringify(effect_execution_order));
    for (let attribute_name in attributes) {
        if (attributes.hasOwnProperty(attribute_name))
        {
            if (attributes[attribute_name]._set.includes('auto'))
            {
                attributes[attribute_name]._value = attributes[attribute_name]._default_value;
            }
            else if (attributes[attribute_name]._set.includes('manual'))
            {
                let element = document.getElementById('attribute-test-frame:'+attribute_name);
                if (attributes[attribute_name]._type === 'boolean') {
                    attributes[attribute_name]._value = element.getElementsByTagName('select')[0].value;
                    attributes[attribute_name]._value = attributes[attribute_name]._value === 'true';
                }
                else {
                    attributes[attribute_name]._value = element.getElementsByTagName('input')[0].value;
                    if (attributes[attribute_name]._type === 'integer') {
                        attributes[attribute_name]._value = Number(attributes[attribute_name]._value);
                    }
                }

            }
        }
    }
    for (let attribute_executing_effects_name of effect_execution_order) {
        let attribute_executing_effects = attributes[attribute_executing_effects_name];
        if (attribute_executing_effects.hasOwnProperty('_effects')) {
            for (let effect of attribute_executing_effects['_effects']) {
                // effect.function = function(attributes, functions, self_attribute){...}
                //console.log(effect.function);
                effect.function(attributes, effect_functions, attribute_executing_effects_name);
            }
        }
    }
    for (let attribute_name in attributes) {
        if (attributes.hasOwnProperty(attribute_name)) {
            let element = document.getElementById('attribute-test-frame:'+attribute_name);
            if (attributes[attribute_name]._type === 'boolean')
            {
                element.getElementsByTagName('select')[0].value = attributes[attribute_name]._value;
                console.log(attribute_name+element.getElementsByTagName('select')[0].value);
            }
            else {
                element.getElementsByTagName('input')[0].value = attributes[attribute_name]._value;
                console.log(attribute_name+element.getElementsByTagName('input')[0].value);
            }
        }
    }
}

const init = async function() {
    await update_templates_list();
};

console.log('Platform: '+platform);

const run = async function() {
    if (platform === 'NODE')
    {
        await init();
        nw.Window.get().show();
    }
}

run();