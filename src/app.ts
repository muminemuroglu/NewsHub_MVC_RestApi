import express from 'express'
import path from 'path'
const app = express()
const PORT = process.env.PORT || 3000

app.listen(PORT, ()=>{
    console.log(`Server running: http://localhost:${PORT}`)
})
// EJS Configuration
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")