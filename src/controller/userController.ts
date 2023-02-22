import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import {
  registerSchema,
  option,
  GeneratePassword,
  GenerateSalt,
  GenerateOTP,
  onRequestOtp,
  mailsent,
  emailHtml,
  GenerateSignature,
  verifySignature,
  loginSchema,
  validatePassword,
  updateSchema,
  forgotPasswordSchema,
  forgotPasswordmailHtml,
  resetPasswordSchema, 
  updateEmaillHtml, 
  updateEmailSchema, 
  updatePasswordlHtml, 
  updatePasswordSchema
} from "../utils";
import { UserAtrributes, UserInstance } from "../model/userModel";
import { v4 as uuidv4 } from "uuid";
import { string } from "joi";
import { FromAdminMail, userSubject, forgotPasswordSubject, updatePasswordSubject, updateEmailSubject} from "../config/indexDB";
import { JwtPayload } from "jsonwebtoken";
import { LikeInstance } from "../model/likesModel";

export const Register = async (req: Request, res: Response) => {
  try {
    // Receive user's details and confirm if they match with the way it should be provided in the schema
    const { email, phone, password, interest, userName, fullName, confirm_password } = req.body;
    let uuiduser = uuidv4();
    const validateResult = registerSchema.validate(req.body, option);

    if (validateResult.error) {
      return res.status(400).json({ Error: validateResult.error.details[0].message });
    }

    // Generate salt
    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    // Generate OTP
    const { otp, expiry } = GenerateOTP();

    // Check if the user exist
    const User = (await UserInstance.findOne({
      where: { email: email },
    })) as unknown as UserAtrributes;

    // Create user
    if (!User) {
      let user = await UserInstance.create({
        id: uuiduser,
        email,
        password: userPassword,
        fullName,
        profilePic:"",
        interest,
        salt,
        userName,
        phone,
        verified:false,
        otp,
        otp_expiry: expiry,
      });

      // Send OTP to user
      await onRequestOtp(otp, phone);

      // Send email to user
      const html = emailHtml(otp);
      await mailsent(FromAdminMail, email, userSubject, html);

      // Check if the user exist
      const User = (await UserInstance.findOne({
        where: { email: email },
      })) as unknown as UserAtrributes;

      // Generate signature
      let signature = await GenerateSignature({
        id: User.id,
        email: User.email,
        verified:User.verified,
      });

      return res.status(201).json({
        Message: "User Successfully Registered. Check your email or phone number for OTP verification",
        signature,
      });
    }

    return res.status(400).json({ Error: "User already exists" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ Error: "Internal Server Error", route: "/user/signup" });
  }
};

/**======================================================
 * Verify Users
 *======================================================**/

 export const VerifyUser = async (req: Request, res: Response) => {
  try {
    const token = req.params.signature;
    const decode = await verifySignature(token);

    // Check if the user is a registered user
    const User = (await UserInstance.findOne({
      where: { email: decode.email },
    })) as unknown as UserAtrributes;

    if (User) {
      const { otp } = req.body;

      if (User.otp === parseInt(otp) && User.otp_expiry >= new Date()) {
        // 30 minutes greater than the current time (4:30PM >= 4:15PM)
        const updatedUser = (await UserInstance.update(
          { verified: true },
          { where: { email: decode.email } }
        )) as unknown as UserAtrributes;

        // Generate a new signature
        let signature = await GenerateSignature({
          id: updatedUser.id,
          email: updatedUser.email,
          verified: updatedUser.verified,
        });

        if (updatedUser) {
          const User = (await UserInstance.findOne({
            where: { email: decode.email },
          })) as unknown as UserAtrributes;

          return res.status(200).json({
            Message: "Verification Successful",
            signature,
            verified: User.verified,
          });
        }
      }
    }

    return res.status(400).json({
      Error: "Invalid Credentials or OTP is already expired",
    });
  } catch (err) {
    // Catch any error that may occur during the execution of the function
    console.error(err);
    return res
      .status(500)
      .json({ Error: "Internal Server Error", route: "/user/verify" });
  }
};

/**====================* Login *========================**/

export const Login = async (req: Request, res: Response) => {
  try {
    // Receive users details and confirm if they match with the way
    // it should be provided in the schema
    const { email, password } = req.body;
    const validateResult = loginSchema.validate(req.body, option);

    if (validateResult.error) {
      return res
        .status(400)
        .json({ Error: validateResult.error.details[0].message });
    }

    // Find user by email
    const User = (await UserInstance.findOne({
      where: { email: email },
    })) as unknown as UserAtrributes;

    if (User && User.verified == true) {
      let validation = await validatePassword(
        password,
        User.password,
        User.salt
      );

      if (validation) {
        // Generate a new signature
        let signature = await GenerateSignature({
          id: User.id,
          email: User.email,
          verified: User.verified,
        });

        return res.status(200).json({
          Message: "You have successfully logged in",
          signature,
          userName: User.userName,
          email: User.email,
          verified: User.verified,
        });
      }
    }

    return res.status(400).json({
      Error: "Wrong Credentials or not a verified user",
    });
  } catch (err) {
    // Catch any error that may occur during the execution of the function
    console.error(err);
    return res
      .status(500)
      .json({ Error: "Internal Server Error", route: "/user/login" });
  }
};

/**======================================================   Resend OTP   =================================================================**/

export const ResendOtp = async (req: Request, res: Response) => {
  try {
    const token = req.params.signature;
    const decode = await verifySignature(token);

    // CHECK IF THE USER IS A REGISTERED USER
    const User = (await UserInstance.findOne({
      where: { email: decode.email },
    })) as unknown as UserAtrributes;

    if (User) {
      //GENRATE OTP
      const { otp, expiry } = GenerateOTP();
      const updatedUser = (await UserInstance.update(
        {
          otp,
          otp_expiry: expiry,
        },
        {
          where: { email: decode.email },
        }
      )) as unknown as UserAtrributes;

      //SEND OTP
      if (updatedUser) {
        const User = (await UserInstance.findOne({
          where: { email: decode.email },
        })) as unknown as UserAtrributes;

        await onRequestOtp(otp, User.phone);

        //SEND EMAIL TO USER
        const html = emailHtml(otp);
        await mailsent(FromAdminMail, User.email, userSubject, html);

        return res.status(200).json({
          Message: "OTP resent successfully",
        });
      }
      return res.status(400).json({
        Error: "Error sending OTP",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      Error: "Internal Server Error",
      route: "/user/resend-otp/:signature",
    });
  }
};

/**====================================================== GET ALL USER FOR ADMIN   =================================================================**/

export const getAllUser = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit as number | undefined; //LIMIT IS BASICALLY FOR PAGINATION(TO SHOW THE NUMBER OF USERS PER PAGE)
    // const sort = req.query.sort    //FOR SORTING
    const users = await UserInstance.findAndCountAll({
      limit: limit,
    }); //FINDALL({}) METHOD CAN BE USED TOO BUT IT DOESN'T HAVE THE COUNT AND ROW FEATURE
    return res.status(200).json({
      Message: "You have successfully retrived all users",
      count: users.count,
      users: users.rows,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      Error: "Internal Server Error",
      route: "/user/get-all-users",
    });
  }
};

/**======================================================  USER PROFILE  =================================================================**/

export const userProfile = async (
  req: JwtPayload,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.user.id;

    //FIND USER BY ID
    const User = await UserInstance.findOne({
      where: { id: id },
      include: [ 
              {
                  model: LikeInstance, 
                  as: "like",
                  
              }  
          ]
    });
    if (User) {
      console.log(User)
      return res.status(200).json({
        User
      });
    }
      return res.status(400).json({
        Error: "User not found",
      });
    
  } catch (err) {
    return res.status(500).json({
      Error: "Internal Server Error",
      route: "/user-profile",
    });
  }
};


/**======================================================  UPDATE USER NAMES   =================================================================**/

export const updateUserProfile = async(req:JwtPayload, res: Response) => {
try{
  const id = req.user.id;
  const {fullName, userName } = req.body

  //JOI VALIDATION
  const validateResult = updateSchema.validate(req.body, option) 
  if (validateResult.error) {
    return res
      .status(400)
      .json({ Error: validateResult.error.details[0].message });
  }

  //CHECK IF THE USER IS A REGISTERED USER
  const User = await UserInstance.findOne({where:{id:id}}) as unknown as UserAtrributes
  if(!User) {
    return res.status(400).json({
      Error:"Kindly Login"
    })
  }
  const updatedUser = await UserInstance.update({
    fullName,
    userName,
  }, {where:{id:id}}) as unknown as UserAtrributes
  if(updatedUser) {
    const User = await UserInstance.findOne({where:{id:id}}) as unknown as UserAtrributes
return res.status(200).json({
  Message:"You have successfully updated your profile",
  User
})
  }
  return res.status(400).json({
    Error:"Error Occured"
  })
} catch (err) {
  return res.status(500).json({
    Error: "Internal Server Error",
    route: "/user/update-profile",
  });
}
}


/**======================================================  FORGOT PASSWORD  =================================================================**/

export const forgotPassword = async(req:JwtPayload, res: Response) => {
  try{
    const {email } = req.body
  
    //JOI VALIDATION
    const validateResult = forgotPasswordSchema.validate(req.body, option) 
    if (validateResult.error) {
      return res
        .status(400)
        .json({ Error: validateResult.error.details[0].message });
    }
    //CHECK IF THE USER IS A REGISTERED USER
    const User = await UserInstance.findOne({where:{email:email}}) as unknown as UserAtrributes
    if(!User) {
      return res.status(400).json({
        Error:"User doesn't exist"
      })
    }

    //SEND EMAIL TO USER
    const html = forgotPasswordmailHtml(User.id);
    await mailsent(FromAdminMail, email, forgotPasswordSubject, html);

  return res.status(200).json({
    Message:"Password reset link has been sent you to mail box",
  })
  } catch (err) {
    return res.status(500).json({
      Error: "Internal Server Error",
      route: "/user/forgot-password",
    });
  }
  }


  /**======================================================  RESET PASSWORD  =================================================================**/

export const resetPassword = async(req:Request, res: Response) => {
  try{
    const id = req.params.id
    console.log(id)
    const {password } = req.body

    //JOI VALIDATION
    const validateResult = resetPasswordSchema.validate(req.body, option) 
    if (validateResult.error) {
      return res
        .status(400)
        .json({ Error: validateResult.error.details[0].message });
    }
  
    //CHECK IF THE USER IS A REGISTERED USER
    const User = await UserInstance.findOne({where:{id:id}}) as unknown as UserAtrributes
    if(!User) {
      return res.status(400).json({
        Error:"User doesn't exist"
      })
    }

     //GENERATE SALT
     const salt = await GenerateSalt();
     const userPassword = await GeneratePassword(password, salt);

    const updatePassword = await UserInstance.update({
      password:userPassword,
      salt
    }, {where:{id:id}}) as unknown as UserAtrributes
    if(updatePassword) {
  return res.status(200).json({
    Message:"Your password has be updated, kindly login",

  })
    }
    return res.status(400).json({
      Error:"Error Occured"
    })
  } catch (err) {
    return res.status(500).json({
      Error: "Internal Server Error",
      route: "/user/reset-password/:id",
    });
  }
  }



  /**======================================================  UPDATE EMAIL REQUEST =================================================================**/

export const updateEmailRequest = async(req:JwtPayload, res: Response) => {
  try{
    const {id} = req.user
    const {preEmail, newEmail} = req.body
    console.log("old", preEmail)
    console.log("new", newEmail)
  
      //JOI VALIDATION
      const validateResult = updateEmailSchema.validate(req.body, option) 
      if (validateResult.error) {
        return res
          .status(400)
          .json({ Error: validateResult.error.details[0].message });
      }

    //CHECK IF THE USER IS A REGISTERED USER
    const User = await UserInstance.findOne({where:{id:id}}) as unknown as UserAtrributes
    if(!User) {
      return res.status(400).json({
        Error:"Kindly login"
      })
    }

    if(User.email !== preEmail){
      return res.status(400).json({
        Error:"Kindly provide a correct current email"
      })
    }

    //SEND EMAIL TO USER
    const html = updateEmaillHtml(newEmail);
    await mailsent(FromAdminMail, newEmail, updateEmailSubject, html);

  return res.status(200).json({
    Message:"Verification link has been sent to your email address",
  })
  } catch (err) {
    return res.status(500).json({
      Error: "Internal Server Error",
      route: "/user/email-update",
    });
  }
  }


 /**======================================================  UPDATE EMAIL  =================================================================**/

export const updateEmail = async(req:JwtPayload, res: Response) => {
  try{
    const email = req.params.email
    const {id} = req.user
    console.log(id)
    console.log(email)

     // Check if the user exist
     const User = (await UserInstance.findOne({
      where: { email: email },
    })) as unknown as UserAtrributes;

    
    if (User) {
      return res.status(400).json({
        Error:"Email exit for another user"
      })
    }

    // Update user's email in the database
    const updateEmail = await UserInstance.update({
      email
    }, {where:{id:id}}) as unknown as UserAtrributes
  
    // If update successful, send success response
    if(updateEmail) {
      return res.status(200).json({
        Message:"Your email has be updated, kindly login",
      })
    }
    // If update unsuccessful, send error response
    return res.status(400).json({
      Error:"Error Occured"
    })
  } catch (err) {
    // If error occurred, send internal server error response
    return res.status(500).json({
      Error: "Internal Server Error",
      route: "/user/email-verification/:email",
    });
  }
}


/**======================================================  UPDATE PASSWORD REQUEST =================================================================**/

export const updatePasswordRequest = async(req:JwtPayload, res: Response) => {
  try{
    const {id} = req.user
    const {prePassword, newPassword} = req.body
  
    //JOI VALIDATION
    const validateResult = updatePasswordSchema.validate(req.body, option) 
    if (validateResult.error) {
      return res
        .status(400)
        .json({ Error: validateResult.error.details[0].message });
    }

    //CHECK IF THE USER IS A REGISTERED USER
    const User = await UserInstance.findOne({where:{id:id}}) as unknown as UserAtrributes
    if(!User) {
      return res.status(400).json({
        Error:"Kindly login"
      })
    }

    // Validate user's current password
    let validation = await validatePassword(
      prePassword,
      User.password,
      User.salt
    );

    // If current password is incorrect, send error response
    if(!validation){
      return res.status(400).json({
        Error:"Kindly provide a correct current password"
      })
    }

    const email = User.email
    //SEND EMAIL TO USER
    const html = updatePasswordlHtml(newPassword);
    await mailsent(FromAdminMail, email, updatePasswordSubject, html);

    // If email is sent successfully, send success response
    return res.status(200).json({
      Message:"Verification link has been sent to your email address",
    })
  } catch (err) {
    // If error occurred, send internal server error response
    return res.status(500).json({
      Error: "Internal Server Error",
      route: "/user/password-update",
    });
  }
}


/**======================================================  UPDATE PASSWORD  =================================================================**/

export const updatePassword = async(req:JwtPayload, res: Response) => {
  try{
    const password = req.params.password
    const {id} = req.user

    //GENERATE SALT
    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    // Update user's password and salt in the database
    const updatePassword = await UserInstance.update({
      password:userPassword,
      salt
    }, {where:{id:id}}) as unknown as UserAtrributes

    // If update successful, send success response
    if(updatePassword) {
      return res.status(200).json({
        Message:"Your password has be updated, kindly login",
      })
    }
    // If update unsuccessful,
    return res.status(400).json({
      Error:"Error Occured"
    })
  } catch (err) {
    return res.status(500).json({
      Error: "Internal Server Error",
      route: "/user/password-verification/:password",
    });
  }
  }




