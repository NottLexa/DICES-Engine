// This is a compiler of MCFP module - Formula blocks.
// To use this compiler in your version of MCFP, pass other compiled MCFP modules into the arguments of this compiler.
const mfb = function() {
    let mfb_this = this;

    this.ConstantValue = function(value) {
        this.value = value;
    }
    this.AttributeReference = function(attribute_name) {
        this.attribute = attribute_name;
    }
    this.Function = function(function_name, ...args) {
        this.function = function_name;
        this.args = args;
    }

    this.SelfReference = function() {
    }
}

module.exports = {mfb};