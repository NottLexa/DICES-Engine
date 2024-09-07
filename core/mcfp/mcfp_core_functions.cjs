var functions = {
    add: (a, b) => (a + b),
    sub: (a, b) => (a - b),
    mul: (a, b) => (a * b),
    div: (a, b) => (a / b),
    floor: (a) => (Math.floor(a)),
    ceil: (a) => (Math.ceil(a)),
    round: (a) => (Math.round(a)),
    and: (a, b) => (a && b),
    or: (a, b) => (a || b),
    eq: (a, b) => (a === b),
    ne: (a, b) => (a !== b),
    gt: (a, b) => (a > b),
    lt: (a, b) => (a < b),
    ge: (a, b) => (a >= b),
    le: (a, b) => (a <= b),
    if: (cond, a, b) => (cond ? a : b),
    lower: (a) => (a.toLowerCase()),
    upper: (a) => (a.toUpperCase()),
};

module.exports = {functions};