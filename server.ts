import { Database } from "sqlite3";
import * as fastify from "fastify";
import { DefaultQuery } from "fastify";
import * as cors from "cors";

const f = fastify({ logger: true });
f.use(cors());

const db = new Database("main.db");

f.get("/chores", (request, reply) => {
  db.all(
    `select id, task, frequency, last_done, date(last_done, '+' || frequency || ' day') as next_date from tasks order by next_date`,
    (err, data) => {
      reply.send(data);
    }
  );
});

f.post<DefaultQuery, { id: string }>("/chores/:id/bump", (request, reply) => {
  console.log(request.params.id);
  // language=SQLite
  const stmt = db.prepare(
    `update tasks set last_done = current_date where id = ?`
  );
  stmt.run(request.params.id, (err, data) => {
    reply.send({ status: "ok" });
  });
});

const start = async () => {
  try {
    await f.listen(1234);
    f.log.info(`server listening on ${f.server.address().port}`);
  } catch (err) {
    f.log.error(err);
    process.exit(1);
  }
};
start();
