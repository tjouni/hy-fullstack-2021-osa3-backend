require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const Person = require('./models/person');

const app = express();

app.use(express.static('build'));
app.use(express.json());
morgan.token('body', (request) => JSON.stringify(request.body));
app.use(morgan(':date[iso] :method :url :status :total-time ms :body'));

app.get('/info', (request, response, next) => {
  Person.countDocuments()
    .then((result) => response.send(
      `<p>Phonebook has info for ${result} people<br>${new Date()}</p>`,
    ))
    .catch((error) => next(error));
});

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((result) => response.json(result))
    .catch((error) => next(error));
});

app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body;
  if (!name || !number) {
    const errorMessage = { error: 'name and number are required' };
    return response.status(400).json(errorMessage).end();
  }
  const person = new Person({ name, number });
  return person
    .save({ runValidators: true })
    .then(() => response.json(person))
    .catch((error) => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((result) => (result ? response.json(result) : response.status(404).end()))
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;
  if (!name || !number) {
    const errorMessage = { error: 'name and number are required' };
    return response.status(400).json(errorMessage).end();
  }
  const person = { name, number };
  return Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((result) => (result ? response.json(result) : response.status(404).end()))
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => (result
      ? response.status(204).json(result).end()
      : response.status(404).end()))
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'invalid id' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }
  return next(error);
};

app.use(errorHandler);

const { PORT } = process.env;
app.listen(PORT, () => {});
