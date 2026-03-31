let usuarios = [];
let tarefas = [];
let tarefasExcluidas = [];

function toggleSidebar(){
const buttons = document.querySelectorAll('.nav-btn');

buttons.forEach(btn => {
if(btn.style.display === "none"){
btn.style.display = "block";
}else{
btn.style.display = "none";
}
});
}

function mostrarPagina(pagina){

document.querySelectorAll('.pagina').forEach(p=>{
p.classList.add('hidden')
});

document.getElementById(pagina).classList.remove('hidden');

}

// INICIAR SISTEMA (NOVO)
function iniciarSistema(){
document.getElementById("inicio").style.display = "none";
document.getElementById("sistema").style.display = "flex";

mostrarPagina("usuarios");

history.pushState({pagina: "sistema"}, "", "#sistema");
}
function cadastrarUsuario(){

const nome = document.getElementById("nomeUsuario").value;
const email = document.getElementById("emailUsuario").value;
const erro = document.getElementById("erroEmail");

erro.style.display="none";

if(nome === "" || email === ""){
alert("Preencha todos os campos");
return;
}

if(!email.includes("@gmail.com")){
erro.style.display="block";
return;
}

usuarios.push({
nome,
email
});

document.getElementById("nomeUsuario").value="";
document.getElementById("emailUsuario").value="";

atualizarSelect();

alert("Usuário salvo com sucesso");

}

function atualizarSelect(){

const select = document.getElementById("usuarioSelect");

select.innerHTML="";

usuarios.forEach((u,i)=>{

const option = document.createElement("option");
option.value = i;
option.text = u.nome;

select.appendChild(option);

});

}

function cadastrarTarefa(){

const titulo = document.getElementById("titulo").value;
const descricao = document.getElementById("descricao").value;
const status = document.getElementById("status").value;
const usuario = document.getElementById("usuarioSelect").value;

if(titulo === "" || descricao === ""){
alert("Preencha tudo");
return;
}

if(usuarios.length === 0){
alert("Cadastre um usuário primeiro");
return;
}

tarefas.push({
titulo,
descricao,
status,
responsavel: usuarios[usuario]
});

document.getElementById("titulo").value="";
document.getElementById("descricao").value="";

listarTarefas();

mostrarPagina("lista");

}

function listarTarefas(){

const lista = document.getElementById("listaTarefas");

lista.innerHTML="";

tarefas.forEach((t,index)=>{

const div = document.createElement("div");
div.className = "tarefa";

div.innerHTML = `
<strong>${t.titulo}</strong><br>
${t.descricao}<br>
Status: ${t.status}<br>
Responsável: ${t.responsavel.nome}
`;

const botao = document.createElement("button");

if(t.status === "Concluído"){
botao.innerText = "Excluir";
botao.onclick = ()=> excluirTarefa(index);
}else{
botao.innerText = "Concluir";
botao.onclick = ()=> concluirTarefa(index);
}

div.appendChild(botao);

lista.appendChild(div);

});

}

function concluirTarefa(index){

tarefas[index].status = "Concluído";

listarTarefas();

}

function excluirTarefa(index){

tarefasExcluidas.push(tarefas[index]);

tarefas.splice(index,1);

listarTarefas();

listarExcluidas();

}

function listarExcluidas(){

const lista = document.getElementById("listaExcluidas");

lista.innerHTML="";

tarefasExcluidas.forEach(t=>{

const div = document.createElement("div");

div.className = "tarefa";

div.innerHTML = `
<strong>${t.titulo}</strong><br>
${t.descricao}<br>
Status: ${t.status}<br>
Responsável: ${t.responsavel.nome}
`;

lista.appendChild(div);

});

}

// MOSTRAR APENAS TELA INICIAL AO ABRIR
window.onload = function(){
  document.getElementById("sistema").style.display = "none";
  document.getElementById("inicio").style.display = "flex";
}

window.onpopstate = function(){
document.getElementById("sistema").style.display = "none";
document.getElementById("inicio").style.display = "flex";
}