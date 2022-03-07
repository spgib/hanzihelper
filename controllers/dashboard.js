exports.getIndex = (req, res, next) => {
  res.render('index', { title: '你好'});
};