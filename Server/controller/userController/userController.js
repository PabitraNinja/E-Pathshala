/*const User = require('../../models/user')
const jwt = require('jsonwebtoken')
const axios = require('axios')

const awsEmailResisterUrl = '';

const createUser = async (req, res) => {
  try {
    const user = new User(req.body)
    user.code = Date.now()
    await user.save()
    const token = await user.generateAuthToken()

    axios.post(awsEmailResisterUrl, {
      InstructorEmail: user.email
    })
    .then(res => {
          console.log('email resistered: ' + res)
          User.findOneAndUpdate({code: user.code}, { isEmailRegistered: true }).exec()
        })
    .catch(err => {
          console.log("can't resister email: " + err)
          User.findOneAndUpdate({code: user.code}, { isEmailRegistered: false }).exec()
        })

    res.status(201).send({ user, token })
  } catch (e) {
    res.status(400).send(e)
  }
}

const forgetPassword = async (req, res) => {
  const email = req.body.email
  const user = User.find({ email: email })
  try {
    if (!user) {
      throw new Error('Please Register First ')
    }
    res.status(200).send('Check your Email')
  } catch (e) {
    res.status(404).send('email not founded')
  }
}

const login = async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (e) {
    res.status(400).send()
    console.log(e)
  }
}

const logout = async (req, res) => {
  try {
    let token
    const authorization = req.get('authorization')
    if (authorization && authorization.startsWith('Bearer')) {
      token = authorization.substring(7)
    }
    const decoded = jwt.decode(token)
    const user = await User.findOne({ _id: decoded._id })

    if (!user) res.status(400).send('token is corrupted')

    const alreadyInvalidated = await User.find({ invalidatedTokens: token })

    if (alreadyInvalidated.length === 0) user.invalidatedTokens.push(token)

    user.invalidatedTokens = user.invalidatedTokens.filter((token) => {
      const { exp } = jwt.decode(token)
      if (Date.now() >= exp * 1000) return false
      else return true
    })

    await user.save()

    res.send('You Logged out')
  } catch (e) {
    res.status(500).send({ error: e.message || e.toString() })
  }
}

const updateUser = async (req, res) => {
  try {
    const id = req.user._id
    const usr = req.body
    const userOld = await User.findById(id).exec()
    const user = await User.findByIdAndUpdate(id, usr, { new: true }).exec()
    const token = await user.generateAuthToken()

    if (user.email !== userOld.email || !(user.isEmailRegistered)){
      axios.post(awsEmailResisterUrl, {
          InstructorEmail: user.email
        })
        .then(res => {
          console.log('email resistered: ' + res)
          User.findByIdAndUpdate(id, { isEmailRegistered :true }).exec()
        })
        .catch(err => {
          console.log("can't resister email: " + err)
          User.findByIdAndUpdate(id, { isEmailRegistered: false }).exec()
        })
    }else{
      console.log("email is not changed or already registered")
    }

    res.status(201).send({ user, token })
  } catch (e) {
    res.status(400).send(e)
  }
}

const deleteUser = async (req, res) => {
  try {
    await req.user.remove()
    res.status(200).send('Deleted thanks')
  } catch (e) {
    res.status(500).send('invalid Email')
  }
}

const me = async (req, res) => {
  res.send(req.user)
}

module.exports = {
  createUser,
  forgetPassword,
  login,
  updateUser,
  logout,
  deleteUser,
  me
}
*/

const User = require('../../models/user')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

// Setup Nodemailer transporter (use Gmail or any SMTP service)
const transporter = nodemailer.createTransport({
  service: "gmail", // change if using Outlook, Yahoo, etc.
  auth: {
    user: process.env.EMAIL_USER, // set in .env
    pass: process.env.EMAIL_PASS, // set in .env (App password if Gmail)
  },
})

// helper fn to send email
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Edu-Hub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })
    console.log("✅ Email sent to:", to)
    return true
  } catch (err) {
    console.error("❌ Email failed:", err.message)
    return false
  }
}

const createUser = async (req, res) => {
  console.log("Received registration data:", req.body); // Added for debugging
  try {
    const user = new User(req.body)
    user.code = Date.now()
    await user.save()
    const token = await user.generateAuthToken()

    const emailSent = await sendEmail(
      user.email,
      "Verify your Edu-Hub account",
      `<p>Hello ${user.name || "User"},</p>
       <p>Thanks for registering on Edu-Hub. Please verify your email.</p>`
    )

    if (emailSent) {
      await User.findOneAndUpdate({ code: user.code }, { isEmailRegistered: true }).exec()
    } else {
      await User.findOneAndUpdate({ code: user.code }, { isEmailRegistered: false }).exec()
    }

    res.status(201).send({ user, token })
  } catch (e) {
    console.error("Error during user creation:", e); // Added for debugging
    res.status(400).send(e)
  }
}

const forgetPassword = async (req, res) => {
  try {
    const email = req.body.email
    const user = await User.findOne({ email })
    if (!user) {
      throw new Error("Please Register First")
    }

    // send reset email
    await sendEmail(
      email,
      "Edu-Hub Password Reset",
      `<p>Hello,</p>
       <p>You requested to reset your password. Click <a href="http://localhost:3000/reset/${user._id}">here</a> to reset it.</p>`
    )

    res.status(200).send("Check your Email")
  } catch (e) {
    res.status(404).send("Email not found")
  }
}

const login = async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (e) {
    res.status(400).send()
    console.log(e)
  }
}

const logout = async (req, res) => {
  try {
    let token;
    const authorization = req.get('authorization');
    if (authorization && authorization.startsWith('Bearer')) {
      token = authorization.substring(7);
    }

    if (!token) {
      return res.status(401).send({ error: 'Please authenticate.' });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      return res.status(401).send({ error: 'Please authenticate.' });
    }

    user.invalidatedTokens = (user.invalidatedTokens || []).concat(token);
    await user.save();

    res.send('You Logged out');
  } catch (e) {
    res.status(500).send({ error: e.message || e.toString() });
  }
};

const updateUser = async (req, res) => {
  try {
    const id = req.user._id
    const usr = req.body
    const userOld = await User.findById(id).exec()
    const user = await User.findByIdAndUpdate(id, usr, { new: true }).exec()
    const token = await user.generateAuthToken()

    if (user.email !== userOld.email || !(user.isEmailRegistered)) {
      const emailSent = await sendEmail(
        user.email,
        "Verify your new Edu-Hub email",
        `<p>Hello ${user.name || "User"},</p>
         <p>You updated your email. Please verify it.</p>`
      )

      if (emailSent) {
        await User.findByIdAndUpdate(id, { isEmailRegistered: true }).exec()
      } else {
        await User.findByIdAndUpdate(id, { isEmailRegistered: false }).exec()
      }
    } else {
      console.log("email is not changed or already registered")
    }

    res.status(201).send({ user, token })
  } catch (e) {
    res.status(400).send(e)
  }
}

const deleteUser = async (req, res) => {
  try {
    await req.user.remove()
    res.status(200).send("Deleted thanks")
  } catch (e) {
    res.status(500).send("invalid Email")
  }
}

const me = async (req, res) => {
  res.send(req.user)
}

module.exports = {
  createUser,
  forgetPassword,
  login,
  updateUser,
  logout,
  deleteUser,
  me,
}