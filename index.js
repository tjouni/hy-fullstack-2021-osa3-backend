const express = require("express");
const morgan = require("morgan");
const app = express();
app.use(express.json());

morgan.token("body", (request) => JSON.stringify(request.body));

app.use(morgan(":date[iso] :method :url :status :total-time ms :body"));

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
];

app.get("/info", (request, response) => {
  return response.send(
    `<p>Phonebook has info for ${persons.length} people<br>${new Date()}</p>`
  );
});

app.get("/api/persons", (request, response) => {
  return response.json(persons);
});

app.post("/api/persons", (request, response) => {
  const id = Math.floor(Math.random() * Math.floor(9999999999));
  const { name, number } = request.body;
  if (!name || !number) {
    const errorMessage = { error: "name and number are required" };
    return response.status(400).json(errorMessage).end();
  }
  if (persons.find((p) => p.name.toLowerCase() === name.toLowerCase())) {
    const errorMessage = { error: "name must be unique" };
    return response.status(400).json(errorMessage).end();
  }
  const person = {
    name,
    number,
    id,
  };
  persons = persons.concat(person);
  return response.json(person);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((p) => p.id === id);
  if (person) {
    return response.json(person);
  }
  return response.status(404).end();
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((p) => p.id === id);
  if (!person) {
    return response.status(404).end();
  }
  persons = persons.filter((p) => p.id !== id);
  return response.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
