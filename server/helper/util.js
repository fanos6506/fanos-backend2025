import config from "config";
import jwt from 'jsonwebtoken';
import nodemailer from "nodemailer";
import cloudinary from "cloudinary";
import FCM from "fcm-push";

cloudinary.config({
  cloud_name: config.get("cloudinary.cloud_name"),
  api_key: config.get("cloudinary.api_key"),
  api_secret: config.get("cloudinary.api_secret"),
});

const commonFunction = {
  getOTP() {
    var otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
  },
  
  pushNotification: async (deviceToken, title, body) => {
    try {
      console.log(deviceToken);
      var fcm = new FCM(config.get("serverKey"));
      var message = {
        to: deviceToken, // required fill with device token or topics
        content_available: true,
        notification: {
          title: title,
          body: body,
        },
        android: {
          icon: "https://res.cloudinary.com/mobiloitte-technology-pvt-ltd/image/upload/v1682328539/download_cffp3a.png",
        },
      };
      var result = await fcm.send(message);
      // console.log("736", result)
      return result;
    } catch (error) {
      console.log(error, 1169);
    }
  },

  getOTPFourDigit() {
    var otp = Math.floor(1000 + Math.random() * 9000);
    return otp;
  },

  generateCouponCode(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const codeLength = length || 8; // Default length is 8 characters
    let couponCode = "";

    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      couponCode += characters.charAt(randomIndex);
    }

    return couponCode;
  },

  getToken: async (payload) => {
    var token = await jwt.sign(payload, config.get("jwtsecret"), {
      expiresIn: "365d",
    });
    return token;
  },

  sendAllUsersMailNotification: async (to, title, description) => {
    let html = `<!DOCTYPE HTML
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
 <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
       <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <meta name="x-apple-disable-message-reformatting">
       <meta http-equiv="X-UA-Compatible" content="IE=edge">
       <title></title>
       <style type="text/css">
          table,
          td {
          color: #000000;
          }
          a {
          color: #0000ee;
          text-decoration: underline;
          }
          @media only screen and (min-width: 670px) {
          .u-row {
          width: 650px !important;
          }
          .u-row .u-col {
          vertical-align: top;
          }
          .u-row .u-col-100 {
          width: 650px !important;
          }
          }
          @media (max-width: 670px) {
          .u-row-container {
          max-width: 100% !important;
          padding-left: 0px !important;
          padding-right: 0px !important;
          }
          .u-row .u-col {
          min-width: 320px !important;
          max-width: 100% !important;
          display: block !important;
          }
          .u-row {
          width: calc(100% - 40px) !important;
          }
          .u-col {
          width: 100% !important;
          }
          .u-col>div {
          margin: 0 auto;
          }
          }
          body {
          margin: 0;
          padding: 0;
          }
          table,
          tr,
          td {
          vertical-align: top;
          border-collapse: collapse;
          }
          p {
          margin: 0;
          }
          .ie-container table,
          .mso-container table {
          table-layout: fixed;
          }
          * {
          line-height: inherit;
          }
          a[x-apple-data-detectors='true'] {
          color: inherit !important;
          text-decoration: none !important;
          }
       </style>
       <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
       <!--<![endif]-->
    </head>
    <body class="clean-body u_body"
       style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
       <table
          style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%"
          cellpadding="0" cellspacing="0">
          <tbody>
             <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                   <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                         style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #0C576C;">
                         <div
                            style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                            <div class="u-col u-col-100"
                               style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                               <div style="width: 100% !important;">
                                  <div
                                     stestingMailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                     <!--<![endif]-->
                                     <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                                        cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                           <tr>
                                              <td style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;"
                                                 align="left">
                                                 <table width="100%" cellpadding="0" cellspacing="0"
                                                    border="0">
                                                    <tr>
                                                       <td style="padding-right: 0px;padding-left: 0px;"
                                                          align="center">
                                                          <img align="center" border="0"
                                                             src="http://res.cloudinary.com/mobiloittetech/image/upload/v1687253700/jtuadz3xqylblthhidxq.png"
                                                             alt="Image" title="Image"
                                                             style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 40%;max-width: 500px;"
                                                             width="500" />
                                                       </td>
                                                    </tr>
                                                 </table>
                                              </td>
                                           </tr>
                                        </tbody>
                                     </table>
                                     <table style="font-family:'Montserrat',sans-serif; margin-bottom: 25px;"
                                        role="presentation" cellpadding="0" cellspacing="0" width="100%"
                                        border="0">
                                        <tbody>
                                           <tr>
                                              <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;"
                                                 align="left">
                                                 <div
                                                    style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
                                                    <p
                                                       style="line-height: 170%; text-align: center; font-size: 14px;">
                                                       <span
                                                          style="font-size: 21px; line-height: 40.8px; color: #D39B2D;"><strong>${title}
                                                       </strong></span>
                                                    </p>
                                                 </div>
                                              </td>
                                           </tr>
                                        </tbody>
                                     </table>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                         style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
                         <div
                            style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                            <div class="u-col u-col-100"
                               style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                               <div style="width: 100% !important;">
                                  <div
                                     style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                     <!--<![endif]-->
                                     <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                                        cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                           <tr>
                                              <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;"
                                                 align="left">
                                                 <div
                                                    style="color: #1b262c; line-height: 140%; word-wrap: break-word;">
                                                    </br></br>
                                                    <p style="font-size: 14px; line-height: 140%;"> ${description}
                                                    <p
                                                       style="font-size: 14px; line-height: 140%;">
                                                 </div>
                                              </td>
                                           </tr>
                                        </tbody>
                                     </table>
                                     </br>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                         style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #151418;">
                         <div
                            style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                            </br>
                            <div class="u-col u-col-100"
                               style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                               <div style="width: 100% !important;">
                                  <div
                                     style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                     <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                                        cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                           <tr>
                                              <td style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;"
                                                 align="left">
                                                 <div
                                                    style="color: #ffffff; line-height: 150%; text-align: center; word-wrap: break-word;">
                                                    <a href="https://fanos.one/"
                                                       target="_blank"
                                                       style="font-size: 14px; line-height: 140%;color:white;text-decoration:none;cursor:pointer"><span
                                                       style="font-size: 14px; line-height: 19.6px;">www.fanos.one</span></a>
                                                 </div>
                                              </td>
                                           </tr>
                                        </tbody>
                                     </table>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </td>
             </tr>
          </tbody>
       </table>
    </body>
 </html>`;

    var transporter = nodemailer.createTransport({
      service: config.get("nodemailer.service"),
      auth: {
        user: config.get("nodemailer.email"),
        pass: config.get("nodemailer.password"),
      },
    });
    var mailOptions = {
      from: "<mailto:do_not_reply@gmail.com>",
      to: to,
      subject: "Notification",
      html: html,
    };
    return await transporter.sendMail(mailOptions);
  },

  sendMailFeedback: async (to, email, message) => {
    let html = `<div style="font-size:15px">
                <p>
                  Feedback added Successfully
                </p> 
                <p>
                Thank you for your feedback!<br>
                </p>
            </div>`;

    var transporter = nodemailer.createTransport({
      service: config.get("nodemailer.service"),
      auth: {
        user: config.get("nodemailer.email"),
        pass: config.get("nodemailer.password"),
      },
    });
    var mailOptions = {
      from: config.get("nodemailer.email"),
      to: to,
      subject: "Feedback Email",
      html: html,
    };
    return await transporter.sendMail(mailOptions);
  },
  sendEmailToUserAfterProductApprove: async (email, userName , productName) => {
   var sub = `<!DOCTYPE HTML
   PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
   xmlns:o="urn:schemas-microsoft-com:office:office">
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title></title>
      <style type="text/css">
         table,
         td {
         color: #000000;
         }
         a {
         color: #0000ee;
         text-decoration: underline;
         }
         @media only screen and (min-width: 670px) {
         .u-row {
         width: 650px !important;
         }
         .u-row .u-col {
         vertical-align: top;
         }
         .u-row .u-col-100 {
         width: 650px !important;
         }
         }
         @media (max-width: 670px) {
         .u-row-container {
         max-width: 100% !important;
         padding-left: 0px !important;
         padding-right: 0px !important;
         }
         .u-row .u-col {
         min-width: 320px !important;
         max-width: 100% !important;
         display: block !important;
         }
         .u-row {
         width: calc(100% - 40px) !important;
         }
         .u-col {
         width: 100% !important;
         }
         .u-col>div {
         margin: 0 auto;
         }
         }
         body {
         margin: 0;
         padding: 0;
         }
         table,
         tr,
         td {
         vertical-align: top;
         border-collapse: collapse;
         }
         p {
         margin: 0;
         }
         .ie-container table,
         .mso-container table {
         table-layout: fixed;
         }
         * {
         line-height: inherit;
         }
         a[x-apple-data-detectors='true'] {
         color: inherit !important;
         text-decoration: none !important;
         }
      </style>
      <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
      <!--<![endif]-->
   </head>
   <body class="clean-body u_body"
      style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
      <table
         style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%"
         cellpadding="0" cellspacing="0">
         <tbody>
            <tr style="vertical-align: top">
               <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                  <div class="u-row-container" style="padding: 0px;background-color: transparent">
                     <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #0C576C;">
                        <div
                           style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                           <div class="u-col u-col-100"
                              style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                              <div style="width: 100% !important;">
                                 <div
                                    stestingMailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                    <!--<![endif]-->
                                    <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                                       cellpadding="0" cellspacing="0" width="100%" border="0">
                                       <tbody>
                                          <tr>
                                             <td style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;"
                                                align="left">
                                                <table width="100%" cellpadding="0" cellspacing="0"
                                                   border="0">
                                                   <tr>
                                                      <td style="padding-right: 0px;padding-left: 0px;"
                                                         align="center">
                                                         <img align="center" border="0"
                                                            src="http://res.cloudinary.com/mobiloittetech/image/upload/v1687253700/jtuadz3xqylblthhidxq.png"
                                                            alt="Image" title="Image"
                                                            style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 40%;max-width: 500px;"
                                                            width="500" />
                                                      </td>
                                                   </tr>
                                                </table>
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                    <table style="font-family:'Montserrat',sans-serif; margin-bottom: 25px;"
                                       role="presentation" cellpadding="0" cellspacing="0" width="100%"
                                       border="0">
                                       <tbody>
                                          <tr>
                                             <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;"
                                                align="left">
                                                <div
                                                   style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
                                                   <p
                                                      style="line-height: 170%; text-align: center; font-size: 14px;">
                                                      <span
                                                         style="font-size: 21px; line-height: 40.8px; color: #D39B2D;"><strong>Your Product Has Been Approved!
                                                      </strong></span>
                                                   </p>
                                                </div>
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div class="u-row-container" style="padding: 0px;background-color: transparent">
                     <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
                        <div
                           style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                           <div class="u-col u-col-100"
                              style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                              <div style="width: 100% !important;">
                                 <div
                                    style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                    <!--<![endif]-->
                                    <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                                       cellpadding="0" cellspacing="0" width="100%" border="0">
                                       <tbody>
                                          <tr>
                                             <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;"
                                                align="left">
                                                <div
                                                   style="color: #1b262c; line-height: 140%; word-wrap: break-word;">
                                                   </br></br>
                                                   <p style="font-size: 14px; line-height: 140%;"> Dear ${userName},
                                                   </p>
                                                   <br>
                                                   <p style="font-size: 14px; line-height: 140%;">We are excited to inform you that your product ${productName} has been approved by our platform's administrator. This means that your product is now live and accessible to users on our platform.
                                                      <br><br>
                                                   <p style="font-size: 14px; line-height: 140%;">We appreciate your contribution to our platform and believe that your product will bring great value to our community. We wish you every success with your product and hope it leads to positive experiences for our users.
                                                      <br>
                                                      <br>
                                                      If you have any questions or need further assistance, please do not hesitate to reach out to our support team at fanos6506@gmail.com.
                                                   <p
                                                      style="font-size: 14px; line-height: 140%;">
                                                </div>
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                    </br>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div class="u-row-container" style="padding: 0px;background-color: transparent">
                     <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #151418;">
                        <div
                           style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                           </br>
                           <div class="u-col u-col-100"
                              style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                              <div style="width: 100% !important;">
                                 <div
                                    style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                    <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                                       cellpadding="0" cellspacing="0" width="100%" border="0">
                                       <tbody>
                                          <tr>
                                             <td style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;"
                                                align="left">
                                                <div
                                                   style="color: #ffffff; line-height: 150%; text-align: center; word-wrap: break-word;">
                                                   <a href="https://fanos.one/"
                                                      target="_blank"
                                                      style="font-size: 14px; line-height: 140%;color:white;text-decoration:none;cursor:pointer"><span
                                                      style="font-size: 14px; line-height: 19.6px;">www.fanos.one</span></a>
                                                </div>
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </td>
            </tr>
         </tbody>
      </table>
   </body>
</html>`;
   let transporter = nodemailer.createTransport({
     service: "gmail",
     auth: {
       user: config.get("nodemailer.email"),
       pass: config.get("nodemailer.password"),
     },
   });
   var mailOptions = {
     from: config.get("nodemailer.email"),
     to: email,
     subject: "Your Product Has Been Approved!",
     html: sub,
     // html: html
   };
   return await transporter.sendMail(mailOptions);
 },

 sendEmailToUserAfterProductReject: async (email, userName , productName) => {
   var sub = `<!DOCTYPE HTML
   PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
   xmlns:o="urn:schemas-microsoft-com:office:office">
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title></title>
      <style type="text/css">
         table,
         td {
         color: #000000;
         }
         a {
         color: #0000ee;
         text-decoration: underline;
         }
         @media only screen and (min-width: 670px) {
         .u-row {
         width: 650px !important;
         }
         .u-row .u-col {
         vertical-align: top;
         }
         .u-row .u-col-100 {
         width: 650px !important;
         }
         }
         @media (max-width: 670px) {
         .u-row-container {
         max-width: 100% !important;
         padding-left: 0px !important;
         padding-right: 0px !important;
         }
         .u-row .u-col {
         min-width: 320px !important;
         max-width: 100% !important;
         display: block !important;
         }
         .u-row {
         width: calc(100% - 40px) !important;
         }
         .u-col {
         width: 100% !important;
         }
         .u-col>div {
         margin: 0 auto;
         }
         }
         body {
         margin: 0;
         padding: 0;
         }
         table,
         tr,
         td {
         vertical-align: top;
         border-collapse: collapse;
         }
         p {
         margin: 0;
         }
         .ie-container table,
         .mso-container table {
         table-layout: fixed;
         }
         * {
         line-height: inherit;
         }
         a[x-apple-data-detectors='true'] {
         color: inherit !important;
         text-decoration: none !important;
         }
      </style>
      <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
      <!--<![endif]-->
   </head>
   <body class="clean-body u_body"
      style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
      <table
         style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%"
         cellpadding="0" cellspacing="0">
         <tbody>
            <tr style="vertical-align: top">
               <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                  <div class="u-row-container" style="padding: 0px;background-color: transparent">
                     <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #0C576C;">
                        <div
                           style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                           <div class="u-col u-col-100"
                              style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                              <div style="width: 100% !important;">
                                 <div
                                    stestingMailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                    <!--<![endif]-->
                                    <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                                       cellpadding="0" cellspacing="0" width="100%" border="0">
                                       <tbody>
                                          <tr>
                                             <td style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;"
                                                align="left">
                                                <table width="100%" cellpadding="0" cellspacing="0"
                                                   border="0">
                                                   <tr>
                                                      <td style="padding-right: 0px;padding-left: 0px;"
                                                         align="center">
                                                         <img align="center" border="0"
                                                            src="http://res.cloudinary.com/mobiloittetech/image/upload/v1687253700/jtuadz3xqylblthhidxq.png"
                                                            alt="Image" title="Image"
                                                            style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 40%;max-width: 500px;"
                                                            width="500" />
                                                      </td>
                                                   </tr>
                                                </table>
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                    <table style="font-family:'Montserrat',sans-serif; margin-bottom: 25px;"
                                       role="presentation" cellpadding="0" cellspacing="0" width="100%"
                                       border="0">
                                       <tbody>
                                          <tr>
                                             <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;"
                                                align="left">
                                                <div
                                                   style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
                                                   <p
                                                      style="line-height: 170%; text-align: center; font-size: 14px;">
                                                      <span
                                                         style="font-size: 21px; line-height: 40.8px; color: #D39B2D;"><strong>Your Product Submission Status
                                                      </strong></span>
                                                   </p>
                                                </div>
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div class="u-row-container" style="padding: 0px;background-color: transparent">
                     <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
                        <div
                           style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                           <div class="u-col u-col-100"
                              style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                              <div style="width: 100% !important;">
                                 <div
                                    style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                    <!--<![endif]-->
                                    <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                                       cellpadding="0" cellspacing="0" width="100%" border="0">
                                       <tbody>
                                          <tr>
                                             <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;"
                                                align="left">
                                                <div
                                                   style="color: #1b262c; line-height: 140%; word-wrap: break-word;">
                                                   </br></br>
                                                   <p style="font-size: 14px; line-height: 140%;"> Dear ${userName},
                                                   </p>
                                                   <br>
                                                   <p style="font-size: 14px; line-height: 140%;">We regret to inform you that your product ${productName} has been rejected by our platform's administrator during the review process. Unfortunately, your product does not meet our platform's guidelines and standards for approval.
                                                      <br><br>
                                                   <p style="font-size: 14px; line-height: 140%;">We appreciate your effort in contributing to our platform, and we understand that this news may be disappointing. Our team is committed to maintaining the quality and integrity of our platform, and sometimes, certain criteria must be met to ensure a positive user experience.
                                                      <br>
                                                      <br>
                                                      If you would like more information regarding the specific reasons for the rejection or if you need assistance with improving your product for future submissions, please feel free to reach out to our support team at fanos6506@gmail.com. We are here to help you.
                                                      <br> <br>
                                                      Thank you for considering our platform for your product, and we encourage you to continue exploring opportunities to collaborate and share your work with our community.
                                                   <p
                                                      style="font-size: 14px; line-height: 140%;">
                                                </div>
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                    </br>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div class="u-row-container" style="padding: 0px;background-color: transparent">
                     <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #151418;">
                        <div
                           style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                           </br>
                           <div class="u-col u-col-100"
                              style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                              <div style="width: 100% !important;">
                                 <div
                                    style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                    <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                                       cellpadding="0" cellspacing="0" width="100%" border="0">
                                       <tbody>
                                          <tr>
                                             <td style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;"
                                                align="left">
                                                <div
                                                   style="color: #ffffff; line-height: 150%; text-align: center; word-wrap: break-word;">
                                                   <a href="https://fanos.one/"
                                                      target="_blank"
                                                      style="font-size: 14px; line-height: 140%;color:white;text-decoration:none;cursor:pointer"><span
                                                      style="font-size: 14px; line-height: 19.6px;">www.fanos.one</span></a>
                                                </div>
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </td>
            </tr>
         </tbody>
      </table>
   </body>
</html>`;
   let transporter = nodemailer.createTransport({
     service: "gmail",
     auth: {
       user: config.get("nodemailer.email"),
       pass: config.get("nodemailer.password"),
     },
   });
   var mailOptions = {
     from: config.get("nodemailer.email"),
     to: email,
     subject: "Your Product Submission Status",
     html: sub,
     // html: html
   };
   return await transporter.sendMail(mailOptions);
 },
  getImageUrl: async (files) => {
    var result = await cloudinary.v2.uploader.upload(files, {
      resource_type: "auto",
    });
    return result;
  },

  getSecureUrl: async (base64) => {
    var result = await cloudinary.v2.uploader.upload(base64, {
      resource_type: "auto",
    });
    return result.secure_url;
  },

  generateProductId(count) {
    var str = "" + (count + 1);
    var pad = "00000";
    var ans = pad.substring(0, pad.length - str.length) + str;
    return "P" + ans;
  },

  generateStoreId(count) {
    var str = "" + (count + 1);
    var pad = "00000";
    var ans = pad.substring(0, pad.length - str.length) + str;
    return "St" + ans;
  },

  sendEmailOtpForSignup: async (email, otp) => {
    var sub = `<!DOCTYPE HTML
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
 <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
       <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <meta name="x-apple-disable-message-reformatting">
       <meta http-equiv="X-UA-Compatible" content="IE=edge">
       <title></title>
       <style type="text/css">
          table,
          td {
          color: #000000;
          }
          a {
          color: #0000ee;
          text-decoration: underline;
          }
          @media only screen and (min-width: 670px) {
          .u-row {
          width: 650px !important;
          }
          .u-row .u-col {
          vertical-align: top;
          }
          .u-row .u-col-100 {
          width: 650px !important;
          }
          }
          @media (max-width: 670px) {
          .u-row-container {
          max-width: 100% !important;
          padding-left: 0px !important;
          padding-right: 0px !important;
          }
          .u-row .u-col {
          min-width: 320px !important;
          max-width: 100% !important;
          display: block !important;
          }
          .u-row {
          width: calc(100% - 40px) !important;
          }
          .u-col {
          width: 100% !important;
          }
          .u-col>div {
          margin: 0 auto;
          }
          }
          body {
          margin: 0;
          padding: 0;
          }
          table,
          tr,
          td {
          vertical-align: top;
          border-collapse: collapse;
          }
          p {
          margin: 0;
          }
          .ie-container table,
          .mso-container table {
          table-layout: fixed;
          }
          * {
          line-height: inherit;
          }
          a[x-apple-data-detectors='true'] {
          color: inherit !important;
          text-decoration: none !important;
          }
       </style>
       <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
       <!--<![endif]-->
    </head>
    <body class="clean-body u_body"
       style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
       <table
          style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%"
          cellpadding="0" cellspacing="0">
          <tbody>
             <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                   <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                         style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #0C576C;">
                         <div
                            style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                            <div class="u-col u-col-100"
                               style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                               <div style="width: 100% !important;">
                                  <div
                                     stestingMailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                     <!--<![endif]-->
                                     <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                                        cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                           <tr>
                                              <td style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;"
                                                 align="left">
                                                 <table width="100%" cellpadding="0" cellspacing="0"
                                                    border="0">
                                                    <tr>
                                                       <td style="padding-right: 0px;padding-left: 0px;"
                                                          align="center">
                                                          <img align="center" border="0"
                                                             src="http://res.cloudinary.com/mobiloittetech/image/upload/v1687253700/jtuadz3xqylblthhidxq.png"
                                                             alt="Image" title="Image"
                                                             style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 40%;max-width: 500px;"
                                                             width="500" />
                                                       </td>
                                                    </tr>
                                                 </table>
                                              </td>
                                           </tr>
                                        </tbody>
                                     </table>
                                     <table style="font-family:'Montserrat',sans-serif; margin-bottom: 25px;"
                                        role="presentation" cellpadding="0" cellspacing="0" width="100%"
                                        border="0">
                                        <tbody>
                                           <tr>
                                              <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;"
                                                 align="left">
                                                 <div
                                                    style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
                                                    <p
                                                       style="line-height: 170%; text-align: center; font-size: 14px;">
                                                       <span
                                                          style="font-size: 21px; line-height: 40.8px; color: #D39B2D;"><strong>Your One-Time Password for Account Activation</strong></span>
                                                    </p>
                                                 </div>
                                              </td>
                                           </tr>
                                        </tbody>
                                     </table>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                         style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
                         <div
                            style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                            <div class="u-col u-col-100"
                               style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                               <div style="width: 100% !important;">
                                  <div
                                     style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                     <!--<![endif]-->
                                     <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                                        cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                           <tr>
                                              <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;"
                                                 align="left">
                                                 <div
                                                    style="color: #1b262c; line-height: 140%; word-wrap: break-word;">
                                                    </br></br>
                                                    <p style="font-size: 14px; line-height: 140%;"> Thank
                                                       you for signing up for our platform! We're excited
                                                       to have you on board. To complete your registration,
                                                       please use the following One-Time Password.
                                                    </p>
                                                    <br>
                                                    <h2
                                                       style="background: #0C576C;margin: 0px auto;width: max-content;padding: 5px 10px;color: #fff;border-radius: 4px;">
                                                       ${otp}
                                                    </h2>
                                                    <br>
                                                    <p style="font-size: 14px; line-height: 140%;">Please
                                                       enter this OTP within 3 minutes on the sign-up page
                                                       to activate your account. This OTP is valid for a
                                                       single use only.
                                                       <br><br>
                                                    <p style="font-size: 14px; line-height: 140%;">If you
                                                       didn't initiate this sign-up process, please
                                                       disregard this email, and your account will not be
                                                       activated.
                                                       <br>
                                                       <br>
                                                       Please be aware of the fraud and phishing websites.
                                                       The only official website for fanos is:
                                                       <span> <a
                                                          href="https://fanos.one"
                                                          target="_blank"
                                                          style="color:black;text-decoration:none; cursor:pointer">
                                                       www.fanos.one</a><span>
                                                       This is an automated message. Please do not
                                                       reply.
                                                    <p
                                                       style="font-size: 14px; line-height: 140%;">
                                                 </div>
                                              </td>
                                           </tr>
                                        </tbody>
                                     </table>
                                     </br>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                         style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #151418;">
                         <div
                            style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                            </br>
                            <div class="u-col u-col-100"
                               style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                               <div style="width: 100% !important;">
                                  <div
                                     style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                     <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                                        cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                           <tr>
                                              <td style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;"
                                                 align="left">
                                                 <div
                                                    style="color: #ffffff; line-height: 150%; text-align: center; word-wrap: break-word;">
                                                    <a href="https://fanos.one/"
                                                       target="_blank"
                                                       style="font-size: 14px; line-height: 140%;color:white;text-decoration:none;cursor:pointer"><span
                                                       style="font-size: 14px; line-height: 19.6px;">www.fanos.one</span></a>
                                                 </div>
                                              </td>
                                           </tr>
                                        </tbody>
                                     </table>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </td>
             </tr>
          </tbody>
       </table>
    </body>
 </html>`;
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.get("nodemailer.email"),
        pass: config.get("nodemailer.password"),
      },
    });
    var mailOptions = {
      from: config.get("nodemailer.email"),
      to: email,
      subject: "Your One-Time Password for  Account Activation",
      html: sub,
      // html: html
    };
    return await transporter.sendMail(mailOptions);
  },

  sendEmailOnBlock: async (email) => {
    console.log("email", email, 44555661);
    var html = `<!DOCTYPE HTML
   PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
   xmlns:o="urn:schemas-microsoft-com:office:office">
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title></title>
      <style type="text/css">
         table,
         td {
         color: #000000;
         }
         a {
         color: #0000ee;
         text-decoration: underline;
         }
         @media only screen and (min-width: 670px) {
         .u-row {
         width: 650px !important;
         }
         .u-row .u-col {
         vertical-align: top;
         }
         .u-row .u-col-100 {
         width: 650px !important;
         }
         }
         @media (max-width: 670px) {
         .u-row-container {
         max-width: 100% !important;
         padding-left: 0px !important;
         padding-right: 0px !important;
         }
         .u-row .u-col {
         min-width: 320px !important;
         max-width: 100% !important;
         display: block !important;
         }
         .u-row {
         width: calc(100% - 40px) !important;
         }
         .u-col {
         width: 100% !important;
         }
         .u-col>div {
         margin: 0 auto;
         }
         }
         body {
         margin: 0;
         padding: 0;
         }
         table,
         tr,
         td {
         vertical-align: top;
         border-collapse: collapse;
         }
         p {
         margin: 0;
         }
         .ie-container table,
         .mso-container table {
         table-layout: fixed;
         }
         * {
         line-height: inherit;
         }
         a[x-apple-data-detectors='true'] {
         color: inherit !important;
         text-decoration: none !important;
         }
      </style>
      <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
      <!--<![endif]-->
   </head>
   <body class="clean-body u_body"
      style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
      <table
         style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%"
         cellpadding="0" cellspacing="0">
         <tbody>
            <tr style="vertical-align: top">
               <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                  <div class="u-row-container" style="padding: 0px;background-color: transparent">
                     <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #0C576C;">
                        <div
                           style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                           <div class="u-col u-col-100"
                              style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                              <div style="width: 100% !important;">
                                 <div
                                    stestingMailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                    <!--<![endif]-->
                                    <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                                       cellpadding="0" cellspacing="0" width="100%" border="0">
                                       <tbody>
                                          <tr>
                                             <td style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;"
                                                align="left">
                                                <table width="100%" cellpadding="0" cellspacing="0"
                                                   border="0">
                                                   <tr>
                                                      <td style="padding-right: 0px;padding-left: 0px;"
                                                         align="center">
                                                         <img align="center" border="0"
                                                            src="http://res.cloudinary.com/mobiloittetech/image/upload/v1687253700/jtuadz3xqylblthhidxq.png"
                                                            alt="Image" title="Image"
                                                            style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 40%;max-width: 500px;"
                                                            width="500" />
                                                      </td>
                                                   </tr>
                                                </table>
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                    <table style="font-family:'Montserrat',sans-serif; margin-bottom: 25px;"
                                       role="presentation" cellpadding="0" cellspacing="0" width="100%"
                                       border="0">
                                       <tbody>
                                          <tr>
                                             <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;"
                                                align="left">
                                                <div
                                                   style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
                                                   <p
                                                      style="line-height: 170%; text-align: center; font-size: 14px;">
                                                      <span
                                                         style="font-size: 21px; line-height: 40.8px; color: #D39B2D;"><strong>BLOCK BY ADMINISTRATOR</strong></span>
                                                   </p>
                                                </div>
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div class="u-row-container" style="padding: 0px;background-color: transparent">
                     <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                           <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                              <div style="width: 100% !important;">
                                 <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                    <!--<![endif]-->
                                    <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                       <tbody>
                                          <tr>
                                             <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;" align="left">
                                                <div style="color: #1b262c; line-height: 140%; text-align: center; word-wrap: break-word;">
                                                   </br></br>
                                                   <p style="font-size: 14px; line-height: 140%;">We regret to inform you that your account on our platform has been temporarily suspended. This action has been taken due to a violation of our platform's terms of service and community guidelines.
                                                      <br>
                                                      <br>
                                                   <p style="font-size: 14px; line-height: 140%;">Your account suspension is effective immediately, and you will no longer have access to the platform for the duration of the suspension.
                                                      <br>
                                                      <br>
                                                   <p style="font-size: 14px; line-height: 140%;">
                                                      If you have any questions or concerns regarding this suspension, please feel free to contact our support team at fanos6506@gmail.com. We will be happy to assist you and provide further information.
                                                </div>
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                    <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                       <tbody>
                                          <tr>
                                             <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;" align="left">
                                                <div align="center">
                                                   <a href= "" target="_blank" style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #0088ee; border-radius: 60px;-webkit-border-radius: 60px; -moz-border-radius: 60px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: solid; border-top-width: 0px; border-left-color: #CCC; border-left-style: solid; border-left-width: 0px; border-right-color: #CCC; border-right-style: solid; border-right-width: 0px; border-bottom-color: #0275a4; border-bottom-style: solid; border-bottom-width: 5px;">
                                                   </a>
                                                </div>
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div class="u-row-container" style="padding: 0px;background-color: transparent">
                     <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #151418;">
                        <div
                           style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                           </br>
                           <div class="u-col u-col-100"
                              style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                              <div style="width: 100% !important;">
                                 <div
                                    style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                    <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                                       cellpadding="0" cellspacing="0" width="100%" border="0">
                                       <tbody>
                                          <tr>
                                             <td style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;"
                                                align="left">
                                                <div
                                                   style="color: #ffffff; line-height: 150%; text-align: center; word-wrap: break-word;">
                                                   <a href="https://fanos.one/"
                                                      target="_blank"
                                                      style="font-size: 14px; line-height: 140%;color:white;text-decoration:none;cursor:pointer"><span
                                                      style="font-size: 14px; line-height: 19.6px;">www.fanos.one</span></a>
                                                </div>
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </td>
            </tr>
         </tbody>
      </table>
   </body>
</html>`;
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.get("nodemailer.email"),
        pass: config.get("nodemailer.password"),
      },
    });
    var mailOptions = {
      from: config.get("nodemailer.email"),
      to: email,
      subject: "Block By Administrator",

      // text: sub,
      html: html,
    };
    return await transporter.sendMail(mailOptions);
  },

  sendForgotPasswordOtp: async (email, otp) => {
    var sub = `<!DOCTYPE HTML
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
 <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
       <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <meta name="x-apple-disable-message-reformatting">
       <meta http-equiv="X-UA-Compatible" content="IE=edge">
       <title></title>
       <style type="text/css">
          table,
          td {
          color: #000000;
          }
          a {
          color: #0000ee;
          text-decoration: underline;
          }
          @media only screen and (min-width: 670px) {
          .u-row {
          width: 650px !important;
          }
          .u-row .u-col {
          vertical-align: top;
          }
          .u-row .u-col-100 {
          width: 650px !important;
          }
          }
          @media (max-width: 670px) {
          .u-row-container {
          max-width: 100% !important;
          padding-left: 0px !important;
          padding-right: 0px !important;
          }
          .u-row .u-col {
          min-width: 320px !important;
          max-width: 100% !important;
          display: block !important;
          }
          .u-row {
          width: calc(100% - 40px) !important;
          }
          .u-col {
          width: 100% !important;
          }
          .u-col>div {
          margin: 0 auto;
          }
          }
          body {
          margin: 0;
          padding: 0;
          }
          table,
          tr,
          td {
          vertical-align: top;
          border-collapse: collapse;
          }
          p {
          margin: 0;
          }
          .ie-container table,
          .mso-container table {
          table-layout: fixed;
          }
          * {
          line-height: inherit;
          }
          a[x-apple-data-detectors='true'] {
          color: inherit !important;
          text-decoration: none !important;
          }
       </style>
       <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
       <!--<![endif]-->
    </head>
    <body class="clean-body u_body"
       style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
       <table
          style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%"
          cellpadding="0" cellspacing="0">
          <tbody>
             <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                   <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                         style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #0C576C;">
                         <div
                            style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                            <div class="u-col u-col-100"
                               style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                               <div style="width: 100% !important;">
                                  <div
                                     stestingMailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                     <!--<![endif]-->
                                     <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                                        cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                           <tr>
                                              <td style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;"
                                                 align="left">
                                                 <table width="100%" cellpadding="0" cellspacing="0"
                                                    border="0">
                                                    <tr>
                                                       <td style="padding-right: 0px;padding-left: 0px;"
                                                          align="center">
                                                          <img align="center" border="0"
                                                             src="http://res.cloudinary.com/mobiloittetech/image/upload/v1687253700/jtuadz3xqylblthhidxq.png"
                                                             alt="Image" title="Image"
                                                             style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 40%;max-width: 500px;"
                                                             width="500" />
                                                       </td>
                                                    </tr>
                                                 </table>
                                              </td>
                                           </tr>
                                        </tbody>
                                     </table>
                                     <table style="font-family:'Montserrat',sans-serif; margin-bottom: 25px;"
                                        role="presentation" cellpadding="0" cellspacing="0" width="100%"
                                        border="0">
                                        <tbody>
                                           <tr>
                                              <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;"
                                                 align="left">
                                                 <div
                                                    style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
                                                    <p
                                                       style="line-height: 170%; text-align: center; font-size: 14px;">
                                                       <span
                                                          style="font-size: 21px; line-height: 40.8px; color: #D39B2D;"><strong>Your One-Time Password for Reset Password</strong></span>
                                                    </p>
                                                 </div>
                                              </td>
                                           </tr>
                                        </tbody>
                                     </table>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                         style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
                         <div
                            style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                            <div class="u-col u-col-100"
                               style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                               <div style="width: 100% !important;">
                                  <div
                                     style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                     <!--<![endif]-->
                                     <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                                        cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                           <tr>
                                              <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;"
                                                 align="left">
                                                 <div
                                                    style="color: #1b262c; line-height: 140%; word-wrap: break-word;">
                                                    </br></br>
                                                    <p style="font-size: 14px; line-height: 140%;"> We received a request to reset the password associated with your account. 
                                                       <br>To proceed with the password reset, please use the following One-Time Password.
                                                    </p>
                                                    <br>
                                                    <h2
                                                       style="background: #0C576C;margin: 0px auto;width: max-content;padding: 5px 10px;color: #fff;border-radius: 4px;">
                                                       ${otp}
                                                    </h2>
                                                    <br>
                                                    <p style="font-size: 14px; line-height: 140%;">Please
                                                       enter this OTP within 3 minutes  on the password reset page. 
                                                       This OTP is valid for a single use only.
                                                       <br><br>
                                                    <p style="font-size: 14px; line-height: 140%;">If you didn't initiate this password reset request, please disregard this email, and no changes will be made to your account.
                                                       <br>
                                                       <br>
                                                       Please be aware of the fraud and phishing websites.
                                                       The only official website for fanos is:
                                                       <span> <a
                                                          href="https://fanos.one"
                                                          target="_blank"
                                                          style="color:black;text-decoration:none; cursor:pointer">
                                                       www.fanos.one</a><span>
                                                       This is an automated message. Please do not
                                                       reply.
                                                    <p
                                                       style="font-size: 14px; line-height: 140%;">
                                                 </div>
                                              </td>
                                           </tr>
                                        </tbody>
                                     </table>
                                     </br>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                         style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #151418;">
                         <div
                            style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                            </br>
                            <div class="u-col u-col-100"
                               style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                               <div style="width: 100% !important;">
                                  <div
                                     style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                     <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                                        cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                           <tr>
                                              <td style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;"
                                                 align="left">
                                                 <div
                                                    style="color: #ffffff; line-height: 150%; text-align: center; word-wrap: break-word;">
                                                    <a href="https://fanos.one/"
                                                       target="_blank"
                                                       style="font-size: 14px; line-height: 140%;color:white;text-decoration:none;cursor:pointer"><span
                                                       style="font-size: 14px; line-height: 19.6px;">www.fanos.one</span></a>
                                                 </div>
                                              </td>
                                           </tr>
                                        </tbody>
                                     </table>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </td>
             </tr>
          </tbody>
       </table>
    </body>
 </html>`;
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.get("nodemailer.email"),
        pass: config.get("nodemailer.password"),
      },
    });
    var mailOptions = {
      from: config.get("nodemailer.email"),
      to: email,
      subject: "Your One-Time Password for Reset Password",
      html: sub,
      // html: html
    };
    return await transporter.sendMail(mailOptions);
  },

  sendEmailOnUnblock: async (email) => {
    var html = `<!DOCTYPE HTML
   PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
   xmlns:o="urn:schemas-microsoft-com:office:office">
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title></title>
      <style type="text/css">
         table,
         td {
         color: #000000;
         }
         a {
         color: #0000ee;
         text-decoration: underline;
         }
         @media only screen and (min-width: 670px) {
         .u-row {
         width: 650px !important;
         }
         .u-row .u-col {
         vertical-align: top;
         }
         .u-row .u-col-100 {
         width: 650px !important;
         }
         }
         @media (max-width: 670px) {
         .u-row-container {
         max-width: 100% !important;
         padding-left: 0px !important;
         padding-right: 0px !important;
         }
         .u-row .u-col {
         min-width: 320px !important;
         max-width: 100% !important;
         display: block !important;
         }
         .u-row {
         width: calc(100% - 40px) !important;
         }
         .u-col {
         width: 100% !important;
         }
         .u-col>div {
         margin: 0 auto;
         }
         }
         body {
         margin: 0;
         padding: 0;
         }
         table,
         tr,
         td {
         vertical-align: top;
         border-collapse: collapse;
         }
         p {
         margin: 0;
         }
         .ie-container table,
         .mso-container table {
         table-layout: fixed;
         }
         * {
         line-height: inherit;
         }
         a[x-apple-data-detectors='true'] {
         color: inherit !important;
         text-decoration: none !important;
         }
      </style>
      <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
      <!--<![endif]-->
   </head>
   <body class="clean-body u_body"
      style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
      <table
         style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%"
         cellpadding="0" cellspacing="0">
         <tbody>
            <tr style="vertical-align: top">
               <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                  <div class="u-row-container" style="padding: 0px;background-color: transparent">
                     <div class="u-row"
                        style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #0C576C;">
                        <div
                           style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                           <div class="u-col u-col-100"
                              style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                              <div style="width: 100% !important;">
                                 <div
                                    stestingMailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                    <!--<![endif]-->
                                    <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                                       cellpadding="0" cellspacing="0" width="100%" border="0">
                                       <tbody>
                                          <tr>
                                             <td style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;"
                                                align="left">
                                                <table width="100%" cellpadding="0" cellspacing="0"
                                                   border="0">
                                                   <tr>
                                                      <td style="padding-right: 0px;padding-left: 0px;"
                                                         align="center">
                                                         <img align="center" border="0"
                                                            src="http://res.cloudinary.com/mobiloittetech/image/upload/v1687253700/jtuadz3xqylblthhidxq.png"
                                                            alt="Image" title="Image"
                                                            style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 40%;max-width: 500px;"
                                                            width="500" />
                                                      </td>
                                                   </tr>
                                                </table>
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                    <table style="font-family:'Montserrat',sans-serif; margin-bottom: 25px;"
                                       role="presentation" cellpadding="0" cellspacing="0" width="100%"
                                       border="0">
                                       <tbody>
                                          <tr>
                                             <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;"
                                                align="left">
                                                <div
                                                   style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
                                                   <p
                                                      style="line-height: 170%; text-align: center; font-size: 14px;">
                                                      <span
                                                         style="font-size: 21px; line-height: 40.8px; color: #D39B2D;"><strong>UNBLOCK BY ADMINISTRATOR</strong></span>
                                                   </p>
                                                </div>
                                             </td>
                                          </tr>
                                       </tbody>
                                    </table>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </td>
            </tr>
         </tbody>
      </table>
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
         <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
            <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
               <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                     <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                        <!--<![endif]-->
                        <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                           <tbody>
                              <tr>
                                 <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;" align="left">
                                    <div style="color: #1b262c; line-height: 140%; text-align: center; word-wrap: break-word;">
                                       </br></br>
                                       <p style="font-size: 14px; line-height: 140%;">We are pleased to inform you that your account has been successfully unblocked. You can now access the platform and resume your activities.
                                          <br>
                                          <br>
                                       <p style="font-size: 14px; line-height: 140%;">Thank you for your understanding and cooperation. We apologize for any inconvenience caused during the block period.
                                          <br>
                                          <br>
                                       <p style="font-size: 14px; line-height: 140%;">
                                          If you have any questions or concerns regarding this suspension, please feel free to contact our support team at fanos6506@gmail.com. We will be happy to assist you and provide further information.
                                    </div>
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                        <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                           <tbody>
                              <tr>
                                 <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;" align="left">
                                    <div align="center">
                                       <a href= "" target="_blank" style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #0088ee; border-radius: 60px;-webkit-border-radius: 60px; -moz-border-radius: 60px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: solid; border-top-width: 0px; border-left-color: #CCC; border-left-style: solid; border-left-width: 0px; border-right-color: #CCC; border-right-style: solid; border-right-width: 0px; border-bottom-color: #0275a4; border-bottom-style: solid; border-bottom-width: 5px;">
                                       </a>
                                    </div>
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
      <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
         <tbody>
            <tr>
               <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Montserrat',sans-serif;" align="left">
                  <div align="center">
                     <a href= "" target="_blank" style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #0088ee; border-radius: 60px;-webkit-border-radius: 60px; -moz-border-radius: 60px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: solid; border-top-width: 0px; border-left-color: #CCC; border-left-style: solid; border-left-width: 0px; border-right-color: #CCC; border-right-style: solid; border-right-width: 0px; border-bottom-color: #0275a4; border-bottom-style: solid; border-bottom-width: 5px;">
                     </a>
                  </div>
               </td>
            </tr>
         </tbody>
      </table>
      </div>
      </div>
      </div>
      </div>
      </div>
      </div>
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
         <div class="u-row"
            style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #151418;">
            <div
               style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
               </br>
               <div class="u-col u-col-100"
                  style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                  <div style="width: 100% !important;">
                     <div
                        style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                        <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                           cellpadding="0" cellspacing="0" width="100%" border="0">
                           <tbody>
                              <tr>
                                 <td style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;"
                                    align="left">
                                    <div
                                       style="color: #ffffff; line-height: 150%; text-align: center; word-wrap: break-word;">
                                       <a href="https://fanos.one/"
                                          target="_blank"
                                          style="font-size: 14px; line-height: 140%;color:white;text-decoration:none;cursor:pointer"><span
                                          style="font-size: 14px; line-height: 19.6px;">www.fanos.one</span></a>
                                    </div>
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
      </td>
      </tr>
      </tbody>
      </table>
   </body>
</html>`;
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.get("nodemailer.email"),
        pass: config.get("nodemailer.password"),
      },
    });
    var mailOptions = {
      from: config.get("nodemailer.email"),
      to: email,
      subject: "Unblock By Admin",
      html: html,
    };
    return await transporter.sendMail(mailOptions);
  },

  sendEmailReSendOtp: async (email, otp) => {
    var sub = `<!DOCTYPE HTML
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
 <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
       <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <meta name="x-apple-disable-message-reformatting">
       <meta http-equiv="X-UA-Compatible" content="IE=edge">
       <title></title>
       <style type="text/css">
          table,
          td {
          color: #000000;
          }
          a {
          color: #0000ee;
          text-decoration: underline;
          }
          @media only screen and (min-width: 670px) {
          .u-row {
          width: 650px !important;
          }
          .u-row .u-col {
          vertical-align: top;
          }
          .u-row .u-col-100 {
          width: 650px !important;
          }
          }
          @media (max-width: 670px) {
          .u-row-container {
          max-width: 100% !important;
          padding-left: 0px !important;
          padding-right: 0px !important;
          }
          .u-row .u-col {
          min-width: 320px !important;
          max-width: 100% !important;
          display: block !important;
          }
          .u-row {
          width: calc(100% - 40px) !important;
          }
          .u-col {
          width: 100% !important;
          }
          .u-col>div {
          margin: 0 auto;
          }
          }
          body {
          margin: 0;
          padding: 0;
          }
          table,
          tr,
          td {
          vertical-align: top;
          border-collapse: collapse;
          }
          p {
          margin: 0;
          }
          .ie-container table,
          .mso-container table {
          table-layout: fixed;
          }
          * {
          line-height: inherit;
          }
          a[x-apple-data-detectors='true'] {
          color: inherit !important;
          text-decoration: none !important;
          }
       </style>
       <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
       <!--<![endif]-->
    </head>
    <body class="clean-body u_body"
       style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
       <table
          style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%"
          cellpadding="0" cellspacing="0">
          <tbody>
             <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                   <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                         style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #0C576C;">
                         <div
                            style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                            <div class="u-col u-col-100"
                               style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                               <div style="width: 100% !important;">
                                  <div
                                     stestingMailtyle="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                     <!--<![endif]-->
                                     <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                                        cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                           <tr>
                                              <td style="overflow-wrap:break-word;word-break:break-word;padding:30px 0px;font-family:'Montserrat',sans-serif;"
                                                 align="left">
                                                 <table width="100%" cellpadding="0" cellspacing="0"
                                                    border="0">
                                                    <tr>
                                                       <td style="padding-right: 0px;padding-left: 0px;"
                                                          align="center">
                                                          <img align="center" border="0"
                                                             src="http://res.cloudinary.com/mobiloittetech/image/upload/v1687253700/jtuadz3xqylblthhidxq.png"
                                                             alt="Image" title="Image"
                                                             style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 40%;max-width: 500px;"
                                                             width="500" />
                                                       </td>
                                                    </tr>
                                                 </table>
                                              </td>
                                           </tr>
                                        </tbody>
                                     </table>
                                     <table style="font-family:'Montserrat',sans-serif; margin-bottom: 25px;"
                                        role="presentation" cellpadding="0" cellspacing="0" width="100%"
                                        border="0">
                                        <tbody>
                                           <tr>
                                              <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Montserrat',sans-serif;"
                                                 align="left">
                                                 <div
                                                    style="color: #018eea; line-height: 170%; text-align: left; word-wrap: break-word;">
                                                    <p
                                                       style="line-height: 170%; text-align: center; font-size: 14px;">
                                                       <span
                                                          style="font-size: 21px; line-height: 40.8px; color: #D39B2D;"><strong>Resend One-Time Password </strong></span>
                                                    </p>
                                                 </div>
                                              </td>
                                           </tr>
                                        </tbody>
                                     </table>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                         style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
                         <div
                            style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                            <div class="u-col u-col-100"
                               style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                               <div style="width: 100% !important;">
                                  <div
                                     style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                     <!--<![endif]-->
                                     <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                                        cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                           <tr>
                                              <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;"
                                                 align="left">
                                                 <div
                                                    style="color: #1b262c; line-height: 140%; word-wrap: break-word;">
                                                    </br></br>
                                                    <p style="font-size: 14px; line-height: 140%;">We noticed that you requested a One-Time Password (OTP) for your account. Apologies if you didn't receive it or if you experienced any inconvenience. Please use the following OTP to continue with your desired action.</p>
                                                    <br>
                                                    <h2
                                                       style="background: #0C576C;margin: 0px auto;width: max-content;padding: 5px 10px;color: #fff;border-radius: 4px;">
                                                       ${otp}
                                                    </h2>
                                                    <br>
                                                    <p style="font-size: 14px; line-height: 140%;">This OTP is valid for a single use only and will expire within 3 minutes. 
                                                       <br><br>
                                                    <p style="font-size: 14px; line-height: 140%;">If you did not request this OTP, please disregard this email. Your account security remains intact, and no changes have been made.</p>
                                                    <br>
                                                    Please be aware of the fraud and phishing websites.
                                                    The only official website for fanos is:
                                                    <span> <a
                                                       href="https://fanos.one"
                                                       target="_blank"
                                                       style="color:black;text-decoration:none; cursor:pointer">
                                                    www.fanos.one</a><span>
                                                    This is an automated message. Please do not
                                                    reply.
                                                    <p
                                                       style="font-size: 14px; line-height: 140%;">
                                                 </div>
                                              </td>
                                           </tr>
                                        </tbody>
                                     </table>
                                     </br>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div class="u-row-container" style="padding: 0px;background-color: transparent">
                      <div class="u-row"
                         style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #151418;">
                         <div
                            style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                            </br>
                            <div class="u-col u-col-100"
                               style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
                               <div style="width: 100% !important;">
                                  <div
                                     style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                     <table style="font-family:'Montserrat',sans-serif;" role="presentation"
                                        cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                           <tr>
                                              <td style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;"
                                                 align="left">
                                                 <div
                                                    style="color: #ffffff; line-height: 150%; text-align: center; word-wrap: break-word;">
                                                    <a href="https://fanos.one/"
                                                       target="_blank"
                                                       style="font-size: 14px; line-height: 140%;color:white;text-decoration:none;cursor:pointer"><span
                                                       style="font-size: 14px; line-height: 19.6px;">www.fanos.one</span></a>
                                                 </div>
                                              </td>
                                           </tr>
                                        </tbody>
                                     </table>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </td>
             </tr>
          </tbody>
       </table>
    </body>
 </html>`;
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.get("nodemailer.email"),
        pass: config.get("nodemailer.password"),
      },
    });
    var mailOptions = {
      from: config.get("nodemailer.email"),
      to: email,
      subject: "Resend One-Time Password",
      html: sub,
    };
    return await transporter.sendMail(mailOptions);
  },

  sendEmailOtp: async (email, otp) => {
    var sub = `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <table style="width:100%">
            <tr>
                <th></th>
            </tr>
        </table>
      </div>
      <p style="font-size:1.1em">Hi,</p>
      <p>Use the following OTP to complete your verification procedures. OTP is valid for 3 minutes</p>
      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
      <p style="font-size:0.9em;">Thank You,</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      </div>
    </div>
</div>`;
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.get("nodemailer.email"),
        pass: config.get("nodemailer.password"),
      },
    });
    var mailOptions = {
      from: config.get("nodemailer.email"),
      to: email,
      subject: "Otp for verification",
      html: sub,
      // html: html
    };
    return await transporter.sendMail(mailOptions);
  },

  paginationFunction: (result, page, limit) => {
    let endIndex = page * limit;
    let startIndex = (page - 1) * limit;
    var resultArray = {};

    resultArray.page = page;
    resultArray.limit = limit;
    resultArray.remainingItems = result.length - endIndex;

    if (result.length - endIndex < 0) {
      resultArray.remainingItems = 0;
    }
    resultArray.count = result.length;
    resultArray.docs = result.slice(startIndex, endIndex);
    resultArray.totalPages = Math.ceil(resultArray.count / Number(limit));
    return resultArray;
  },
};
export default commonFunction;
