exports.get404 = (req, res, next) => {
  res.status(404).render('404', { title: '四百四' });
}

exports.get500 = (req, res, next) => {
  console.log(req);
  res.status(500).render('500', { title: '五百' });
}