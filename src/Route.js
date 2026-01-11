import Config from "./Config.js";
import mysql from "mysql";

const config = Config();

export class Route {
  constructor(app, upload) {
    this.app = app;
    this.upload = upload;
    this.handleDisconnect();
  }

  handleDisconnect() {
    this.connection = mysql.createConnection(config);
    console.log("db connection is success. ");
    /*
    this.connection.connect((err) => {
      if (err) {
        console.log("error when connecting to db : " + err);

        setTimeout(() => {
          this.handleDisconnect();
        }, 2000);
      }
      console.log("db connection is success. ");
    });*/

    this.connection.on("error", (err) => {
      console.log("db error : " + err);
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        return this.handleDisconnect();
      } else {
        throw err;
      }
    });
  }

  route() {
    const app = this.app;

    app.get("/", function (req, res) {
      res.render("index.html", {});
    });

    app.post("/update/prop", (req, res) => {
      const id = req.body.id;
      const prop = req.body.prop;
      console.log("/update/prop ? " + prop + " / " + id);
      const qry = `update game set config = '${prop}' where id = ${id}`;
      this.connection.query(qry, (err, row) => {
        if (err) {
          res.send("fail");
          return;
        }
        res.send("success");
      });
    });

    app.post("/fetch/prop", (req, res) => {
      const qry = `select * from game`;
      console.log("/fetch/prop");
      this.connection.query(qry, (err, row) => {
        if (err) {
          res.send("fail");
          return;
        }
        res.send(row);
      });
    });

    app.post("/fetch/prop-by-id", (req, res) => {
      const id = req.body.id;
      const qry = `select * from game where id=${id}`;
      console.log("/fetch/prop-by-id ? " + id);
      this.connection.query(qry, (err, row) => {
        if (err) {
          res.send("fail");
          return;
        }
        var arr = JSON.parse(row[0].config);
        var ret = {
          prop: arr[2],
          freespin: arr[3],
        };
        res.json(ret);
      });
    });

    app.post("/update/user-point", (req, res) => {
      const id = req.body.id;
      const point = req.body.point;
      console.log("/update/user-point ? " + id + " / " + point);
      const qry = `update user set point=${point} where id=${id}`;
      this.connection.query(qry, (err, row) => {
        if (err) {
          res.send("fail");
          return;
        }
        res.send("success");
      });
    });

    app.post("/fetch/users", (req, res) => {
      const qry = `select * from user`;
      console.log("/fetch/users");
      this.connection.query(qry, (err, row) => {
        if (err) {
          res.send("fail");
          return;
        }
        res.send(row);
      });
    });

    app.post("/update/user", (req, res) => {
      const id = req.body.id;
      const name = req.body.name;
      const email = req.body.email;
      const phone = req.body.phone;
      console.log("/update/user");
      const qry = `update user set name='${name}', email='${email}', phone='${phone}' where userId='${id}'`;
      this.connection.query(qry, (err, row) => {
        if (err) {
          res.send("fail");
          return;
        }
        res.send("success");
      });
    });

    app.get("/fetch/user-by-id/:id", (req, res) => {
      const id = req.params.id;

      const qry = `select * from user where id = ${id}`;
      console.log("/fetch/user-by-id ? " + id);
      this.connection.query(qry, (err, row) => {
        if (row != null && row.length === 1) {
          res.send(row[0]);
        } else {
          res.send("fail");
        }
      });
    });

    app.get("/fetch/freespin/:id", (req, res) => {
      const id = req.params.id;

      const qry = `select freespin from user where id = ${id}`;
      console.log("/fetch/freespin ? " + id);
      this.connection.query(qry, (err, row) => {
        if (row != null && row.length === 1) {
          res.send(row[0]);
        } else {
          res.send("fail");
        }
      });
    });

    app.post("/update/freespin-admin", (req, res) => {
      const id = req.body.id;
      const freespin = req.body.freespin;
      console.log("/update/freespin-admin ? " + id + " / " + freespin);
      const qry = `update user set freespin = ${freespin} where id = ${id}`;
      this.connection.query(qry, (err, row) => {
        if (err) {
          console.log(err);
          res.send("fail");
        } else {
          res.send("success");
        }
      });
    });

    app.post("/update/freespin", (req, res) => {
      const id = req.body.id;
      console.log("/update/freespin ? " + id);
      const qry = `update user set freespin = 99 where id = ${id}`;
      this.connection.query(qry, (err, row) => {
        if (err) {
          console.log(err);
          res.send("fail");
        } else {
          res.send("success");
        }
      });
    });

    app.post("/login", (req, res) => {
      const id = req.body.id;
      const name = req.body.name;
      const email = req.body.email;

      console.log("/login ? " + id + " / " + name + " / " + email);
      this.connection.query(
        `INSERT INTO user VALUES('${id}', '${name}', '${email}', '', '', '', 0, now(), now()) ON DUPLICATE KEY UPDATE name='${name}', updated=now()`,
        (err, row) => {
          if (err) throw err;
          this.connection.query(
            `SELECT nick, gold FROM user WHERE id = '${id}'`,
            (err, row) => {
              if (err) throw err;
              res.send(row[0]);
            }
          );
        }
      );
    });

    app.post("/user/delete", (req, res) => {
      const id = req.body.id;
      console.log("user delete " + id);

      this.connection.query(
        `DELETE FROM user WHERE id = '${id}'`,
        (err, row) => {
          if (err) throw err;
          res.send("success");
        }
      );
    });

    app.post("/user/create", (req, res) => {
      const id = req.body.id;
      const name = req.body.name;
      const email = req.body.email;
      const nick = req.body.nick;
      const phone = req.body.phone;
      const address = req.body.address;
      const gold = req.body.gold;
      console.log("user create " + id + " / " + name + " / " + email);
      this.connection.query(
        `INSERT INTO user VALUES('${id}','${name}','${email}', '${nick}','${phone}', '${address}', ${gold}, now(), now())`,
        (err, row) => {
          if (err) throw err;
          res.send("success");
        }
      );
    });

    app.post("/user/update", (req, res) => {
      const id = req.body.id;
      const name = req.body.name;
      const email = req.body.email;
      const nick = req.body.nick;
      const phone = req.body.phone;
      const address = req.body.address;
      const gold = req.body.gold;
      console.log(
        "user update " + id + " / name " + name + " / email " + email
      );
      this.connection.query(
        `UPDATE user SET name='${name}',email='${email}',nick='${nick}',phone='${phone}',address='${address}',gold=${gold} WHERE id = '${id}'`,
        (err, row) => {
          if (err) throw err;
          res.send("success");
        }
      );
    });

    app.post("/user", (req, res) => {
      this.connection.query(
        `SELECT * FROM user ORDER BY created DESC`,
        (err, row) => {
          if (err) throw err;
          res.json(row);
        }
      );
    });

    app.post("/user-by-id", (req, res) => {
      const id = req.body.id;
      this.connection.query(
        `SELECT * FROM user WHERE id = '${id}'`,
        (err, row) => {
          if (err) throw err;
          if (row.length > 0) {
            res.json(row[0]);
          } else {
            res.send(null);
          }
        }
      );
    });

    app.post("/fetch-gift-count", (req, res) => {
      const uid = req.body.uid;
      console.log("fetch-gift-count " + uid);

      this.connection.query(
        `SELECT count(*) as gift FROM lot WHERE uid='${uid}' AND gift=1`,
        (err, row) => {
          if (err) throw err;
          if (row.length > 0) {
            res.send(row[0]);
          } else {
            res.send(null);
          }
        }
      );
    });

    app.post("/fetch-gcache-count", (req, res) => {
      const uid = req.body.uid;
      console.log("fetch-gcache-count " + uid);

      this.connection.query(
        `SELECT count(*) as gift FROM lot WHERE uid='${uid}' AND gift=2`,
        (err, row) => {
          if (err) throw err;
          if (row.length > 0) {
            console.log(row[0]);
            res.send(row[0]);
          } else {
            res.send(null);
          }
        }
      );
    });

    app.post("/my-room", (req, res) => {
      const uid = req.body.uid;
      console.log("my-room " + uid);

      this.connection.query(
        `SELECT * FROM room JOIN (SELECT roomid, ranking, created FROM lot WHERE uid='test1' and (ranking <= 1)) AS lot ON room.id = lot.roomid ORDER BY created DESC`,
        (err, row) => {
          if (err) throw err;
          res.send(row);
        }
      );
    });

    app.post("/payment/create", (req, res) => {
      const uid = req.body.uid;
      const type = req.body.type;
      console.log("payment create " + uid + " / " + type);

      this.connection.query(
        `INSERT INTO payment VALUES(null, '${uid}', ${type}, now())`,
        (err, row) => {
          if (err) throw err;
          res.send("success");
        }
      );
    });

    app.post("/gold/create", (req, res) => {
      const uid = req.body.uid;
      const type = req.body.type;
      const gold = req.body.gold;
      const total = req.body.total;
      console.log(
        "gold create " + uid + " / " + type + "/ " + gold + "/" + total
      );
      this.connection.query(
        `UPDATE user SET gold = ${total} WHERE id = '${uid}'`,
        (err, row) => {
          if (err) throw err;

          this.connection.query(
            `INSERT INTO gold_history VALUES(null, '${uid}', ${type}, ${gold}, ${total}, now())`,
            (err, row) => {
              if (err) throw err;
              res.send("success");
            }
          );
        }
      );
    });

    app.post("/update-gcache-gift", (req, res) => {
      const uid = req.body.uid;
      const roomid = req.body.roomid;
      console.log("update-gcache-gift " + uid + " / " + roomid);
      this.connection.query(
        `UPDATE lot SET gift = 2 WHERE uid = '${uid}' AND roomid = ${roomid}`,
        (err, row) => {
          if (err) throw err;
          res.send("success");
        }
      );
    });

    app.post("/request-gift", (req, res) => {
      const uid = req.body.uid;
      const phone = req.body.phone;
      const roomid = req.body.roomid;

      console.log(
        "request-gift " + uid + " / phone " + phone + " / roomid " + roomid
      );
      this.connection.query(
        `UPDATE user SET phone = '${phone}' WHERE id = '${uid}'`,
        (err, row) => {
          if (err) throw err;

          this.connection.query(
            `UPDATE lot SET gift = 1 WHERE uid = '${uid}' AND roomid = ${roomid}`,
            (err, row) => {
              if (err) throw err;
              res.send("success");
            }
          );
        }
      );
    });

    app.post("/check-gift", (req, res) => {
      const uid = req.body.uid;
      const roomid = req.body.roomid;
      const ret = {};

      console.log("check-gift " + uid + " / " + roomid);
      this.connection.query(
        `SELECT gift FROM lot WHERE uid = '${uid}' AND roomid=${roomid}`,
        (err, row) => {
          if (err) throw err;
          if (row.length > 0) {
            ret.gift = Number(row[0].gift);
            this.connection.query(
              `SELECT phone FROM user WHERE id = '${uid}'`,
              (err, row) => {
                if (err) throw err;
                if (row.length > 0 && row[0].phone) {
                  ret.phone = row[0].phone;
                  res.send(ret);
                } else {
                  res.send(null);
                }
              }
            );
          } else {
            res.send(null);
          }
        }
      );
    });

    app.post("/lot/create", (req, res) => {
      const uid = req.body.uid;
      const roomid = req.body.roomid;
      const lot = req.body.lot;
      const ment = req.body.ment;
      console.log(
        "lot create " + uid + " / " + roomid + "/ " + lot + "/" + ment
      );
      this.connection.query(
        `INSERT INTO lot VALUES(null,'${uid}',${roomid}, '${lot}', now(), '${ment}', null, 0)`,
        (err, row) => {
          if (err) throw err;

          this.connection.query(
            `UPDATE room SET current = current + 1 WHERE id = ${roomid}`,
            (err, row) => {
              if (err) throw err;
              res.send("success");
            }
          );
        }
      );
    });

    app.post("/lot", (req, res) => {
      const roomid = req.body.roomid;
      this.connection.query(
        `SELECT lot.*,u.name FROM lot LEFT JOIN (SELECT id, name FROM user) AS u on lot.uid = u.id WHERE roomid = ${roomid} ORDER BY created DESC`,
        (err, row) => {
          if (err) throw err;
          res.json(row);
        }
      );
    });

    app.post("/lot/delete", (req, res) => {
      const id = req.body.id;
      const roomid = req.body.roomid;
      console.log("lot delete " + id);

      this.connection.query(`DELETE FROM lot WHERE id = ${id}`, (err, row) => {
        if (err) throw err;
        this.connection.query(
          `UPDATE room SET current = current - 1 WHERE id = ${roomid}`,
          (err, row) => {
            if (err) throw err;
            res.send("success");
          }
        );
      });
    });

    app.post("/lot/update", (req, res) => {
      const id = req.body.id;
      const ment = req.body.ment;
      const gift = req.body.gift;
      console.log("lot update " + id + " / ment " + ment + " / gift " + gift);
      this.connection.query(
        `UPDATE lot SET ment = '${ment}', gift = ${gift} WHERE id = ${id}`,
        (err, row) => {
          if (err) throw err;
          res.send("success");
        }
      );
    });

    app.post("/lot/update-ranking", (req, res) => {
      const id = req.body.id;
      const ranking = req.body.ranking;
      console.log("lot update " + id + " / ranking " + ranking);
      this.connection.query(
        `UPDATE lot SET ranking = ${ranking} WHERE id = ${id}`,
        (err, row) => {
          if (err) throw err;
          res.send("success");
        }
      );
    });

    app.post("/bingo/update", (req, res) => {
      const id = req.body.id;
      const status = req.body.status;
      console.log("bingo update " + id + " / status " + status);
      this.connection.query(
        `UPDATE bingo SET status = ${status} WHERE id = ${id}`,
        (err, row) => {
          if (err) throw err;
          res.send("success");
        }
      );
    });

    app.post("/bingo/delete", (req, res) => {
      const id = req.body.id;
      console.log("bingo delete " + id);
      this.connection.query(
        `DELETE FROM bingo WHERE id = ${id}`,
        (err, row) => {
          if (err) throw err;
          res.send("success");
        }
      );
    });

    app.post("/bingo-by-exp", (req, res) => {
      const exp = req.body.exp;
      console.log("bingo-by-exp, exp " + exp);
      this.connection.query(
        `SELECT * FROM bingo WHERE expired = '${exp}'`,
        (err, row) => {
          if (err) throw err;
          if (row.length > 0) {
            res.json(row[0]);
          } else {
            res.send(null);
          }
        }
      );
    });

    app.post("/bingo", (req, res) => {
      this.connection.query(
        `SELECT * FROM bingo ORDER BY id DESC`,
        (err, row) => {
          if (err) throw err;
          res.json(row);
        }
      );
    });

    app.post("/bingo/create", (req, res) => {
      const lot = req.body.lot;
      const expired = req.body.expired;
      console.log("bingo create " + lot + " / " + expired);
      this.connection.query(
        `INSERT INTO bingo VALUES(null, '${lot}', '${expired}', 0)`,
        (err, row) => {
          if (err) throw err;
          res.send("success");
        }
      );
    });

    app.post("/room/create", (req, res) => {
      const price = req.body.price;
      const total = req.body.total;
      const expired = req.body.expired;
      console.log("room create " + price + " / " + total);
      this.connection.query(
        `INSERT INTO room VALUES(null, ${price}, 0 , ${total}, '${expired}')`,
        (err, row) => {
          if (err) throw err;
          res.send("success");
        }
      );
    });

    app.post("/room/check", (req, res) => {
      const id = req.body.id;

      this.connection.query(
        `SELECT current, total FROM room WHERE id = ${id}`,
        (err, row) => {
          if (err) throw err;
          if (row.length > 0) {
            if (row[0].current + 1 <= row[0].total) {
              res.send(true);
            } else {
              res.send(false);
            }
          } else {
            res.send(false);
          }
        }
      );
    });

    app.post("/room", (req, res) => {
      this.connection.query(
        `SELECT * FROM room ORDER BY id DESC`,
        (err, row) => {
          if (err) throw err;
          res.json(row);
        }
      );
    });

    app.post("/room-for-app", (req, res) => {
      const expired = req.body.expired;
      this.connection.query(
        `SELECT * FROM room WHERE expired='${expired}' ORDER BY id DESC`,
        (err, row) => {
          if (err) throw err;
          res.json(row);
        }
      );
    });

    app.post("/paid-roomid", (req, res) => {
      const uid = req.body.uid;
      const created = req.body.created;
      this.connection.query(
        `SELECT roomid FROM lot WHERE created >= '${created}' AND uid='${uid}' GROUP BY roomid`,
        (err, row) => {
          if (err) throw err;
          res.json(row);
        }
      );
    });

    app.post("/room-by-id", (req, res) => {
      const id = req.body.id;
      this.connection.query(
        `SELECT * FROM room WHERE id = ${id}`,
        (err, row) => {
          if (err) throw err;
          if (row.length > 0) res.json(row[0]);
          else res.send(null);
        }
      );
    });

    app.post("/room/delete", (req, res) => {
      const id = req.body.id;
      console.log("room delete " + id);
      this.connection.query(`DELETE FROM room WHERE id = ${id}`, (err, row) => {
        if (err) throw err;
        res.send("success");
      });
    });

    app.post("/join_old", (req, res) => {
      const id = req.body.id;
      const pw = req.body.pw;
      const name = req.body.name;
      const email = req.body.email;
      const phone = req.body.phone;
      console.log("/join ? " + id + " / " + name);
      this.connection.query(
        `insert into user values(null, '${id}', '${pw}', '${name}', '${email}', '${phone}', 0, 99)`
      );
      res.send("success");
    });

    app.post("/login_old", (req, res) => {
      const id = req.body.id;
      const pw = req.body.pw;
      console.log("/login ? " + id + " / " + pw);
      const qry = `select * from user where userId='${id}' and pw = '${pw}'`;
      this.connection.query(qry, (err, row) => {
        if (err) {
          console.log(err);
          res.send("fail");
          return;
        }
        if (row.length == 1) {
          const r = {
            res: "success",
            id: row[0].id,
            userId: row[0].userId,
            name: row[0].name,
            point: row[0].point,
          };
          res.send(r);
        } else {
          const r = {
            res: "fail",
          };
          res.send(r);
        }
      });
    });

    //1. enetry point
    app.listen(1231, function () {
      console.log("SLOTCHAT SERVER listen on *:1231");
    });
  }
}
