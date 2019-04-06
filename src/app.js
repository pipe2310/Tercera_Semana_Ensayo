process.env.PORT = process.env.PORT || 3000;
process.env.URLDB = 'mongodb://localhost:27017/asignaturas'

const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const bodyParser = require('body-parser')
require('./helpers');
const mongoose = require('mongoose');
const Estudiante = require ('../models/estudiante')
const bcrypt = require('bcrypt');
const session = require('express-session')
const jwt = require('jsonwebtoken');


const directoriopublico = path.join(__dirname, '../public')
const directoiopartial= path.join(__dirname, '../partials')
app.use(express.static(directoriopublico));
hbs.registerPartials(directoiopartial);
app.use(bodyParser.urlencoded({extended:false}));

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}
 
localStorage.setItem('myFirstKey', 'myFirstValue');
console.log(localStorage.getItem('myFirstKey'));


app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

app.use((req,res,next)=>{
	let token = localStorage.getItem('token')
	jwt.verify(token, 'tdea-virtual',(err, decoded)=> {
  if(err){
  	return next()
  }
  console.log(decoded) // bar
  		res.locals.sesion = true
		res.locals.nombre = decoded.data.nombre///session necesario!!!
req.usuario= decoded.data._id
next()
});
	/*if(req.session.usuario){
		res.locals.sesion = true
		res.locals.nombre = req.session.nombre///session necesario!!!!
	}*/
	//next()
})

app.set('view engine','hbs');

app.get('/',(req,res)=>{
	res.render('index',{
		//estudiante: 'Felipe'
	});
});

app.post('/',(req,res)=>{
	let estudiante= new Estudiante({
		nombre: req.body.nombre,
		matematicas: req.body.nota1,
		ingles: req.body.nota2,
		programacion: req.body.nota3,
		password: bcrypt.hashSync(req.body.password, 10)
	})

	estudiante.save((err,resultado)=>{
		if(err){
		res.render('indexpost',{
		mostrar: err
	})
		}
		res.render('indexpost',{
		mostrar: resultado//or resultado.nombre etc
	})
	})
});

app.get('/vernotas',(req,res)=>{
	Estudiante.find({}).exec((err,respuesta)=>{//entre las llaves condicion ejemplo ingles: 5
		if(err){
			return console.log(err)
		}
		res.render('vernotas',{
			listado:respuesta
		})
	})
})

app.get('/actualizar',(req,res)=>{

	//Estudiante.findById(req.session.usuario,function(err,usuario){
		Estudiante.findById(req.usuario,function(err,usuario){
if(err){
	return console.log(err)
}
/*if(!usuario){
	return res.redirect('/')
}*/
res.render('actualizar',{
			nombre:usuario.nombre,
			matematicas:usuario.matematicas,
			ingles:usuario.ingles,
			programacion:usuario.programacion
	});

})
})
app.post('/actualizar',(req,res)=>{
	Estudiante.findOneAndUpdate({nombre:req.body.nombre},req.body,{new: true, runValidators:true, context: 'query'},(err,resultados)=>{
		if(err){
			return console.log(err)
		}

		res.render('actualizar',{
			nombre:resultados.nombre,
			matematicas:resultados.matematicas,
			ingles:resultados.ingles,
			programacion:resultados.programacion
		})
	})

})

app.post('/eliminar',(req,res)=>{
	Estudiante.findOneAndDelete({nombre:req.body.nombre},req.body,(err,resultados)=>{
		if(err){
			return console.log(err)
		}
		/*if(!resultado){
					res.render('eliminar',{
			nombre: "Nombre no encontrado"
		})

		}*/
		res.render('eliminar',{
			nombre: resultados.nombre
		})
	})

})

app.post('/ingresar',(req,res)=>{
	Estudiante.findOne({nombre:req.body.usuario},(err,resultados)=>{
		if(err){
			return console.log(err)
		}
		if(!resultados){
				return	res.render('ingresar',{
			mensaje: "Usuario no encontrado"
		})
			}
				if(!bcrypt.compareSync(req.body.password,resultados.password)){
									return	res.render('ingresar',{
			mensaje: "Contraseña no es correcta"
		})
		}
		//req.session.usuario = resultados._id
		//req.session.nombre = resultados.nombre
let token = jwt.sign({
  data: resultados
}, 'tdea-virtual', { expiresIn: '1h' });
console.log(token)
localStorage.setItem('token',token);
		res.render('ingresar',{
			mensaje: "Bienvenido"+ resultados.nombre, 
			//sesion: true,
			nombre: req.session.nombre
		})
	})
	})

app.get('/salir',(req,res)=>{
/*req.session.destroy((err)=>{
	if(err) return console.log(err)
})*/
localStorage.setItem('token','');
res.redirect('/')
})

app.post('/calculos',(req,res)=>{
	console.log(req.query);
	res.render('calculos',{
		estudiante: req.body.nombre,
		nota1: parseInt(req.body.nota1),
		nota2: parseInt(req.body.nota2),
		nota3: parseInt(req.body.nota3)
	});
});

app.get('*',(req,res)=>{
	res.render('error',{
		estudiante: 'error'
	})
})

mongoose.connect(process.env.URLDB,{useNewUrlParser: true},(err,resultado)=>{
	if(err){
		return console.log(error)
	}
	console.log("conectado")
});

app.listen(3000,()=>{
console.log('escuchando en el puerto 3000')

});