import {
  AccountUser,
  AccountPassword,
  GmailUser,
  GmailPass,
  FromAdminMail,
  userSubject,
  forgotPasswordSubject
} from "../config/indexDB";
import nodemailer from "nodemailer";
import { string } from "joi";
import { transport } from "pino";
import { response } from "express";
import axios from "axios"


export const GenerateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 9000); //CHANGE 100000 TO 1000 TO HAVE 4 DIGITS OTP
  const expiry = new Date();
  expiry.setTime(new Date().getTime() + 30 * 60 * 1000);
  return { otp, expiry };
};

export const onRequestOtp = async (otp: number, toPhoneNumber:string) => {
 
  const authorization = 'Basic ' + Buffer.from(`${AccountUser}:${AccountPassword}`).toString('base64');


  const data = {
    messages: [
      {
        destinations: [
          {
            to: toPhoneNumber
          }
        ],
        from: 'InfoSMS',
        text: `Your verification code is: ${otp}` // customize this message to include the OTP value
      }
    ]
  };

  const config = {
    url: 'https://89qdx9.api.infobip.com/sms/2/text/advanced',
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    data: JSON.stringify(data)
  };

  try {
    const response = await axios(config);
    console.log(response.data); // handle the response as needed
  } catch (error) {
    console.error(error); // handle the error as needed
  }
};


export const transporter = nodemailer.createTransport({
  service: "gmail", // SAME AS HOST
  auth: {
    user: GmailUser,
    pass: GmailPass,
  },
  tls: {
    rejectUnauthorized: false, //TELLING THE NODEMAILER TO ENSURE THAT
    //THE MAIL IS SENT TO THE USER AND SEND RESPONSE IF IT COULD NOT DELIVER PROBABLY DUE TO WRONG EMAIL ADDRESS
  },
});
    // sender address. // list of receivers // Subject line // text:string, // plain text body // html body
export const mailsent = async(
    from:string, 
    to:string, 
    subject:string, 
    html:string, 
) => {
    try{
        //THE ARRANGEMENT BELOW IS IMPORTANT. FROM-TO-SUBJECT-HTML
        const response = await transporter.sendMail({
            from: FromAdminMail, 
            to,
            subject,
            html
        })
        return response
    } catch(err){
        console.log(err)
    }
}
  //FUNCTION FOR HTML TEMPLATE
export const emailHtml = (otp:number):string => {
    let response = `

<table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
  <tr>
    <td style="height:40px;">&nbsp;</td>
  </tr>
  <tr>
    <td style="padding:0 35px;">
      <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Welcome to BOYE Sport Channel</h1>
      <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
      <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
      Thank you for creating an account with BOYE Sport channel. Use the following OTP to complete your Sign Up procedures. OTP is valid for 30 minutes.
      </p>
      <p href="" style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">${otp}</p>
    </td>
  </tr>
  <tr>
    <td style="height:40px;">&nbsp;</td>
  </tr>
</table>
</td>
<tr>
<td style="height:20px;">&nbsp;</td>
</tr>
<tr>
<td style="text-align:center;">
</td>
</tr>
<tr>
<td style="height:80px;">&nbsp;</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding: 10px 10px 5px;" align="center" valign="top" class="brandInfo">
<p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">©&nbsp;Boye Sport Inc. | 800 Broadway, Suite 1500 | New York, NY 000123, USA.</p>
</td>
</tr>
<tr>
<td style="padding: 0px 10px 20px;" align="center" valign="top" class="footerLinks">
<p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0"> <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">View Web Version </a>&nbsp;|&nbsp; <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Email Preferences </a>&nbsp;|&nbsp; <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Privacy Policy</a>
</p>
</td>
</tr>
<tr>
<td style="padding: 0px 10px 10px;" align="center" valign="top" class="footerEmailInfo">
<p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">If you have any quetions please contact us <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">support@mail.com.</a>
<br> <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Unsubscribe</a> from our mailing lists</p>
</td>
</tr>
</table>
    `
    return response
}


//FUNCTION FOR HTML TEMPLATE
export const forgotPasswordmailHtml = (id:string):string => {
  let response = `
<table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                <tr>
                  <td style="height:40px;">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding:0 35px;">
                    <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                      requested to reset your password</h1>
                    <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                    <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                      We cannot simply send you your old password. A unique link to reset your
                      password has been generated for you. To reset your password, click the
                      following link and follow the instructions.
                    </p>
                    <a href="http://localhost:3000/reset-password/${id}" style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                      Password</a>
                  </td>
                </tr>
                <tr>
                  <td style="height:40px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          <tr>
            <td style="height:20px;">&nbsp;</td>
          </tr>
          <tr>
            <td style="text-align:center;">
            </td>
          </tr>
          <tr>
            <td style="height:80px;">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
    <td style="padding: 10px 10px 5px;" align="center" valign="top" class="brandInfo">
      <p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">©&nbsp;Boye Sport Inc. | 800 Broadway, Suite 1500 | New York, NY 000123, USA.</p>
    </td>
  </tr>
  <tr>
    <td style="padding: 0px 10px 20px;" align="center" valign="top" class="footerLinks">
      <p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0"> <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">View Web Version </a>&nbsp;|&nbsp; <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Email Preferences </a>&nbsp;|&nbsp; <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Privacy Policy</a>
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding: 0px 10px 10px;" align="center" valign="top" class="footerEmailInfo">
      <p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">If you have any quetions please contact us <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">support@mail.com.</a>
        <br> <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Unsubscribe</a> from our mailing lists</p>
    </td>
  </tr>
  </table>
  `
  return response
}


export const updateEmaillHtml = (email:string):string => {
  let response = `
  <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
  <tr>
    <td style="height:40px;">&nbsp;</td>
  </tr>
  <tr>
    <td style="padding:0 35px;">
      <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
        requested to update your email address</h1>
      <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
      <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
        Kindly click the following link for your email address verification.
      </p>
      <a href="http://localhost:3001/api/email-verification/${email}" style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Verify Email</a>
    </td>
  </tr>
  <tr>
    <td style="height:40px;">&nbsp;</td>
  </tr>
</table>
</td>
<tr>
<td style="height:20px;">&nbsp;</td>
</tr>
<tr>
<td style="text-align:center;">
</td>
</tr>
<tr>
<td style="height:80px;">&nbsp;</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding: 10px 10px 5px;" align="center" valign="top" class="brandInfo">
<p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">©&nbsp;Boye Sport Inc. | 800 Broadway, Suite 1500 | New York, NY 000123, USA.</p>
</td>
</tr>
<tr>
<td style="padding: 0px 10px 20px;" align="center" valign="top" class="footerLinks">
<p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0"> <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">View Web Version </a>&nbsp;|&nbsp; <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Email Preferences </a>&nbsp;|&nbsp; <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Privacy Policy</a>
</p>
</td>
</tr>
<tr>
<td style="padding: 0px 10px 10px;" align="center" valign="top" class="footerEmailInfo">
<p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">If you have any quetions please contact us <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">support@mail.com.</a>
<br> <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Unsubscribe</a> from our mailing lists</p>
</td>
</tr>
</table>
  `
  return response
}


export const updatePasswordlHtml = (password:string):string => {
  let response = `
  <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
  <tr>
    <td style="height:40px;">&nbsp;</td>
  </tr>
  <tr>
    <td style="padding:0 35px;">
      <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
        requested to update your password</h1>
      <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
      <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
        Kindly click the following link for your password verification.
      </p>
      <a href="http://localhost:3001/api/email-verification/${password}" style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Verify Password</a>
    </td>
  </tr>
  <tr>
    <td style="height:40px;">&nbsp;</td>
  </tr>
</table>
</td>
<tr>
<td style="height:20px;">&nbsp;</td>
</tr>
<tr>
<td style="text-align:center;">
</td>
</tr>
<tr>
<td style="height:80px;">&nbsp;</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding: 10px 10px 5px;" align="center" valign="top" class="brandInfo">
<p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">©&nbsp;Boye Sport Inc. | 800 Broadway, Suite 1500 | New York, NY 000123, USA.</p>
</td>
</tr>
<tr>
<td style="padding: 0px 10px 20px;" align="center" valign="top" class="footerLinks">
<p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0"> <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">View Web Version </a>&nbsp;|&nbsp; <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Email Preferences </a>&nbsp;|&nbsp; <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Privacy Policy</a>
</p>
</td>
</tr>
<tr>
<td style="padding: 0px 10px 10px;" align="center" valign="top" class="footerEmailInfo">
<p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">If you have any quetions please contact us <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">support@mail.com.</a>
<br> <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Unsubscribe</a> from our mailing lists</p>
</td>
</tr>
</table>
  `
  return response
}