import User from "../models/user.js";
import bcrypt from "bcrypt";

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        delete user.password;

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);

        res.status(500).json({ message: "Server error" });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const { name, removeAvatar } = req.body; // ✅ Extract removeAvatar from req.body

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (name) {
            user.name = name;
        }

        // ✅ Check if the user clicked "Remove Avatar" first
        if (removeAvatar === "true") {
            user.profilePicture = ""; // Clear it from the database
            console.log("REMOVED profilePicture");
        }
        // ✅ Otherwise, if they uploaded a new file, save the Cloudinary URL
        else if (req.file) {
            user.profilePicture = req.file.path;
            console.log("SETTING profilePicture:", user.profilePicture);
        }

        await user.save();
        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        const user = await User.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (newPassword !== confirmPassword) {
            return res
                .status(400)
                .json({ message: "New password and confirm password do not match" });
        }

        const isPasswordValid = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(403).json({ message: "Invalid old password" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error changing password:", error);

        res.status(500).json({ message: "Server error" });
    }
};

export { getUserProfile, updateUserProfile, changePassword };