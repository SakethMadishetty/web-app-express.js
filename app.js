const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT || 3000;
const monk = require('monk')

const db = monk('localhost:27017/Arcade');
const Games = db.get('Games'); 

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
  res.redirect('/games');
});

app.get('/games', async (req, res) => {
    try {
        const { search, type } = req.query;
        let query = {};
        if (search) {
          query.name = new RegExp(search, 'i');
        }
        if (type) {
          query.type = type;
        }
    
        const games = await Games.find(query);
        res.render('index', { games, search, type });
      } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});
  
  app.get('/games/new', (req, res) => {
    res.render('addGames');
  });
  
  app.get('/games/:id', async (req, res) => {
    const game = await Games.findOne({ _id: req.params.id });
    // console.log(game)
    res.render('gameDetails', { game });
  });
  
  app.get('/games/:id/edit', async (req, res) => {
    const game = await Games.findOne({ _id: req.params.id });
    res.render('editGameForm', { game });
  });

  app.post('/games', async (req, res) => {
    const {
      name,
      description,
      type,
      minimumAge,
      hourlyPrice,
      perGamePrice,
      imageDescription,
      imagePath,
    } = req.body;
    try {
        await Games.insert({
            name,
            description,
            type,
            minimumAge: parseInt(minimumAge),
            pricing: {
              hourly: hourlyPrice,
              perGame: perGamePrice
            },
            image: {
              description: imageDescription,
              path: imagePath
            }
          });
            res.redirect('/games');
    } catch (error) {
      res.status(500).send('Error adding the new game.');
    }
  });
  
  app.put('/games/:id', async (req, res) => {
    const {
      name,
      description,
      type,
      minimumAge,
      hourlyPrice,
      perGamePrice,
      imageDescription,
      imagePath,
    } = req.body;
    
    console.log("input data",req.body)
    try {
        await Games.findOneAndUpdate({ _id: req.params.id }, {
            $set: {
              name: name,
              description: description,
              type: type,
              minimumAge: parseInt(minimumAge),
              pricing: {
                hourly: hourlyPrice,
                perGame: perGamePrice
              },
              image: {
                description: imageDescription,
                path: imagePath
              }
            }
          });
      res.redirect(`/games/${req.params.id}`);
    } catch (error) {
      res.status(500).send('Error updating the game.');
    }
  });
  
  app.delete('/games/:id', async (req, res) => {
    try {
        await Games.findOneAndDelete({ _id: req.params.id });
      res.redirect('/games');
    } catch (error) {
      res.status(500).send('Error deleting the game.');
    }
  });
  
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
