

/*
 * GET home page.
 */

exports.test = function(req, res){
  res.render('index', { title: 'YO TEST' });
};
