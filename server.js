const express = require('express');
const cors = require('cors');
const {MongoClient, ObjectID} = require('mongodb');
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'Files/test/'); // Uploads will be saved in the "uploads" directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original filename
  }
});
const upload = multer({ storage: storage });
console.log(upload)
app.listen(port, () => {
  console.log(`Serwer działa ${port}`);
});

const uri = `mongodb+srv://andrzejpliszka:${process.env.databasePass}@mapdatabase.9gq7ztn.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect((err, database) => {
  if (err) {
    console.error('Błąd połączenia z bazą danych:', err);
    return;
  }

  app.get('/get-country-info', async (req, res) => {
    try {
      const tag = req.query.tag
      const date = req.query.date
      const message = await database.db('MapDatabase').collection('CountryInfo').find({$and: [{tag: tag}, {date: {$lte: date}}]}).sort({date: -1}).toArray();
      console.log(message[0]);
      res.json({ message: message[0] });
    } catch (error) {
      console.error('Błąd przy pobieraniu danych:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
    app.get('/get-current-events', async (req, res) => {
    try {
      const date = req.query.date;
      const events = await database.db('MapDatabase').collection('WorldEvents').find({date: date}).toArray();
      const battles = await database.db('MapDatabase').collection('CurrentBattles').find({$and: [{start_date: {$lte: date}}, {end_date: {$gte: date}}]}).sort({date: -1}).toArray();
      const wars = await database.db('MapDatabase').collection('CurrentWars').find({$and: [{start_date: {$lte: date}}, {end_date: {$gte: date}}]}).sort({date: -1}).toArray();
      console.log(events[0]);
      res.json({ 
        events: events[0].events,
        battles: battles.map((object) => object.battle_name),
        wars: wars.map(object => object.war_name)
      });
    } catch (error) {
      console.error('Błąd przy pobieraniu danych:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
   app.get('/get-country-description', async (req, res) => {
    try {
      const tag = req.query.tag;
      const date = req.query.date;
      const message = await database.db('MapDatabase').collection('CountryDescriptions').find({$and: [{tag: tag}, {start_date: {$lte: date}}, {end_date: {$gte: date}}]}).sort({date: -1}).toArray();
      console.log(message[0]);
      res.json({ message: message[0] });
    } catch (error) {
      console.error('Błąd przy pobieraniu danych:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.get('/get-clickable-countries', async (req, res) => {
    try {
      const date = req.query.date;
      const countries = await database.db('MapDatabase').collection('CountryDescriptions').find({$and: [{start_date: {$lte: date}}, {end_date: {$gte: date}}]}).toArray();
      console.log(countries);
      res.json({ countries: countries });
    } catch (error) {
      console.error('Błąd przy pobieraniu danych:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  
  app.get('/download-map', async (req, res) => {
    try {
      console.log(req.query)
      const date = req.query.date;
      console.log(date)
      let tag = [], width = [], height = [], x_pos = [], y_pos = [], svg = [], start_date = [];
      const map_tag_info = await database.db('MapDatabase').collection('MapTagInfo').find({ $and: [{start_date: {$lte: date}}, {end_date: {$gte: date}}]}).sort({z_index: 1}).toArray();
      for(let i = 0; i < map_tag_info.length; i++){
          tag.push(map_tag_info[i].tag_name);
          width.push(map_tag_info[i].width);
          height.push(map_tag_info[i].height);
          x_pos.push(map_tag_info[i].x_pos);
          y_pos.push(map_tag_info[i].y_pos);
          const map_info = await database.db('MapDatabase').collection('MapInfo').find({ $and: [{start_date: {$lte: date}}, {map_tag: tag[i]}]}).sort({start_date: -1}).toArray();
          svg.push(map_info[0].svg_code);
          start_date.push(map_info[0].start_date)
      }
      res.json({
        "tag": tag,
        "width": width,
        "height": height,
        "x_pos": x_pos,
        "y_pos": y_pos,
        "svg_code": svg,
        "start_date": start_date
               });
    } catch (error) {
      console.error('Błąd przy pobieraniu danych:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  app.get('/get-map-tags', async (req, res) =>{
    try {
      const map_tag_info = await database.db('MapDatabase').collection('MapTagInfo').find().toArray();
      console.log(typeof map_tag_info)
      res.json({
        "info": map_tag_info})
    } catch (error) {
      console.error('Błąd przy pobieraniu danych:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  
  app.get('/get-last-update-date', async(req, res) =>{
    try{
      const id = ObjectID("6624c5f67d284d5808b68fef");
      const lastUpdateDate = await database.db('MapDatabase').collection('LastUpdateDate').find({_id: id}).toArray();
      console.log(lastUpdateDate)
      res.json({date: lastUpdateDate[0].currentDate})
    } catch (error) {
      console.error('Błąd przy pobieraniu danych:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  
  //call  this method when updating data in database
  app.post('/update-last-update-date', async(req, res) => {
    try{
      const id = ObjectID("6624c5f67d284d5808b68fef");
      const date = new Date();
      const updateDate = await database.db('MapDatabase').collection('LastUpdateDate').updateOne({_id: id},{
        $set: {currentDate: date}
      });
    } catch (error) {
      console.error('Błąd przy pobieraniu danych:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  })
  //admin panel functions
  app.post('/add-map', async (req, res) => {
    try {
      console.log(req.body.password === process.env.adminPass, req.body.password, process.env.adminPass);
      //change !!!!! SAFTY 
      if(req.body.password !== process.env.adminPass){return 0; res.status(500).json({ error: 'Wrong Pass' });}
      res.sendStatus(200);
      await database.db('MapDatabase').collection('MapInfo').insertOne({
        "map_tag": req.body.map_tag,
        "start_date": req.body.start_date,
        "svg_code": req.body.svg_code
      })
    } catch (error) {
      console.error('Błąd przy pobieraniu danych:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  app.post('/add-country-info', upload.single('anthem'), async (req, res) => {
    console.log(req);
    console.log(req.body);
    console.log(req.file);
  })
});