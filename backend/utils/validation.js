const menu = require('../models/menu');

// Validate user input
function isValidInput(input) {
    // Check if input is a number
    if (!/^\d+$/.test(input)) {
        return false;
    }

    const num = parseInt(input);

    // Allow all valid system commands and menu items
    const validCommands = [0, 1, 97, 98, 99, 100, 101, 102, 103];

    // Check if it's a valid system command
    if (validCommands.includes(num)) {
        return true;
    }

    // Check if it's a valid menu item (1-15)
    if (num >= 1 && num <= Object.keys(menu).length) {
        return true;
    }

    return false;
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate date format for scheduling
function isValidDateFormat(dateString) {
    return dateString.match(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
}

module.exports = {
    isValidInput,
    isValidEmail,
    isValidDateFormat
};