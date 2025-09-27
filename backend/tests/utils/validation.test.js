const { isValidInput, isValidEmail, isValidDateFormat } = require('../../utils/validation');

describe('Validation Utils', () => {
    describe('isValidInput', () => {
        test('should accept valid system commands', () => {
            const validCommands = [0, 1, 97, 98, 99, 100, 101, 102, 103];
            validCommands.forEach(command => {
                expect(isValidInput(command.toString())).toBe(true);
            });
        });

        test('should accept valid menu items (1-15)', () => {
            for (let i = 1; i <= 15; i++) {
                expect(isValidInput(i.toString())).toBe(true);
            }
        });

        test('should reject non-numeric input', () => {
            expect(isValidInput('abc')).toBe(false);
            expect(isValidInput('12a')).toBe(false);
            expect(isValidInput('test@email.com')).toBe(false);
            expect(isValidInput('')).toBe(false);
        });

        test('should reject invalid numbers', () => {
            expect(isValidInput('16')).toBe(false); // Beyond menu range
            expect(isValidInput('50')).toBe(false);
            expect(isValidInput('-1')).toBe(false);
            expect(isValidInput('104')).toBe(false); // Beyond valid commands
        });

        test('should handle edge cases', () => {
            expect(isValidInput('0')).toBe(true); // Cancel command
            expect(isValidInput('00')).toBe(false); // Leading zeros
            expect(isValidInput(' 1 ')).toBe(false); // Spaces
        });
    });

    describe('isValidEmail', () => {
        test('should accept valid email formats', () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'firstname+lastname@company.org',
                'user123@test-domain.com',
                'a@b.co'
            ];

            validEmails.forEach(email => {
                expect(isValidEmail(email)).toBe(true);
            });
        });

        test('should reject invalid email formats', () => {
            const invalidEmails = [
                'invalid-email',
                '@domain.com',
                'user@',
                'user@domain',
                'user.domain.com',
                '',
                'user@domain.',
                'user name@domain.com', // Space in local part
                'user@domain .com' // Space in domain
            ];

            invalidEmails.forEach(email => {
                expect(isValidEmail(email)).toBe(false);
            });
        });
    });

    describe('isValidDateFormat', () => {
        test('should accept valid date format DD/MM/YYYY HH:MM', () => {
            const validDates = [
                '25/12/2024 14:30',
                '01/01/2025 00:00',
                '31/12/2023 23:59',
                '15/06/2024 12:45'
            ];

            validDates.forEach(date => {
                expect(isValidDateFormat(date)).toBeTruthy();
            });
        });

        test('should reject invalid date formats', () => {
            const invalidDates = [
                '2024-12-25 14:30', // Wrong format
                '25/12/24 14:30', // 2-digit year
                '25-12-2024 14:30', // Wrong separator
                '25/12/2024', // Missing time
                '14:30', // Missing date
                '25/12/2024 2:30', // Single digit hour
                '25/12/2024 14:5', // Single digit minute
                '',
                'invalid-date'
            ];

            invalidDates.forEach(date => {
                expect(isValidDateFormat(date)).toBeFalsy();
            });
        });
    });
});