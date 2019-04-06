const hbs = require('hbs');

hbs.registerHelper('obtenerPromedio',(nota1, nota2, nota3)=>{
	return(nota1+nota2+nota3)/3
})

hbs.registerHelper('mostrarr',(listado)=>{
let texto=`<form action="/eliminar" method="post">
<table class='table table-striped table-hover'>
<thead class='thead-dark'>
<th>Nombre</th>
<th>Matematicas</th>
<th>Ingles</th>
<th>Programacion</th>
</thead>
<tbody>`;
listado.forEach(estudiante=>{
	texto=texto+
	`<tr>
		<td>${estudiante.nombre}</td>
		<td>${estudiante.matematicas}</td>
		<td>${estudiante.ingles}</td>
		<td>${estudiante.programacion}</td>
		<td><button name="nombre" value="${estudiante.nombre}">Eliminar</button></td>
		<th></th>
	</tr>`;
})
texto=texto+'</tbody></table><form>';
return texto;
})