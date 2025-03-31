//api for adding doctor 
import validator from 'validator'
import bycrpt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import { json } from 'express';
import doctorModel from '../models/doctorModel.js';

const addDoctor = async (req, res) => {
    try {

        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file;
        // console.log({ name, email, password, speciality, degree, experience, about, fees, address }, imageFile)

        // checking for data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: " Missing details " })
        }

        //validating email
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: " Please enter valid email" })

        }
        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: " Please enter strong password" })

        }

        //hashing doctor passwort
        //salt in case of samepassword for diff users it will generate different hashed passowrd
        const salt = await bycrpt.genSalt(10)
        const hashedPassword = await bycrpt.hash(password, salt);

        //upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()

        }

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();
        res.json({ success: true, message: "Doctor Added" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { addDoctor }