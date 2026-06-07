const mongoose = require("mongoose");
const crypto   = require("crypto");

const schema = new mongoose.Schema({
    email:     { type: String, required: true, lowercase: true, trim: true, index: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date,   required: true, index: { expireAfterSeconds: 0 } },
});

schema.statics.createToken = async function (email) {
    const raw  = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(raw).digest("hex");
    await this.deleteMany({ email: email.toLowerCase().trim() });
    await this.create({ email, tokenHash: hash, expiresAt: new Date(Date.now() + 15 * 60 * 1000) });
    return raw;
};

schema.statics.consumeToken = async function (raw) {
    const hash  = crypto.createHash("sha256").update(raw).digest("hex");
    const entry = await this.findOneAndDelete({ tokenHash: hash, expiresAt: { $gt: new Date() } });
    return entry ? entry.email : null;
};

module.exports = mongoose.model("PasswordResetToken", schema);
