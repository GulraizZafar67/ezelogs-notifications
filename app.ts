import 'reflect-metadata'
import {InversifyExpressServer} from "inversify-express-utils";
const express = require('express');
import {container} from "./IcoConfig";
const bodyParser = require('body-parser');
const port = 3000;
const cors = require('cors');
import * as dotenv from 'dotenv'; 





dotenv.config()

const server = new InversifyExpressServer(container)

server.setConfig((app) => {
  app.use(express.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(
  cors({
    origin: ['http://localhost:3030', 'https://dev.ezelogs.com'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // only if you use cookies / auth
  })
);


})

const app = server.build()



app.listen(process.env.PORT, () => {
  console.log(`Example app listening at http://localhost:${process.env.PORT}`)
})
