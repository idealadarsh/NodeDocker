const User = require('../models/userModel')
const bcrypt = require('bcryptjs')

exports.signUp = async (req, res, next) => {
    const {username, password} = req.body
    
    try {
        const hashpassword = await bcrypt.hash(password, 12)
        
        const newUser = await User.create({
            username,
            password: hashpassword,
        })

        req.session.user = newUser
        res.status(201).json({
            status: 'success',
        })
    } catch (err) {
        res.status(400).json({
            status: 'fail'
        })
    }
}

exports.logIn = async (req, res, next) => {
    const {username, password} = req.body

    try {
        const user = await User.findOne({ username })

        if(!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            })
        }
        
        const isCorrect = await bcrypt.compare(password, user.password)

        if(isCorrect) {
            req.session.user = user
            res.status(200).json({
                status: 'success',
            })
        } else {
            res.status(400).json({
                status: 'fail',
                message: 'Incorrect username or password'
            })
        }

    } catch (err) {
        console.log(err)
        res.status(400).json({
            status: 'fail'
        })
    }
}