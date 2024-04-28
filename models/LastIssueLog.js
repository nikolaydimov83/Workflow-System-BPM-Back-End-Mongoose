const mongoose = require('mongoose');

const timestampSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        required: true
    }
});

const LastIssueLog = mongoose.model('LastIssueLog', timestampSchema);

module.exports = LastIssueLog;