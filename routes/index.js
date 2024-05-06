var express = require('express');
var router = express.Router();

const { validateRequest } = require('zod-express-middleware');
const { z } = require('zod');

router.get('/', function(req, res, next) {
  res.json({ hello: 'world' });
});

router.post(
    '/',
    validateRequest({ body: z.object({
        imie: z.string(),
        nazwisko: z.string().min(5),
        wiek: z.number().max(99),
      }) }),
    (req, res, next) => res.status(201).json({data:req.body}),
);

module.exports = router;
