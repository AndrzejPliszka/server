const router = require('express').Router();

const auth = require('../middlewares/apiTokenAuth');

router.get(
    '/',
    (req, res, next) => { console.log('Próba wtargnięcia do strefy chronionej'); next(); },
    auth,
    (req, res, next) => { console.log('Próba zakończona pomyślnie'); next(); },
    (req, res, next) => res.json({data: {secretMessage: 'To jest tajna wiadomość dla Trzeciej De'}})
);

module.exports = router;
