import express from 'express';
import router from './router';
import flash from 'req-flash';

export const app = express();
app.use(router);
app.use(flash());
