import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import { Route } from "./Route.js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";

export default class App {
  constructor() {
    this.app = express();
    this.bodyParser = bodyParser;
    const __filename = fileURLToPath(import.meta.url);
    this.__dirname = path.dirname(__filename);
  }

  route() {
    const route = new Route(this.app, this.upload);
    route.route();
  }

  init() {
    this.app.set("view engine", "ejs");
    this.app.engine("html", ejs.renderFile);
    this.app.use("/assets", express.static(this.__dirname + "/../assets"));
    this.app.use("/preview", express.static(this.__dirname + "/../preview"));
    /*
    this.app.use("/uploads", (req, res, next) => {
      console.log(req.params.session);
      try {
        const session = JSON.parse(decodeURIComponent(req.params.session));
        console.log(session);
        //console.log(`customer = ${customer}, cid = ${cid}`);
        let isAuth = false;
        if (isAuth) {
        } else {
          res.send("접근 권한이 없습니다. (Code:403)");
        }
      } catch (e) {
        res.send("접근 권한이 없습니다. (Code:403)");
      }
    });*/

    this.app.use(
      this.bodyParser.urlencoded({
        extended: true,
      })
    );
    this.app.use(this.bodyParser.json());
    this.app.use(cors());
  }

  start() {
    this.init();
    this.route();
  }
}
