import pg from "pg";

const pool = new pg.Pool({
    host: "localhost",
    port: 5432,
    user: "gideon",
    password: "localdev",
    database: "job_tracker",
});

export default pool;