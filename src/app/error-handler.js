const errorTypes = require("../constant/error-types");

const errorHandler = (error, ctx) => {
  let status, message;

  switch (error.message) {
    case errorTypes.NAME_OR_PASSWORD_IS_REQUIRED:
      status = 400; //Bad Request
      message = "用户名或密码不能为空~";
      break;
    case errorTypes.USER_ALREADY_EXISTS:
      status = 409; //Conflict
      message = "用户名已经存在~";
      break;
    case errorTypes.USER_DOES_NOT_EXISTS:
      status = 400; //参数错误
      message = "用户名不存在~";
      break;
    case errorTypes.PASSWORD_IS_INCORRENT:
      status = 400; //参数错误
      message = "密码错误~";
      break;
    case errorTypes.UNAUTHORIZATION:
      status = 401; //未授权
      message = "无效的token~";
      break;
    case errorTypes.UNPERMISSION:
      status = 401; //未授权
      message = "您不具备操作的权限~";
      break;
    default:
      status = 404;
      message = "NOT_FOUND";
  }

  ctx.status = status;
  ctx.body = message;
};

module.exports = errorHandler;