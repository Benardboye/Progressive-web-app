import { DataTypes, Model } from "sequelize";
import { db } from "../config/indexDB";

export interface UserAtrributes {
  id: string;
  email: string;
  password: string;
  fullName: string;
  interest: string;
  salt: string;
  profilePic: string;
  userName: string;
  phone: string;
  verified: boolean;
  otp: number;
  otp_expiry: Date;
}

export class UserInstance extends Model<UserAtrributes> {}

UserInstance.init(
  {
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: {
            msg: "Email address is required",
          },
          isEmail: {
            msg: "please provide a valid email",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Password is required",
          },
          notEmpty: {
            msg: "provide a password",
          },
        },
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Fullname is required",
          },
        },
      },
      profilePic: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      interest: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      salt: {
          type:DataTypes.STRING,
          allowNull:false,
      },
      userName:{
          type:DataTypes.STRING,
          allowNull:false,
          validate: {
            notNull: {
              msg: "Username is required",
            },
            notEmpty: {
              msg: "Provide a Username",
            },
          }
      },
      phone:{
          type:DataTypes.STRING,
          allowNull:false,
          validate: {
            notNull: {
              msg: "Phone number is required",
            },
            notEmpty: {
              msg: "provide a phone number",
            },
          }
      },
      verified: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      otp:{
          type:DataTypes.NUMBER,
          allowNull:false,
          validate: {
            notNull: {
              msg: "Otp is required",
            },
            notEmpty: {
              msg: "provide an Otp",
            },
          }
      },
      otp_expiry:{
          type:DataTypes.DATE,
          allowNull:false,
          validate: {
            notNull: {
              msg: "Otp expired",
            }
          }
      },
},
{
    sequelize:db,
    tableName:'user'
}
);
