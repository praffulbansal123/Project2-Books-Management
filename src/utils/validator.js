const isValidRequestBody = function (object) {
  return Object.keys(object).length > 0;
};

module.exports =  { isValidRequestBody }