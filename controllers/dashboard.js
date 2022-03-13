exports.getIndex = (req, res, next) => {
  res.render('index', { title: '你好' });
};

exports.getDashboard = (req, res, next) => {
  res.render('./dashboard/dash', { title: 'DASH' });
};
