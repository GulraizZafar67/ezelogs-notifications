import 'reflect-metadata'
import {InversifyExpressServer} from "inversify-express-utils";
const express = require('express');
import {container} from "./IcoConfig";
const bodyParser = require('body-parser');
const port = 3000;
import cors from 'cors';
import * as dotenv from 'dotenv'; 


dotenv.config()

const server = new InversifyExpressServer(container)

server.setConfig((app) => {
  app.use(express.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(cors());

})

const app = server.build()



app.listen(process.env.PORT, () => {
  console.log(`Example app listening at http://localhost:${process.env.PORT}`)
})
