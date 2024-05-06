module.exports = (req, res, next) => {
    res.status(404).json({
        error: `Sciezka ${req.path} nie istnieje`,
        meta: {
            path: req.path,
            method: req.method,
            headers: req.headers,
        },
    });
};
