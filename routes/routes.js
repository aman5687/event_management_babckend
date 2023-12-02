const express = require("express");
const router = express.Router();
const User = require("../models/users");
const BookedEvent = require("../models/bookedEvent");
const multer = require("multer");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const validator = require("validator");
const bcrypt = require("bcryptjs");




// registration api starts
router.post("/register", async (req, res) => {

    const name = req.body.name
    const email = req.body.email
    const number = req.body.number
    const password = req.body.password
    const token = uuidv4();

    const errors = [];

    if (!name) {
        errors.push("Please enter a name");
    }
    if (!email) {
        errors.push("Please enter an email");
    }
    if (!number) {
        errors.push("Please enter a password");
    }
    if(number.length !== 10){
        errors.push("Number should be 10 digits long");
    }
    if (!password) {
        errors.push("Please enter a password");
    }
    if (!validator.isEmail(email)) {
        errors.push("Please enter a valid email");
    }
    if (password.length < 8) {
        errors.push("Password should be atleast 8 characters long");
    }

    if (errors.length > 0) {
        res.status(400).json({ errors })
    } else {
        try {
            const hashedPassword = await bcrypt.hash(password, 8);
            const user = new User({
                name,
                email,
                number,
                hashedPassword,
                token,
            });
            const savedUser = await user.save();

            if (!savedUser) {
                res.status(500).send({ message: "Error occured" });
            } else {
                res.status(200).send({ message: "Successful" });
            }
        } catch (error) {
            if (error.code === 11000 && error.keyPattern && error.keyPattern.email === 1) {
                res.status(409).json({ message: "Email is already in use, please enter a unique email" }); // Use 409 Conflict
            } else {
                console.error(error);
                res.status(500).json({ message: "Error in catch" }); // Use 500 Internal Server Error
            }
        }
    }
});
// ends



// login api
router.post("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const sessionStorage = req.session.userInfo;

    const errors = [];

    if (!email) {
        errors.push("Please provide the email");
    }
    if (!password) {
        errors.push("Please provide the password");
    }
    if(!validator.isEmail(email)){
        errors.push("Please enter a valid email");
    }
    if(sessionStorage){
        errors.push("You are already logged in");
    }

    if (errors.length > 0) {
        res.status(400).json({ errors });
        return;
    }
    const user = await User.findOne({ email });

    if (!user) {
        errors.push("This email is not registered");
        res.status(400).json({ errors });
        return;
    } else {
        const checkPassword = await bcrypt.compare(password, user.hashedPassword);

        if (!checkPassword) {
            errors.push("Wrong password");
            res.status(400).json({ errors });
            return;
        }
        else {
            const userData = user;
            req.session.userInfo = {userToken: user.token, userEmail: user.email};
            res.status(201).send({ userData, message: "Logged in" });
        }
    }
});
// ends

// api to book event for the user

router.post("/bookEvent", async (req, res)=>{
    try {
        const eventName = req.body.eventName;
        const bookedBy = req.body.bookedBy;
        
        const bookedEvent = await BookedEvent({
            eventName:eventName,
            bookedBy:bookedBy
        });
    
        const booked = await bookedEvent.save();
    
        if(booked){
            res.status(200).json({booked});
        }else{
            res.status(401).json({message:"Event has not been booked"});
        }
    } catch (error) {
        console.log(error);
        res.status(401).json({error});
    }
})

// ends here








module.exports = router;