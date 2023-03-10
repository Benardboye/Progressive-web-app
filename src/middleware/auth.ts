import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AppSecret } from "../config/indexDB";
import { UserAtrributes, UserInstance } from "../model/userModel";
// import { VendorAtrributes, VendorInstance } from "../model/vendorModel";
export const auth = async (req: JwtPayload, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization; //HEADER IS SET IN THE LOCAL STORAGE IMMEDIATELY THE USER LOGIN

    if (!authorization) {
      return res.status(401).json({
        Error: "Kindly login",
      });
    }
    const token = authorization.slice(7, authorization.length);
    const validate = await jwt.verify(token, AppSecret);
    
    if (!validate) {
      return res.status(401).json({
        Error: "Unauthorised",
      });
    }
    const {id} = validate as { [key: string]: string }; 

    //FIND USER BY ID
    const user = await UserInstance.findOne({
      where: { id: id } 
    });

    if (!user) {
      return res.status(200).json({
        Error: "Invalid Credentials",
      });
    }
    req.user = validate;
    next();
  } catch (err) {
    return res.status(401).json({
      Error: "Unauthorised",
    });
  }
};

