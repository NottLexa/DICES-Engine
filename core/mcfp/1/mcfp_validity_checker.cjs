// This is a compiler of MCFP module - Validity Checker.
// To use this compiler in your version of MCFP, pass other compiled MCFP modules into the arguments of this compiler.
const mvc = function() {
    this.attribute_regex_positive = RegExp('^[a-z][a-z_0-9.]*$');
    this.attribute_regex_negative = RegExp('^.*(\\._).*$');
    this.attribute_regex_get_property = RegExp('^[a-z][a-z_0-9.]*:[a-z][a-z_0-9.]*$');
    this.number_regex = RegExp('^[0-9]*$');
    this.dice_regex = RegExp('^[0-9]*d[0-9]*$');

    this.check_attribute = function(string) {
        return this.attribute_regex_positive.test(string) && (!this.attribute_regex_negative.test(string));
    }

    this.check_attribute_property = function(string) {
        return this.attribute_regex_get_property.test(string) && (!this.attribute_regex_negative.test(string));
    }

    this.check_number = function(string) {
        return this.number_regex.test(string);
    }

    this.check_dice = function (string) {
        return this.dice_regex.test(string);
    }
}

module.exports = {mvc};