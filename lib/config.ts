export const config = {
  DB1_HOST: process.env.DB1_HOST || process.env.DB_HOST || '127.0.0.1',
  DB1_PORT: process.env.DB1_PORT || process.env.DB_PORT || '3306',
  DB1_NAME: process.env.DB1_NAME || process.env.DB_DATABASE || 'linsilin_nextjs',
  DB1_USER: process.env.DB1_USER || process.env.DB_USER || 'root',
  DB1_PASSWORD: process.env.DB1_PASSWORD || process.env.DB_PASSWORD || '',
};
