const express = require('express');
const app = express();

app.use(express.json());

const api = require('./api');
app.use('/api/v1', api);

const cdn = require('./cdn');
app.use('/cdn/v1/', cdn);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/views/index.html');
})

function notFound(req, res, next) {
    res.status(404);
    const error = new Error(`Not Found - ${req.originalUrl}`);
    next(error);
}

app.use(notFound);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is listening...`);
})