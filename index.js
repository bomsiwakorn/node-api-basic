const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const PORT = 5000
const mysql = require('mysql')

app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const db = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : 'b0846485675.',
    database : 'test'
});

// test connection
// db.query('SELECT * from users', (error, results) => {
//     if (error) throw error;
//     console.log('The solution is: ', results[0]);
// });

function registerService(username,password) {
    return new Promise((resolve,reject) => {
        const sql = `insert into users (username,password) values ('${username}', '${password}')`
        db.query(sql, (error, result) => {
            if (error) return reject(error)
            return resolve()
        })
    })
}
app.post('/register', async (req,res) => {
    try {
        const username = req.body.username
        const password = req.body.password
        const insert = await registerService(username,password)
        return res.status(200).send({
            message: 'Register successful.'
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: 'Error!'
        })
    }
})


function loginService(username,password) {
    return new Promise((resolve,reject) => {
        const sql = `select * from users where username = '${username}'`
        db.query(sql, (error, result) => {
            if (error) return reject(error)
            if (result.length === 0) return reject({
                code: '001',
                msg: 'ไม่พบUsernameนี้ในระบบ'
            })
            if (result[0].password !== password) return reject({
                code: '002',
                msg: 'รหัสผ่านของคุณไม่ถูกต้อง'
            })

            return resolve(result)
            
        })
    })
}
app.post('/login', async (req,res) => {
    try {
        const username = req.body.username
        const password = req.body.password
        const data = await loginService(username,password)
        console.log(data);
        return res.status(200).send({
            message: 'Login successful.',
            username: data[0].username
        })
    } catch (error) {
        console.log(error);
        if (error.code === '001' || error.code === '002') {
            return res.status(403).send({
                message: error.msg
            })
        }
        return res.status(500).send({
            message: 'Error!'
        })
    }
})


function productService() {
    return new Promise((resolve,reject) => {
        const sql = `select product.id, product.product_name, product.price, type.type_name from product
        inner join type on product.type_id = type.type_id;`
        db.query(sql, (error,results) => {
            if (error) return reject(error)
            // console.log(results);
            return resolve(results)
        })
    })
}
app.get('/products', async (req,res) => {
    try {
        const products = await productService()
        return res.status(200).send(products)
    } catch (error) {
        return res.status(500).send({
            message: 'Error!'
        })
    }
})

app.listen(PORT, () => console.log(`Server is started on Port ${PORT}`))

