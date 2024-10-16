// This is a compiler of MCFP module - JavaScript Converter.
// To use this compiler in your version of MCFP, pass other compiled MCFP modules into the arguments of this compiler.
const mjc = function(mfb) {
    mjc_this = this;

    this.math_operators = {
        'add': '+',
        'sub': '-',
        'mul': '*',
        'div': '/',
        'and': '&&',
        'or': '||',
        'eq': '===',
        'ne': '!==',
        'gt': '>',
        'lt': '<',
        'ge': '>=',
        'le': '<=',
    };

    this.convert_effect = function(target_attribute, formula_block, effect_type, target_attribute_property = 'value') {
        let return_data = {function: null, dependencies: new Set(), target_attribute: target_attribute, target_property: target_attribute_property};
        let [converted_formula, attribute_dependencies] = mjc_this.convert_formula(formula_block);
        if (converted_formula !== null) {
            return_data.function = new Function('attributes', 'functions', 'self_attribute', 'dices_iterator',
                effect_type === '.='
                ? `attributes["${target_attribute}"]._${target_attribute_property}.push(...${converted_formula})`
                : `attributes["${target_attribute}"]._${target_attribute_property} ${effect_type} `+converted_formula);
            return_data.dependencies = attribute_dependencies;
        }
        return return_data;
    }

    this.convert_formula = function(formula_block) {
        let converted_formula = '';
        let attribute_dependencies = new Set();
        switch (formula_block.constructor) {
            case mfb.ConstantValue:
                if (typeof formula_block.value === 'string') {
                    converted_formula = JSON.stringify(formula_block.value);
                }
                else {
                    converted_formula = String(formula_block.value);
                }
                break;
            case mfb.AttributeReference:
                if (formula_block.property !== undefined) {
                    converted_formula = `attributes["${formula_block.attribute}"]._`+formula_block.property;
                    attribute_dependencies.add(formula_block.attribute);
                }
                else {
                    converted_formula = `attributes["${formula_block.attribute}"]._value`;
                    attribute_dependencies.add(formula_block.attribute);
                }

                break;
            case mfb.Function:
                let converted_args = [];
                for (let arg of formula_block.args) {
                    let [converted_argument, argument_attribute_dependencies] = this.convert_formula(arg);
                    if (converted_argument === null) return [null, []];
                    for (let dependency of argument_attribute_dependencies) {
                        attribute_dependencies.add(dependency);
                    }
                    converted_args.push(converted_argument);
                }
                if (mjc_this.math_operators.hasOwnProperty(formula_block.function) && false) {
                    converted_formula = `(${converted_args[0]}${mjc_this.math_operators[formula_block.function]}${converted_args[1]})`;
                }
                else {
                    converted_formula = `functions["${formula_block.function}"](${converted_args.join(',')})`;
                }
                break;
            case mfb.SelfReference:
                converted_formula = 'attributes[self_attribute]._value';
                attribute_dependencies.add('@self');
                break;
            case mfb.Array:
                let converted_elements = [];
                for (let element of formula_block.array) {
                    let [converted_argument, argument_attribute_dependencies] = this.convert_formula(element);
                    if (converted_argument === null) return [null, []];
                    for (let dependency of argument_attribute_dependencies) attribute_dependencies.add(dependency);
                    converted_elements.push(converted_argument);
                }
                converted_formula = `[${converted_elements.join(',')}]`;
                break;
            case mfb.Dice:
                let [amount, amount_attribute_dependencies] = this.convert_formula(formula_block.amount);
                let [magnitude, magnitude_attribute_dependencies] = this.convert_formula(formula_block.magnitude);
                if (amount === null || magnitude === null) return [null, []];
                for (let dependency of amount_attribute_dependencies) attribute_dependencies.add(dependency);
                for (let dependency of magnitude_attribute_dependencies) attribute_dependencies.add(dependency);
                converted_formula = `Array(${amount}).fill(undefined).map((value) => (dices_iterator.get(${magnitude}))).reduce((partialSum, a) => partialSum + a, 0)`;
                break;
            default:
                return [null, []];
        }
        return [converted_formula, attribute_dependencies];
    }
}

module.exports = {mjc};