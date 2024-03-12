 



const express = require("express");
const shortId = require("shortid");
const createHttpError = require('http-errors');
const mongoose = require('mongoose');
const ShortUrlModel = require('./models/url') 

const path = require('path');
 

const app = express();

 

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose.connect('mongodb://localhost:27017',{
  dbName:'url-shortner',

}).then(()=>console.log("mongodb connected"))
.catch(err=>console.log("mongodb connection error")); 



 
app.set('view engine', 'ejs');

app.get('/', async (req, res, next) => {
  res.render('index');
});
 

app.post('/', async (req, res, next) => {
  try {
      const { url } = req.body;
      if (!url) {
          // throw createHttpError.BadRequest('Provide a valid URL');
          res.render('index',{h1:`provide a valid url`})

      }
      const urlExists = await ShortUrlModel.findOne({ url });  

      if (urlExists) {
          res.render('index', { short_url: `http://localhost:3000/${urlExists.shortId}` });
          return;
      }
      const newShortUrl = new ShortUrlModel({ url: url, shortId: shortId.generate() });
      const result = await newShortUrl.save();
      res.render('index', { short_url: `http://localhost:3000/${result.shortId}` });
  } catch (error) {
      next(error);
  }
});

app.get('/:shortId',async(req,res,next)=>{
  try{
    const {shortId} = req.params
    const result = await  ShortUrlModel.findOne({shortId})

    if(!result){
      throw createHttpError.NotFound('short url does not exist')

    }
    res.redirect(result.url)

  }
  catch(error){
next(error)
} 
})


app.use((req,res,next)=>{
  next(createHttpError.NotFound())
})

app.use((req,res,next)=>{
  res.status(err.status || 500)
  res.render('index',{error:error.message})

})

app.listen(3000, () => console.log('Server started on port 3000'));

