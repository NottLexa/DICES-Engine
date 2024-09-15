// This is a compiler of MCFP module - Formula parser.
// To use this compiler in your version of MCFP, pass other compiled MCFP modules into the arguments of this compiler.
const mfp = function(mfb, mss, mvc, mse) {
    this.digits = '1234567890';
    this.ascii_lowercase = 'abcdefghijklmnopqrstuvwxyz';
    this.ascii_uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.ALPHABET_LOWER = new Set(this.ascii_lowercase);
    this.ALPHABET_UPPER = new Set(this.ascii_uppercase);
    this.DIGITS = new Set(this.digits);

    this.functions_by_operators = {
        '+': 'add',
        '-': 'sub',
        '*': 'mul',
        '/': 'div',
        '&&': 'and',
        '||': 'or',
        '==': 'eq',
        '!=': 'ne',
        '>': 'gt',
        '<': 'lt',
        '>=': 'ge',
        '<=': 'le'
    };

    this.operators_by_priority = [
        ['*', '/'],
        ['+', '-'],
        ['>', '<', '>=', '<='],
        ['==', '!='],
        ['&&', '||'],
    ];

    this.parse = function(string) {
        let formula_parts = mss.split_operators(string);
        if (formula_parts === null || formula_parts === undefined) return null;
        if (formula_parts.length === 1) return this.parse_value(formula_parts[0]);
        if (formula_parts[0] === '-') formula_parts.splice(0, 2, ':neg('+formula_parts[1]+')');
        for (let operators of this.operators_by_priority) {
            for (let operator of operators) {
                let operator_function = this.functions_by_operators[operator];
                let index = 0;
                while (index < formula_parts.length) {
                    if (formula_parts[index] === operator) {
                        if (index > 0) {
                            formula_parts.splice(index-1, 3, ':'+operator_function+'('+formula_parts[index-1]+','+formula_parts[index+1]+')');
                        }
                        else return null;
                    }
                    else index++;
                }
            }
        }
        if (formula_parts.length === 1) return this.parse_value(formula_parts[0]);
        return null;
    }
    this.parse_value = function(string) {
        //console.log(JSON.stringify(string));
        if (string[0] === '(') { // embedding
            return this.parse(mse.get_embedding(string, 0));
        }
        if (string[0] === '[') { // array
            let blocks = [];
            let array_content = mse.get_embedding(string, 0);
            if (array_content === null) return null;
            if (array_content === '') return new mfb.Array();
            let array_elements = mss.split_arguments(array_content, 0);
            if (array_elements === null) return null;
            for (let element of array_elements) {
                let block = this.parse(element);
                if (block === null) return null;
                blocks.push(block);
            }
            return new mfb.Array(...blocks);
        }
        else if (mvc.check_attribute(string)) { // attribute reference
            return new mfb.AttributeReference(string);
        }
        else if (mvc.check_attribute_property(string)) { // attribute's property reference
            let [attribute_id, attribute_property] = string.split(':');
            return new mfb.AttributeReference(attribute_id, property=attribute_property);
        }
        else if (mvc.check_number(string)) { // number
            return new mfb.ConstantValue(Number(string));
        }
        else if (string[0] === ':') { // function
            let arguments;
            let function_name = '';
            let l = 1;
            while (l < string.length) {
                if (string[l] === '(') {
                    arguments = mse.get_embedding(string, l);
                    if (arguments === null) return null;
                    break;
                }
                else function_name += string[l++];
            }
            let blocks = [];
            let split_arguments = mss.split_arguments(arguments, 0);
            if (split_arguments === null) return null;
            for (let argument of split_arguments) {
                let block = this.parse(argument);
                if (block === null) return null;
                blocks.push(block);
            }
            return new mfb.Function(function_name, ...blocks);
        }
        else if (string[0] === '@') { // special value
            if (string === '@self') {
                return new mfb.SelfReference();
            }
            else if (string === '@true') {
                return new mfb.ConstantValue(true);
            }
            else if (string === '@false') {
                return new mfb.ConstantValue(false);
            }
            else return null;
        }
        else if (string[0] === "'") { // string value (single quote mark)
            let embedded_string = mse.get_embedding_singlequotemark(string, 0);
            if (embedded_string === null) return null;
            return new mfb.ConstantValue(embedded_string);
        }
        else if (string[0] === '"') { // string value (double quote mark)
            let embedded_string = mse.get_embedding_doublequotemark(string, 0);
            if (embedded_string === null) return null;
            return new mfb.ConstantValue(embedded_string);
        }
        return null;
    }
}

module.exports = {mfp};