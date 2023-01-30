const express = require('express');
const path = require('path');
const db = require('./config/connection');

const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require(
  "@apollo/server/express4");
const { ApolloServerPluginDrainHttpServer } = require("@apollo/server/plugin/drainHttpServer");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const { typeDefs, resolvers } = require("./schemas/index");
const { authMiddleware } = require("./utils/auth");

const app = express();
const PORT = process.env.PORT || 3001;

const httpServer = http.createServer(app);
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

const startApolloServer = async () => {
  await server.start();
  app.use(
    '/',
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: authMiddleware,
    }),
  );

  db.once('open', () => {
    app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
  });
};

startApolloServer();
