const responseHandler = (req, res, next) => {
  res.sendResponse = ({data, status = 200, messsage = "Success"}) => {
    const response = {
      status,
      messsage,
      data,
    };
    res.status(status).json(response);
  };

  next();
};

module.exports = responseHandler;
