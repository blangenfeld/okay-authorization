/**
 * toString ref.
 */

var toString = {}.toString;

/**
 * Normalize the given path string,
 * returning a regular expression.
 *
 * An empty array should be passed,
 * which will contain the placeholder
 * key names. For example "/user/:id" will
 * then contain ["id"].
 *
 * @param  {String|RegExp|Array} path
 * @param  {Array} keys
 * @param  {Boolean} sensitive
 * @param  {Boolean} strict
 * @return {RegExp}
 * @api private
 */

exports.pathRegexp = function(path, keys, sensitive, strict) {
  if (toString.call(path) == '[object RegExp]') return path;
  if (Array.isArray(path)) path = '(' + path.join('|') + ')';
  path = path
    .concat(strict ? '' : '/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star){
      keys.push({ name: key, optional: !! optional });
      slash = slash || '';
      return ''
        + (optional ? '' : slash)
        + '(?:'
        + (optional ? slash : '')
        + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
        + (optional || '')
        + (star ? '(/*)?' : '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.*)');
  return new RegExp('^' + path + '$', sensitive ? '' : 'i');
}


/**
 * Decodes a URI component. Returns
 * the original string if the component
 * is malformed.
 *
 * @param  {String} str
 * @return {String}
 * @api private
 */

exports.decode = function(str) {
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
}

/**
 * Flatten the given `arr`.
 *
 * Lifted from express/utils.
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

exports.flatten = function(arr, ret){
  var ret = ret || []
    , len = arr.length;
  for (var i = 0; i < len; ++i) {
    if (Array.isArray(arr[i])) {
      exports.flatten(arr[i], ret);
    } else {
      ret.push(arr[i]);
    }
  }
  return ret;
};

/**
 * Parse the `req` url with memoization.
 * 
 * Lifted from connect/utils.
 *
 * @param {ServerRequest} req
 * @return {Object}
 * @api private
 */

var urlPattern = /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/;
// url:      RegExp['$&'],
// protocol: RegExp.$2,
// host:     RegExp.$3,
// path:     RegExp.$4,
// file:     RegExp.$6,
// query:    RegExp.$7,
// hash:     RegExp.$8

var parse = function(url) {
  parts = urlPattern.exec(url);
  return {
    protocol: !!RegExp.$2 && RegExp.$2.toLowerCase(),
    host:     !!RegExp.$4 && RegExp.$4.toLowerCase(),
    hostname: !!RegExp.$4 && RegExp.$4.toLowerCase(),
    hash:     !!RegExp.$8,
    search:   !!RegExp.$7
  };
};

exports.parseUrl = function(req){
  var parsed = req._parsedUrl;
  if (parsed && parsed.href == req.url) {
    return parsed;
  } else {
    parsed = parse(req.url);
    // if (parsed.auth && !parsed.protocol && ~parsed.href.indexOf('//')) {
    //   // This parses pathnames, and a strange pathname like //r@e should work
    //   parsed = parse(req.url.replace(/@/g, '%40'));
    // }

    return req._parsedUrl = parsed;
  }
};