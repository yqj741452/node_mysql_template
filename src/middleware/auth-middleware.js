const errorTypes = require("../constant/error-types");
const userService = require("../service/user.service");
const authService = require("../service/auth.service");
const md5Password = require("../util/password-handle");
const jwt = require("jsonwebtoken");
const { PUBLIC_KEY } = require("../app/config");

const verifyLogin = async (ctx, next) => {
  //获取用户名和密码
  const { name, password } = ctx.request.body;
  //判断用户名和密码是否为空
  if (!name || !password) {
    const error = new Error(errorTypes.NAME_OR_PASSWORD_IS_REQUIRED);
    return ctx.app.emit("error", error, ctx);
  }
  //判断用户是否存在
  const result = await userService.getUserByName(name);
  const user = result[0];
  if (!user) {
    const error = new Error(errorTypes.USER_DOES_NOT_EXISTS);
    return ctx.app.emit("error", error, ctx);
  }
  //用户名已经存在，判断密码是否正确
  if (md5Password(password) !== user.password) {
    const error = new Error(errorTypes.PASSWORD_IS_INCORRENT);
    return ctx.app.emit("error", error, ctx);
  }
  ctx.user = user;

  await next();
};

const verifyAuth = async (ctx, next) => {
  //获取token
  const authorization = ctx.headers.authorization;
  if (!authorization) {
    const error = new Error(errorTypes.UNAUTHORIZATION);
    return ctx.app.emit("error", error, ctx);
  }
  const token = authorization.replace("Bearer ", "");
  //验证token
  try {
    const result = jwt.verify(token, PUBLIC_KEY, {
      algorithms: ["RS256"],
    });
    ctx.user = result;
    await next();
  } catch (err) {
    const error = new Error(errorTypes.UNAUTHORIZATION);
    return ctx.app.emit("error", error, ctx);
  }
};

const verifyPermission = async (ctx, next) => {
  const { id } = ctx.user;
  const [resourceKey] = Object.keys(ctx.params);
  const tableName = resourceKey.replace("Id", "");
  const resourceId = ctx.params[resourceKey];
  const result = await authService.checkResource(tableName, resourceId, id);

  if (!result) {
    const error = new Error(errorTypes.UNPERMISSION);
    return ctx.app.emit("error", error, ctx);
  }
  await next();
};

module.exports = {
  verifyLogin,
  verifyAuth,
  verifyPermission,
};
