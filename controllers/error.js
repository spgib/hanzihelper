exports.render404 = (req, res, next) => {
  res.status(404).render('404', { title: '四百四' });
}

exports.render500 = (req, res, next) => {
  res.status(500).render('500', { title: '五百' });
}