function underScore(string = 'unknown', a = 100) {
    console.log(string, new Array(a).join('-'));
}
module.exports = underScore;