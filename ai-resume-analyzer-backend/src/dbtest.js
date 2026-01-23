require("dotenv").config();
const pool = require("./db");

const testDB = async () => {
  try {
    const res = await pool.query("select now()");
    console.log("DB CONNECTED ✅", res.rows[0]);

    const insert = await pool.query(
      `insert into analysis_records 
       (resume_id, jd_title, parsed_resume, parsed_jd, analysis_result)
       values ($1, $2, $3, $4, $5)
       returning id`,
      [
        "test_resume_1",
        "Test Role",
        { test: "resume" },
        { test: "jd" },
        { test: "analysis" }
      ]
    );

    console.log("INSERT OK ✅ ID:", insert.rows[0].id);

    const read = await pool.query(
      `select * from analysis_records order by created_at desc limit 1`
    );

    console.log("READ OK ✅", read.rows[0]);

  } catch (err) {
    console.error("DB ERROR ❌", err);
  } finally {
    process.exit(0);
  }
};

testDB();
