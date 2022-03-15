exports.getIndex = (req, res, next) => {
  res.render('index', { title: '你好' });
};

exports.getDashboard = (req, res, next) => {
  res.render('./dash/dash', { title: 'DASH', dash: true });
};
