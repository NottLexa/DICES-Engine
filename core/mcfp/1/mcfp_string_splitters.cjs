// This is a compiler of MCFP module - String Splitters.
// To use this compiler in your version of MCFP, pass other compiled MCFP modules into the arguments of this compiler.
const mss = function(mse) {
    this.split_effect_parts = function(string) {
        // splits effect into two parts: receiver attribute (string) and formula (string).

        let effect_receiver = '';
        let effect_receiver_ended = false; // becomes true when finds space after effect_receiver
        let effect_sign = '';
        let effect_formula = '';
        let l = 0;
        while (l < string.length) {
            if ((l < string.length-1) && (string[l]+string[l+1] === '+=')) {
                if (effect_sign === '') {
                    effect_sign = '+=';
                    l++;
                }
                else {
                    return [[effect_receiver, effect_formula], '', 200];
                }
            }
            else if (string[l] === '=') {
                if (effect_sign === '') {
                    effect_sign = '=';
                }
                else {
                    return [[effect_receiver, effect_formula], '', 200];
                }
            }
            else {
                if (effect_sign === '') { // writing to effect_reciever (target attribute)
                    if (string[l] === ' ') {
                        if (effect_receiver === '' || effect_receiver_ended) {}
                        else effect_receiver_ended = true;
                    }
                    else {
                        if (effect_receiver_ended) return [[effect_receiver, effect_formula], '', 201];
                        else effect_receiver += string[l];
                    }
                } // writing to effect_formula
                else {
                    if (mse.ECOS.has(string[l])) {
                        let embedding_chars = mse.EMBEDDING_CHARACTERS[mse.ECO.indexOf(string[l])];
                        let subembedding = mse.get_embedding(string, l);
                        if (subembedding === null) return null;
                        effect_formula += embedding_chars[0] + subembedding + embedding_chars[1];
                        l += subembedding.length + 1;
                    }
                    else effect_formula += string[l];
                }
            }
            l++;
        }
        if (effect_receiver === '' || effect_formula === '' || effect_sign === '') return [[effect_receiver, effect_formula], effect_sign, 202];
        return [[effect_receiver, effect_formula.trim()], effect_sign, 0];
    };

    this.OPERATORS = ['+', '-', '/', '*', '&&', '||', '==', '!=', '>', '<', '>=', '<='];
    this.OPERATORS_SET = new Set(this.OPERATORS);
    this.split_operators = function(string, start = 0) {
        let parts = [];
        let write = '';
        let l = start;
        while (l < string.length) {
            let is_operator = false;
            for (let operator of this.OPERATORS) {
                if (string.slice(l, l+operator.length) === operator) {
                    if (write.length > 0) parts.push(write.trim());
                    write = '';
                    parts.push(string.slice(l, l+operator.length));
                    is_operator = true;
                    l += operator.length;
                }
            }
            if (!is_operator) {
                if (mse.ECOS.has(string[l])) {
                    let embedding_chars = mse.EMBEDDING_CHARACTERS[mse.ECO.indexOf(string[l])];
                    let embedding = mse.get_embedding(string, l);
                    if (embedding === null) return null;
                    write += embedding_chars[0] + embedding + embedding_chars[1];
                    l += embedding.length + embedding_chars[0].length + embedding_chars[1].length;
                }
                else {
                    write += string[l];
                    l++;
                }
            }
        }
        if (write.length > 0) parts.push(write.trim());
        return parts;
    };

    this.split_arguments = function(string, start = 0) {
        let parts = [];
        let write = '';
        let l = start;
        while (l < string.length) {
            if (string[l] === ',') {
                parts.push(write.trim());
                write = '';
                l++;
            }
            else if (mse.ECOS.has(string[l])) {
                let embedding_chars = mse.EMBEDDING_CHARACTERS[mse.ECO.indexOf(string[l])];
                let embedding = mse.get_embedding(string, l);
                if (embedding === null) return null;
                write += embedding_chars[0] + embedding + embedding_chars[1];
                l += embedding.length + embedding_chars[0].length + embedding_chars[1].length;
            }
            else {
                write += string[l];
                l++;
            }
        }
        parts.push(write.trim())
        return parts;
    };

}

module.exports = {mss};