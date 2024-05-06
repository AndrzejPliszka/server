module.exports = (req, res, next) => {
    res.header('X-Powered-By', 'Trzecia De');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, X-Api-Key');

    if (req.method === 'OPTIONS') {
        res.status(204).json();
        return;
    }

    next();
}
