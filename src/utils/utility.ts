import Joi from "joi";
import bcrypt from "bcrypt";
import { AutoPayload } from "../interface";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AppSecret } from "../config/indexDB";

export const registerSchema = Joi.object().keys({
  email: Joi.string().required(),
  phone: Joi.string().required(),
  interest: Joi.string().required(),
  fullName:Joi.string().required(),
  userName:Joi.string().required(),
  password: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")), //Joi.string().(/[a-zA-Z0-9]{6,30}/),
  confirm_password: Joi.any()
    .equal(Joi.ref("password"))
    .required()
    .label("Confirm password")
    .messages({ "any.only": "{{#label}} does not match" }),
});
// To avoid errors with /phone/, /email/ etc
//Example "\"password\" with value \"123456\" fails to
//match the required pattern: /^[a-zA-Z0-9],{6,30}$/"
export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

// HELPER FUNCTION FOR SALT GENERATION
export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

export const GeneratePassword = async (password: string, salt: string) => {
  return await bcrypt.hash(password, salt);
};

export const GenerateSignature = async (payload: AutoPayload) => {
  return jwt.sign(payload, AppSecret, { expiresIn: "1d" }); //FOR 1 WEEK 7d, FOR 1 MONTH 1m
};

export const verifySignature = async (signature: string) => {
  return jwt.verify(signature, AppSecret) as JwtPayload;
};

/**======================================================   Login   =================================================================**/

export const loginSchema = Joi.object().keys({
  email: Joi.string().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")), //Joi.string().(/[a-zA-Z0-9]{6,30}/),
});
// To avoid errors with /phone/, /email/ etc
//Example "\"password\" with value \"123456\" fails to
//match the required pattern: /^[a-zA-Z0-9],{6,30}$/"
// export const option = {
//   abortEarly: false,
//   errors: {
//     wrap: {
//       label: "",
//     },
//   },
// };

//BCRYPT.COMPARE() CAN BE USED INSTEAD OF THE BELOW
export const validatePassword = async (
  enteredPassword: string,
  savedPassword: string,
  salt: string
) => {
  return (await GeneratePassword(enteredPassword, salt)) === savedPassword;
};

/**======================================================   PROFILE SCHEMA   =================================================================**/

export const updateSchema = Joi.object().keys({
  password: Joi.string(),
  fullName: Joi.string(),
  email: Joi.string(),
  userName: Joi.string()
});

/**======================================================   FORGOT PASSWORD   =================================================================**/

export const forgotPasswordSchema = Joi.object().keys({
  email: Joi.string().required()
});

/**======================================================    PASSWORD RESET   =================================================================**/

export const resetPasswordSchema = Joi.object().keys({
  password: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")), //Joi.string().(/[a-zA-Z0-9]{6,30}/),
});

/**======================================================    PASSWORD UPDATE   =================================================================**/

export const updatePasswordSchema = Joi.object().keys({
  prePassword: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")), //Joi.string().(/[a-zA-Z0-9]{6,30}/),
  newPassword: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
});


/**======================================================   EMAIL UPDATE   =================================================================**/

export const updateEmailSchema = Joi.object().keys({
  preEmail: Joi.string(),
  newEmail:Joi.string(),
});


