const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email{
    constructor(user,url){
       this.to=user.email;
       this.firstName=user.name.split(' ')[0];
       this.url=url;
       this.from=`${process.env.EMAIL_FROM}`
    }

    newTransport(){
        if(process.env.NODE_ENV === 'production'){
            //Sendgrid
            return nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'natours.in@gmail.com',
                    pass: 'pass1234+'
                }
            })
        }
        return nodemailer.createTransport({
            host : process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth :{
                user: process.env.EMAIL_USERNAME,
                pass : process.env.EMAIL_PASSWORD
            },
            tls:{
                rejectUnauthorized : false
            }
        });
    }
    async send(template,subject){
        //Send the actual email
          
        //1) Render HTML based on a pug template
        console.log(template);
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
            firstName:this.firstName,
            url:this.url,
            subject
        })

        //2)Find the email Options
        const mailOptions = {
            from : this.from,
            to: this.to,
            subject,
            html,
            text : htmlToText.fromString(html)
        };
 
        //3)Create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }
    
    async sendWelcome(){
        await this.send('welcome','Welcome To Natours Family!')
    }

    async sendPasswordReset()
    {
        await this.send('passwordReset','Your Password Reset Token');
    }
}


// const sendEmail = async options => {
//     //1) Create a transporter
//       const transporter = nodemailer.createTransport({
//           host : process.env.EMAIL_HOST,
//           port: process.env.EMAIL_PORT,
//           auth :{
//               user: process.env.EMAIL_USERNAME,
//               pass : process.env.EMAIL_PASSWORD
//           },
//           tls:{
//               rejectUnauthorized : false
//           }
//       });

//     //2)Define the email options
//     const mailOptions = {
//         from : 'Ankush <ankush@natours.io>',
//         to: options.email,
//         subject : options.subject,
//         text : options.message
//         //html : 
//     };

//     //3) Actually send the email
//     await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;