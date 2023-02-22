import express, { Request, Response, NextFunction } from "express";

import {
    createLikeSchema,
    option
} from "../utils";
import { LikeAtrributes, LikeInstance } from "../model/likesModel";
import { v4 as uuidv4 } from "uuid";

import { JwtPayload } from "jsonwebtoken";

export const CreateLike = async (req: JwtPayload, res: Response) => {
  try {

    const id = req.user.id;

    const { title, url } = req.body;

    let uuidlike = uuidv4();
    const validateResult = createLikeSchema.validate(req.body, option);

    if (validateResult.error) {
      return res
        .status(400)
        .json({ Error: validateResult.error.details[0].message });
    }

      await LikeInstance.create({
        id: uuidlike, //This generate the unique Id
        title,
        url,
      userId:id
       
      });


      return res.status(201).json({
        Message: "News added to your likes",
      });
    
    } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ Error: "Internal Server Error", route: "/like/create" });
  }
};