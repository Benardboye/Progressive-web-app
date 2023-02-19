import { Sequelize } from "sequelize";
import dotenv from 'dotenv'
dotenv.config()


    //connection is declared here
export const db = new Sequelize('app', "", "",{   
    storage: "./sport.sqlite",
    dialect: 'sqlite',
    logging: false
}) 



export const AccountUser = process.env.ACCOUNTUSER 
export const AccountPassword = process.env.ACCOUNTPASSWORD 
export const forgotPasswordSubject = process.env.FORGOTPASSWORDSUBJECT!
export const updatePasswordSubject = process.env.UPDATEPASSWORD!
export const updateEmailSubject = process.env.UPDATEEMAIL!


export const GmailUser = process.env.GmailUser
export const GmailPass = process.env.GmailPass
export const FromAdminMail = process.env.FromAdminMail as string
export const userSubject = process.env.userSubject as string
export const AppSecret = process.env.AppSecret!      // '!' WORKS JUST LIKE USING AS STRING
