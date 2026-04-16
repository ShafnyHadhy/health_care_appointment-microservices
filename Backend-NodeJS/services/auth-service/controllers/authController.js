const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (userId, role, refId) => {
    return jwt.sign({ userId, role, refId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const register = async (req, res) => {
    try {
        const { email, password, role, refId } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists in auth-service' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            email,
            password: hashedPassword,
            role,
            refId
        });

        res.status(201).json({
            message: 'User registered in auth-service successfully',
            data: { _id: user._id, email: user.email, role: user.role, refId: user.refId }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error in auth-service', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                message: 'Logged in successfully',
                data: {
                    userId: user._id,
                    email: user.email,
                    role: user.role,
                    refId: user.refId,
                    token: generateToken(user._id, user.role, user.refId),
                },
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { register, login };
