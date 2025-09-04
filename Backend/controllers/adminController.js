//api for adding doctor 
import validator from 'validator'
import bycrpt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import { json } from 'express';
import doctorModel from '../models/doctorModel.js';
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js';
import userModel from '../models/userModel.js';
import Query from '../models/Query.js';
import { sendMail } from '../config/sendMail.js';

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

//API for admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET);//generate token in case of right credentials
            res.json({ success: true, token })
        }

        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    }
    catch {
        console.log(error)
        res.json({ success: false, message: error.message })

    }
}

//API to get all doc list for admin panel
const allDoctors = async (req, res) => {
    try {
        //get doctor info except password
        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors })
    }
    catch {
        console.log(error)
        res.json({ success: false, message: error.message })

    }

}

// api to get all appointment list
const appointmentAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


//api to cancle appointment
const appointmentCancel = async (req, res) => {
    try {
        //get userId from auth user middleware and appointmentId is provided while cancelling
        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId)

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        //releasing doctor Slot
        const { docId, slotDate, slotTime } = appointmentData
        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked
        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: "Appointment Cancelled" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


//api to get dashboard data for admin panel

const adminDashboard = async (req, res) => {
    try {
        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})
        //we will get number of doc, user,appointment
        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse().slice(0, 5)

        }
        res.json({ success: true, dashData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const fetchQueries = async (req, res) => {
    try {

        const queries = await Query.find().sort({ createdAt: 1 });
        res.json({ success: true, queries });

    } catch (error) {
        console.error("Error fetching queries:", error);
        res.json({ success: false, message: "Internal server error" });

    }
}

const queryResponse = async (req, res) => {
    try {
        const { response } = req.body;
        const queryId = req.params.id;

        if (!queryId) {
            return res.json({ success: false, message: "Query ID is required" });
        }
        if (!response) {
            return res.json({ success: false, message: "Response is required" });
        }

        const query = await Query.findById(queryId);
        if (!query) {
            return res.json({ success: false, message: "Query not found" });
        }

        query.response = response;
        query.isResponded = true;
        await query.save();

        const subject = "Response to Your Support Query";
        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2 style="color: #4A90E2;">Hello ${query.name},</h2>
              <p>Thank you for reaching out to us. Below is our response to your query: <strong>${query.message}</strong></p>

              <blockquote style="margin: 16px 0; padding: 10px 16px; background-color: #f9f9f9; border-left: 4px solid #4A90E2;">
                ${response}
              </blockquote>

              <p>If you have any further questions, feel free to reply to this email.</p>

              <br/>
              <p>Best regards,<br/>
              <strong>Prescripto</strong><br/>
              Support Team</p>
            </div>
        `;

        await sendMail(query.email, subject, html);

        res.json({ success: true, message: "Response saved and email sent." });

    } catch (error) {
        console.error("Error responding to query:", error);
        res.json({ success: false, message: "Internal server error" });
    }
};

const deleteQuery = async (req, res) => {
    try {
        const queryId = req.params.id;
        if (!queryId) {
            return res.json({ success: false, message: "Query ID is required" });
        }


        await Query.findByIdAndDelete(queryId);
        res.json({ success: true, message: "Query deleted successfully" });

    } catch (error) {
        console.error("Error deleting query:", error);
        res.json({ success: false, message: error.message });

    }
}

export { addDoctor, loginAdmin, allDoctors, appointmentAdmin, appointmentCancel, adminDashboard, fetchQueries, queryResponse, deleteQuery };