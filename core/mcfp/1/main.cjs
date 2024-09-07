var {mep} = require('./mcfp_effect_parser.cjs');
var {mss} = require('./mcfp_string_splitters.cjs');
var {mfb} = require('./mcfp_formula_blocks.cjs');
var {mfp} = require('./mcfp_formula_parser.cjs');
var {mvc} = require('./mcfp_validity_checker.cjs');
var {mse} = require('./mcfp_string_embedding.cjs');
var {mjc} = require('./mcfp_javascript_converter.cjs');

var _mse = new mse();
var _mvc = new mvc();
var _mss = new mss(_mse);
var _mfb = new mfb();
var _mfp = new mfp(_mfb, _mss, _mvc, _mse);
var _mep = new mep(_mss, _mvc, _mfp);
var _mjc = new mjc(_mfb);

var parse_effect = _mep.parse_effect;
var js_convert = _mjc.convert_effect;

//console.log(_mfp.parse('3>2'))

//var effect = parse_effect("saving_throws.bonus.strength = (:lower(@self) == 'warrior')");
//console.log(effect);
//console.log(js_convert(effect.target_attribute, effect.formula_block, effect.effect_type).function.toString());

module.exports = {parse_effect, js_convert};