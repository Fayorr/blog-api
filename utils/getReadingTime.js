// helper function to calculate reading time

const getReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text.split(' ').length;
    const minutes = words / wordsPerMinute;
    return Math.ceil(minutes);
};

module.exports = getReadingTime;
