module.exports = function isZero(value) {
    if (value === undefined || value === null) return false;
    else {
        try {
            let newValue = parseFloat(value);
            if (newValue == 0) return false;
            else return true;
        } catch (err) {
            return false;
        }
    }
}
