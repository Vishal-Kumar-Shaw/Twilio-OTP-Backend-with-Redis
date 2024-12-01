const bodyParser = require('body-parser');
const { generateOtp } = require('./otpGenerator');
const express = require('express');
const app = express();
require('dotenv').config();

const twilio = require('twilio');

// Twilio credentials
const twilioPhone = '+17754179727';     // Replace with your Twilio phone number

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.use(bodyParser.json());



app.get('/',(req, res)=>{
    return res.json({message: "Hom route hitted"});
})
app.post('/generateOTP', async (req, res) => {
    const { phone } = req.body;

    if(!phone) {
        return res.status(400).json({error: "Phone no is invalid"});
    }
    try {
        const otp = generateOtp();
        const message = await client.messages.create({
            body: `YOUR OTP is ${otp}`,
            from: twilioPhone,
            to: phone
        })
        console.log("Message send", message.sid);
        res.status(200).json({ success: true, message: "OTP sent successfully"});
    } catch(err){
        console.error('Error sending OTP', err);
        res.status(500).json({success: false, error: 'Failed to send OTP'});
    }
})
app.listen(3000, ()=>{
    console.log("Server is running");
})

