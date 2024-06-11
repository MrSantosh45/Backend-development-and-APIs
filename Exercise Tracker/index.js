const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// In-memory storage
const users = [];
const exercises = [];

// Helper function to find a user by ID
const findUserById = (id) => users.find((user) => user._id === id);

// Route to create a new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const userId = String(users.length + 1);
  const newUser = { username, _id: userId };
  users.push(newUser);
  res.json(newUser);
});

// Route to get a list of all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Route to add an exercise to a user
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  const user = findUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const exercise = {
    userId,
    description,
    duration: Number(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
  };
  exercises.push(exercise);

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: user._id,
  });
});

// Route to get a user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  const user = findUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let userExercises = exercises.filter((exercise) => exercise.userId === userId);

  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter((exercise) => new Date(exercise.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter((exercise) => new Date(exercise.date) <= toDate);
  }

  if (limit) {
    userExercises = userExercises.slice(0, Number(limit));
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: userExercises.length,
    log: userExercises.map(({ description, duration, date }) => ({
      description,
      duration,
      date,
    })),
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
