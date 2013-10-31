
/*
 * GET home page.
 */

exports.index = function(req, res, next){
  res.render('index', { flash: 'Just a little demo of okay authorization' });
};