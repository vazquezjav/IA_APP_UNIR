const User = require('../models/User');

// Register User
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        // Simple password storage (for demo purposes, normally hash this!)
        const newUser = new User({ name, email, password });
        await newUser.save();

        res.json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Update Login History
        user.loginHistory.push(new Date());
        await user.save();

        res.json({
            message: 'Login exitoso',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                photoUrl: user.photoUrl
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Login History (Admin Only)
exports.getLoginHistory = async (req, res) => {
    try {
        const users = await User.find({}, 'name email role loginHistory');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
    try {
        const { id, name, email, photoUrl } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.photoUrl = photoUrl || user.photoUrl;

        await user.save();

        res.json({
            message: 'Perfil actualizado exitosamente',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                photoUrl: user.photoUrl
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
