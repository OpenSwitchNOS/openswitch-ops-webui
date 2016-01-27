var re = /(,\surl\("http.*;$)/gm;

module.exports = function(src) {
    this.cacheable();
    return src.replace(re, ';');
}
