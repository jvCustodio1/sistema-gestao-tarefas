// ================= DADOS =================
let usuarios = [];
let tarefas = [];
let usuarioLogado = null;
let tarefaEditando = null;

// ================= STORAGE =================
function salvarDados(){
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
  localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
}

function carregarDados(){
  usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
  usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado")) || null;
}

// ================= TELAS =================
function abrirLogin(){
  inicio.style.display = "none";
  login.style.display = "flex";
}

function abrirCadastro(){
  login.style.display = "none";
  cadastro.style.display = "flex";
}

function voltarLogin(){
  cadastro.style.display = "none";
  login.style.display = "flex";
}

// ================= CADASTRO =================
function cadastrarConta(){

  const nome = cadNome.value.trim();
  const email = cadEmail.value.trim();
  const objetivo = cadObjetivo.value;
  const senha = cadSenha.value;
  const confirmar = cadConfirmarSenha.value;

  if(!nome || !email || !objetivo || !senha || !confirmar){
    alert("Preencha todos os campos");
    return;
  }

  if(senha !== confirmar){
    alert("As senhas não coincidem");
    return;
  }

  if(usuarios.find(u => u.email === email)){
    alert("Email já cadastrado");
    return;
  }

  usuarios.push({ nome, email, senha, objetivo, foto:null });

  salvarDados();
  alert("Conta criada com sucesso!");
  voltarLogin();
}

// ================= LOGIN =================
function fazerLogin(){

  const email = loginEmail.value.trim();
  const senha = loginSenha.value;

  const user = usuarios.find(u => u.email === email && u.senha === senha);

  if(!user){
    alert("Email ou senha incorretos");
    return;
  }

  usuarioLogado = user;
  salvarDados();
  iniciarSistema();
}

// ================= LOGOUT =================
function logout(){
  usuarioLogado = null;
  localStorage.removeItem("usuarioLogado");
  location.reload();
}

// ================= SISTEMA =================
function iniciarSistema(){

  inicio.style.display = "none";
  login.style.display = "none";
  cadastro.style.display = "none";
  sistema.style.display = "flex";

  document.querySelectorAll('.pagina').forEach(p=>p.classList.add('hidden'));

  mostrarPagina("home");

  carregarPerfil();
  listarTarefas();
  listarConcluidas();
}

// ================= PERFIL =================
function carregarPerfil(){

  if(!usuarioLogado) return;

  document.getElementById("perfilNome").innerText = usuarioLogado.nome;
  document.getElementById("perfilEmail").innerText = usuarioLogado.email;

  const campoSenha = document.getElementById("perfilSenha");
  campoSenha.type = "password";
  campoSenha.value = usuarioLogado.senha;

  if(usuarioLogado.foto){
    document.getElementById("fotoPerfil").src = usuarioLogado.foto;
    document.getElementById("fotoPerfilPreview").src = usuarioLogado.foto;
  }
}

function toggleSenha(){
  const campo = document.getElementById("perfilSenha");
  campo.type = campo.type === "password" ? "text" : "password";
}

// ================= TAREFAS =================
function cadastrarTarefa(){

  const titulo = document.getElementById("tituloInput").value;
  const descricao = document.getElementById("descricaoInput").value;
  const status = document.getElementById("status").value;
  const dataInicio = document.getElementById("dataInicio").value;
  const dataFim = document.getElementById("dataFim").value;

  if(!titulo || !descricao || !dataInicio || !dataFim){
    alert("Preencha todos os campos");
    return;
  }

  if(tarefaEditando){
    salvarEdicao();
    return;
  }

  tarefas.push({
    id: Date.now(),
    titulo,
    descricao,
    status,
    dataInicio,
    dataFim,
    dataCriacao: new Date().toISOString(),
    usuarioEmail: usuarioLogado.email
  });

  salvarDados();
  limparCampos();
  listarTarefas();
  mostrarPagina("lista");
}

function limparCampos(){
  document.getElementById("tituloInput").value="";
  document.getElementById("descricaoInput").value="";
  document.getElementById("dataInicio").value="";
  document.getElementById("dataFim").value="";
  tarefaEditando = null;

  document.getElementById("btnTarefa").innerText = "Adicionar";
}

// ================= LISTAR ATIVAS =================
function listarTarefas(){

  const lista = document.getElementById("listaTarefas");
  if(!lista) return;

  lista.innerHTML="";

  const minhas = tarefas.filter(t => 
    t.usuarioEmail === usuarioLogado.email && t.status !== "Concluído"
  );

  minhas.forEach(t=>{

    const criada = new Date(t.dataCriacao).toLocaleDateString("pt-BR");

    const div = document.createElement("div");
    div.className = "tarefa";

    div.innerHTML = `
      <strong>${t.titulo}</strong><br>
      ${t.descricao}<br>
      🕒 Criada em: ${criada}<br>
      📅 Início: ${formatarData(t.dataInicio)}<br>
      ⏳ Prazo: ${formatarData(t.dataFim)}<br>
      Status: ${t.status}
    `;

    const btnConcluir = document.createElement("button");
    btnConcluir.innerText = "Concluir";
    btnConcluir.onclick = ()=> concluirTarefa(t.id);

    const btnEditar = document.createElement("button");
    btnEditar.innerText = "Editar";
    btnEditar.style.marginLeft = "10px";
    btnEditar.onclick = ()=> editarTarefa(t.id);

    const btnExcluir = document.createElement("button");
    btnExcluir.innerText = "Excluir";
    btnExcluir.style.marginLeft = "10px";
    btnExcluir.onclick = ()=> excluirTarefa(t.id);

    div.appendChild(btnConcluir);
    div.appendChild(btnEditar);
    div.appendChild(btnExcluir);

    lista.appendChild(div);
  });
}

// ================= CONCLUIR =================
function concluirTarefa(id){
  const tarefa = tarefas.find(t => t.id === id);
  if(tarefa){
    tarefa.status = "Concluído";
  }

  salvarDados();
  listarTarefas();
  listarConcluidas();
}

// ================= LISTAR CONCLUÍDAS =================
function listarConcluidas(){

  const lista = document.getElementById("listaConcluidas");
  if(!lista) return;

  lista.innerHTML="";

  const minhas = tarefas.filter(t => 
    t.usuarioEmail === usuarioLogado.email && t.status === "Concluído"
  );

  minhas.forEach(t=>{

    const criada = new Date(t.dataCriacao).toLocaleDateString("pt-BR");

    const div = document.createElement("div");
    div.className = "tarefa";

    div.innerHTML = `
      <strong>${t.titulo}</strong><br>
      ${t.descricao}<br>
      🕒 Criada em: ${criada}<br>
      📅 Início: ${formatarData(t.dataInicio)}<br>
      ⏳ Prazo: ${formatarData(t.dataFim)}<br>
      Status: Concluído
    `;

    const btnReabrir = document.createElement("button");
    btnReabrir.innerText = "Reabrir";
    btnReabrir.onclick = ()=> reabrirTarefa(t.id);

    const btnExcluir = document.createElement("button");
    btnExcluir.innerText = "Excluir";
    btnExcluir.style.marginLeft = "10px";
    btnExcluir.onclick = ()=> excluirTarefa(t.id);

    div.appendChild(btnReabrir);
    div.appendChild(btnExcluir);

    lista.appendChild(div);
  });
}

// ================= REABRIR =================
function reabrirTarefa(id){
  const tarefa = tarefas.find(t => t.id === id);
  if(tarefa){
    tarefa.status = "Em Andamento";
  }

  salvarDados();
  listarTarefas();
  listarConcluidas();
}

// ================= EDITAR =================
function editarTarefa(id){

  const tarefa = tarefas.find(t => t.id === id);
  if(!tarefa) return;

  tarefaEditando = id;

  document.getElementById("tituloInput").value = tarefa.titulo;
  document.getElementById("descricaoInput").value = tarefa.descricao;
  document.getElementById("dataInicio").value = tarefa.dataInicio;
  document.getElementById("dataFim").value = tarefa.dataFim;
  document.getElementById("status").value = tarefa.status;

  document.getElementById("btnTarefa").innerText = "Salvar Alterações";

  mostrarPagina("tarefas");
}

function salvarEdicao(){

  const tarefa = tarefas.find(t => t.id === tarefaEditando);
  if(!tarefa) return;

  tarefa.titulo = document.getElementById("tituloInput").value;
  tarefa.descricao = document.getElementById("descricaoInput").value;
  tarefa.dataInicio = document.getElementById("dataInicio").value;
  tarefa.dataFim = document.getElementById("dataFim").value;
  tarefa.status = document.getElementById("status").value;

  salvarDados();
  limparCampos();
  listarTarefas();
  mostrarPagina("lista");
}

// ================= EXCLUIR =================
function excluirTarefa(id){

  const confirmar = confirm("Você tem certeza que deseja excluir esta tarefa?");

  if(!confirmar) return;

  tarefas = tarefas.filter(t => t.id !== id);

  salvarDados();
  listarTarefas();
  listarConcluidas();
}

// ================= DATA =================
function formatarData(data){
  if(!data) return "-";
  const p = data.split("-");
  return `${p[2]}/${p[1]}/${p[0]}`;
}

// ================= SENHA =================
function esqueciSenha(){
  const email = prompt("Digite seu email:");
  const user = usuarios.find(u => u.email === email);

  if(!user){
    alert("Email não encontrado");
    return;
  }

  const nova = prompt("Nova senha:");
  user.senha = nova;

  salvarDados();
  alert("Senha alterada!");
}

// ================= RELATÓRIO TXT =================
function baixarRelatorioTxt(){

  if(!usuarioLogado){
    alert("Nenhum usuário logado");
    return;
  }

  const minhasTarefas = tarefas.filter(t => 
    t.usuarioEmail === usuarioLogado.email
  );

  if(minhasTarefas.length === 0){
    alert("Você não possui tarefas");
    return;
  }

  let conteudo = "RELATÓRIO DE TAREFAS - TASKFLOW\n\n";

  minhasTarefas.forEach(t => {
    conteudo += `
Tarefa: ${t.titulo}
Descrição: ${t.descricao}
Status: ${t.status}
Início: ${formatarData(t.dataInicio)}
Prazo: ${formatarData(t.dataFim)}
---------------------------------------
`;
  });

  const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "relatorio_tarefas.txt";

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ================= LOAD =================
window.onload = function(){

  carregarDados();

  if(usuarioLogado){
    iniciarSistema();
  }else{
    inicio.style.display = "flex";
  }
};
