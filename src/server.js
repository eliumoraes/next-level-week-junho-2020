const express = require("express")
const server = express()

// Pegar o banco de dados
const db = require("./database/db")

// Configurar pasta pública
server.use(express.static("public"))

// Habilitar o uso do req.body na nossa aplicação
server.use(express.urlencoded({ extended: true}))

// Utilizando template engine
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})

// OConfigurar caminhos da minha aplicaçao
// Página inicial:
// req: Requisiçao
// res: Resposta
server.get("/", (req, res) => {
    return res.render("index.html", { title: "Seu marketplace de coleta de resíduos!" })
})

server.get("/create-point", (req, res) => {
    // req.query: Query strings da nossa URL
    // console.log(req.query)


    return res.render("create-point.html")
})

server.post("/savepoint", (req, res) => {
    // req.body: O corpo do nosso formulário
    // console.log(req.body)

    // Inserir dados no banco:  
   const query = `
        INSERT INTO places(
            image,
            name,
            address,
            address2,
            state,
            city,
            items
        ) VALUES (?,?,?,?,?,?,?);
    `
    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
    ]

    function afterInsertData(err){
        if(err){
            return console.log(err)

        }

        console.log("Cadastrado com sucesso")
        console.log(this)

        return res.render("create-point.html", { saved: true })
    }

    db.run(query, values, afterInsertData)


    
})

server.get("/search", (req, res) => {
    const search = req.query.search

    if (search == ""){
        // Pesquisa vazia
        return res.render("search-results.html", { total: 0 })
    }

    // Pegar os dados do banco de dados
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function (err, rows) {
        if (err) {
            return console.log(err)
        }

        //Leva para o console.log
        console.log("Aqui estão seus registros: ")
        console.log(rows)

        const total = rows.length




        //Renderiza a página e passa o objeto
        return res.render("search-results.html", { places: rows, total })
    })

    
})


// Ligar o servidor
server.listen(3000)