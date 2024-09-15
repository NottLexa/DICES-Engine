// This is a compiler of MCFP module - Effect Parser.
// To use this compiler in your version of MCFP, pass other compiled MCFP modules into the arguments of this compiler.
const mep = function(mss, mvc, mfp) {
    this.parse_effect = function(effect_code) {
        let parts, effect_type, concl, target_attribute, formula_string, formula_block;
        [parts, effect_type, concl] = mss.split_effect_parts(effect_code);
        //console.log([parts, effect_type]);
        if (concl !== 0) return {target_attribute: null, target_attribute_property: null, formula_block: null, effect_type: null, conclusion: concl};
        [target_attribute, formula_string] = parts;
        if (mvc.check_attribute(target_attribute)) {
            formula_block = mfp.parse(formula_string);
            return {target_attribute: target_attribute, target_attribute_property: 'value', formula_block: formula_block, effect_type: effect_type, conclusion: 0};
        }
        else if (mvc.check_attribute_property(target_attribute)) {
            formula_block = mfp.parse(formula_string);
            let attribute_parts = target_attribute.split(':');
            return {target_attribute: attribute_parts[0], target_attribute_property: attribute_parts[1], formula_block: formula_block, effect_type: effect_type, conclusion: 0};
        }
        return {target_attribute: target_attribute, target_attribute_property: 'value', formula_block: null, effect_type: effect_type, conclusion: 301};
    }
}

module.exports = {mep};