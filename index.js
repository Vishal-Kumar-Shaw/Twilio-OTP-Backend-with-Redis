const bodyParser = require('body-parser');
const { generateOtp } = require('./otpGenerator');
const { redisClient, connectRedis } = require('./redisetup')

const express = require('express');
const app = express();
const cors = require('cors');

require('dotenv').config();
app.use(cors());
const twilio = require('twilio');

// Twilio credentials
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;     // Replace with your Twilio phone number

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.use(bodyParser.json());
connectRedis();



app.get('/',(req, res)=>{
    return res.json({message: "Home route hitted of Vishal Kumar Shaw's OTP project"});
})
app.post('/generateOTP', async (req, res) => {
    const { phone } = req.body;

    if(!phone) {
        return res.status(400).json({error: "Phone no is invalid"});
    }
    try {
        const otp = generateOtp();
        await redisClient.setEx(phone, 900, otp);
        console.log(`OTP for ${phone} stored in Redis: ${otp}`);
        const message = await client.messages.create({
            body: `Your OTP is ${otp}`,
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

app.post('/verifyOTP', async (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
        return res.status(400).json({ error: 'Phone and OTP are required' });
    }
    try {
        const storedOtp = await redisClient.get(phone);
        if (!storedOtp) {
            return res.status(400).json({ success: false, error: 'OTP not found or expired' });
        }
        if (storedOtp === otp) {
            // OTP is valid, delete it from Redis
            //await redisClient.del(phone);
            return res.status(200).json({ success: true, message: 'OTP verified successfully' });
        }
        else res.status(400).json({ success: false, error: 'Invalid OTP or OTP expired' });
        await redisClient.del(phone);
    } catch (err) {
        console.error('Error verifying OTP', err);
        res.status(500).json({ success: false, error: 'Failed to verify OTP' });
    }
});

app.listen(process.env.PORT, ()=>{
    console.log("Server is running");
})

