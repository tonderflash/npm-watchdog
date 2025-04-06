const express = require("express");
const axios = require("axios");
const _ = require("lodash");

const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      "https://jsonplaceholder.typicode.com/users"
    );
    const users = response.data;

    // Usar lodash para transformar los datos
    const simplifiedUsers = _.map(users, (user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));

    res.json(simplifiedUsers);
  } catch (error) {
    res.status(500).json({ error: "Ocurrió un error" });
  }
});

// Este código no se ejecutará, pero es para probar que npm-watchdog
// encuentra correctamente las dependencias en el código fuente
if (false) {
  const typescript = require("typescript");
  console.log(typescript.version);
}

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
