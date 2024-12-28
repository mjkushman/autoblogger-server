\echo 'Delete and recreate autoblogger db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE autoblogger;
CREATE DATABASE autoblogger;
\connect autoblogger

\i autoblogger-schema.sql
\i autoblogger-seed.sql

\echo 'Delete and recreate autoblogger_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE autoblogger_test;
CREATE DATABASE autoblogger_test;
\connect autoblogger_test

\i autoblogger-schema.sql
