import knex, { Knex } from 'knex';
import { config } from './config';
import moment from 'moment';

/* global singleton — prevents connection leak on Next.js hot-reload */
declare global {
  // eslint-disable-next-line no-var
  var _knexInstance: Knex | undefined;
}

const configKnex: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    pool: {
      min: 1,
      max: 5,
      afterCreate: (conn: any, done: any) => {
        conn.query('SET NAMES utf8mb4', (err: any) => done(err, conn));
      },
    },
    connection: {
      host: config.DB1_HOST,
      port: Number(config.DB1_PORT),
      database: config.DB1_NAME,
      user: config.DB1_USER,
      password: config.DB1_PASSWORD,
      charset: 'utf8mb4',
      typeCast: function (field: any, next: any) {
        if (field.type === 'DATETIME') {
          const fieldString = moment(field.string()).format('YYYY-MM-DD HH:mm:ss');
          if (moment(fieldString, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
            return fieldString;
          } else {
            return '';
          }
        }

        if (field.type === 'DATE') {
          const fieldString = moment(field.string()).format('YYYY-MM-DD');
          if (moment(fieldString, 'YYYY-MM-DD', true).isValid()) {
            return fieldString;
          } else {
            return '';
          }
        }

        return next();
      },
    },
  },
  production: {
    client: 'mysql2',
    connection: {
      host: config.DB1_HOST,
      port: Number(config.DB1_PORT),
      database: config.DB1_NAME,
      user: config.DB1_USER,
      password: config.DB1_PASSWORD,
    },
  },
};

const environment = process.env.NODE_ENV || 'development';
const knexConfig = configKnex[environment] || configKnex['development'];

const db = globalThis._knexInstance ?? knex(knexConfig);
if (process.env.NODE_ENV !== 'production') globalThis._knexInstance = db;

export default db;
