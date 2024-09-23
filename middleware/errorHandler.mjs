const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  if (err.message === 'Invalid Product ID') {
      return res.status(400).render('400', { message: 'The product ID provided is invalid.' });
  }

  if (err.message === 'Product not found') {
      return res.status(404).send('The product you are looking for does not exist.' );
  }

  if (err.message === 'Product category not found') {
      return res.status(500).render('error/500', { message: 'The product category is missing. Please contact support.' });
  }

  // For other errors, show a generic error page
  res.status(500).render('errorPage', { message: 'Something went wrong. Please try again later.' });
};

export default  errorHandler;
