module.exports = (req, res, next) => {
    const token = 'NotSoSecret';

    if (token === req.headers['x-api-key']) {
        return next();
    }

    res.status(401).json({
        error: 'Wymagana autoryzacja',
    });
};
