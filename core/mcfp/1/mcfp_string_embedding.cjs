// This is a compiler of MCFP module - Formula blocks.
// To use this compiler in your version of MCFP, pass other compiled MCFP modules into the arguments of this compiler.
const mse = function() {
    this.EMBEDDING_CHARACTERS = [
        ['(', ')'],
        ['[', ']'],
        ['{', '}'],
    ];
    this.ECO = []; // ECO = Embedding Characters Open, array that contains all symbols that can be the start of embedding.
    for (let characters of this.EMBEDDING_CHARACTERS) this.ECO.push(characters[0]);
    this.ECOS = new Set(this.ECO); // ECOS = Embedding Characters Open Set, same as ECO, but is a set.

    this.get_embedding = function(string, start = 0) {
        let write = '';
        if (start >= string.length) return null;
        if (!this.ECOS.has(string[start])) return null;
        let embedding_chars = this.EMBEDDING_CHARACTERS[this.ECO.indexOf(string[start])];
        let l = start+1;
        while (l < string.length) {
            if (string[l] === embedding_chars[1]) { // the end of embedding
                return write;
            }
            else if (this.ECOS.has(string[l])) { // other embedding inside of this embedding
                let subembedding_chars = this.EMBEDDING_CHARACTERS[this.ECO.indexOf(string[l])];
                let subembedding = this.get_embedding(string, l);
                if (subembedding === null) return null;
                write += subembedding_chars[0] + subembedding + subembedding_chars[1];
                l += subembedding.length + subembedding_chars[0].length + subembedding_chars[1].length;
            }
            else { // other character
                write += string[l];
                l++;
            }
        }
        return null;
    }

    this.get_embedding_singlequotemark = function(string, start = 0) {
        let write = '';
        if (start >= string.length) return null;
        let l = start+1;
        while (l < string.length) {
            if (string[l] === "'") { // the end of embedding
                return write;
            }
            else if (l < string.length-1 && (string[l]+string[l+1] === "\\'")) {
                write += "'";
                l += 2;
            }
            else { // other character
                write += string[l];
                l++;
            }
        }
        return null;
    }

    this.get_embedding_doublequotemark = function(string, start = 0) {
        let write = '';
        if (start >= string.length) return null;
        let l = start+1;
        while (l < string.length) {
            if (string[l] === '"') { // the end of embedding
                return write;
            }
            else if (l < string.length-1 && (string[l]+string[l+1] === '\\"')) {
                write += '"';
                l += 2;
            }
            else { // other character
                write += string[l];
                l++;
            }
        }
        return null;
    }
}

module.exports = {mse};