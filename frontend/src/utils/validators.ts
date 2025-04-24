function recordLocatorValidator(recordLocator: string): boolean {
    // Check if the string is empty or consists only of digits 0-9
    const digitRegex = /^[0-9]*$/
    return digitRegex.test(recordLocator)
}

function currencyValidator(amount: string): boolean {
    // Basic check for valid currency format with or without leading $
    const currencyRegex = /^\$?(\d+)(\.\d{2})?$|^\$?(0\.\d{2})$/

    // Check for the case where we have a decimal without a leading 0
    if (/^\$?\.\d{2}$/.test(amount)) {
        return false // Reject .XX format, should be 0.XX
    }

    // Reject if it's just a dollar sign or decimal point or empty
    if (amount === '$' || amount === '.' || amount === '$.' || amount === '') {
        return false
    }

    return currencyRegex.test(amount)
}

function nonEmptyFieldValidator(value: string): boolean {
    return value.trim() !== ''
}

export {recordLocatorValidator, currencyValidator, nonEmptyFieldValidator}