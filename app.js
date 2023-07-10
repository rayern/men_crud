const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();

const dbService = require('./dbService');

app.use(express.static('./public'))
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/callAPI', async (request, response) => {
    const db = dbService.getDbServiceInstance();
    let { count } = request.body;
    count = count ? parseInt(count, 10) : 1;
    const url = process.env.API + "?words=" + count
    try {
        const res = await axios.get(url)
        if (res.data.error) {
            throw new Error(res.data.error.message);
        }
        else {
            let words = []
            for (let i = 0; i < res.data.length; i++) {
                const word = await db.processWord(res.data[i])
                words.push(word)
            }
            console.log(words)
            response.json({ success: true, data: words });
        }
    }
    catch (error) {
        response.json({ success: false, message: error.message });
    };
});

app.get('/getAll', (request, response) => {
    const db = dbService.getDbServiceInstance();
    const result = db.getAllData(request.query.orderby, request.query.order);
    result
        .then(data => response.json({ data: data }))
        .catch(err => console.log(err));
})

app.patch('/update', (request, response) => {
    const { id, name } = request.body;
    const db = dbService.getDbServiceInstance();
    const result = db.updateNameById(id, name);
    result
        .then(data => response.json({ success: data }))
        .catch(err => console.log(err));
});

app.delete('/delete/:id', (request, response) => {
    const { id } = request.params;
    const db = dbService.getDbServiceInstance();
    const result = db.deleteRowById(id);
    result
        .then(data => response.json({ success: data }))
        .catch(err => console.log(err));
});

app.post('/search', (request, response) => {
    let { name } = request.body;
    const db = dbService.getDbServiceInstance();
    const result = db.searchByName(name);
    result
        .then(data => response.json({ data: data }))
        .catch(err => console.log(err));
})

app.listen(process.env.PORT, () => console.log('app is running'));