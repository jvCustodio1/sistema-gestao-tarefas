const mensagem = document.getElementById("mensagem");
let tarefas = [] 

function adicionarTarefa() {
    let inputTarefa = document.getElementById("inputTarefa");
    let campoValido = inputTarefa.value.trim();
 
    if (campoValido !== "") {
        mensagem.textContent = "Tarefa adicionada com sucesso";
        mensagem.style.color= "green";
        tarefas.push(campoValido)
        renderizarTarefas()
    } else {
        mensagem.textContent = "Digite no campo acima";
        mensagem.style.color = "red"
    }
    inputTarefa.value = "";
}

function renderizarTarefas() {         
    let listaTarefas = document.getElementById("listaTarefas")
    listaTarefas.innerHTML = ""
    
    for (let i = 0; i < tarefas.length; i++) {
        let novaTarefa = document.createElement("li")
        novaTarefa.textContent = tarefas[i]

        let botaoRemover = document.createElement("button")
        botaoRemover.className = "remover"
        botaoRemover.textContent = "Remover"
        botaoRemover.onclick = () => removerTarefa(i)

        let botaoEditar = document.createElement("button")
        botaoEditar.className = "editar"
        botaoEditar.textContent = "Editar"
        botaoEditar.onclick = () => editarTarefa(i)

        novaTarefa.appendChild(botaoRemover)
        novaTarefa.appendChild(botaoEditar)
        listaTarefas.appendChild(novaTarefa)
    }
}

function removerTarefa(i) {
    tarefas.splice(i, 1)
    renderizarTarefas()
}

function editarTarefa(i) {
    let tarefaEditada = prompt("Edite a Tarefa:")
    if (tarefaEditada.trim() !== "") {
        tarefas[i] = tarefaEditada
        renderizarTarefas()
    }
}

function apagarLista() {
    if (tarefas == "") {
        mensagem.textContent = "Nenhum item para apagar";
        mensagem.style.color = "red"
    } else {
        tarefas.length = 0
        renderizarTarefas()
        const mensagem = document.getElementById("mensagem")
        mensagem.textContent = "Excluido com sucesso";
        mensagem.style.color= "green"
    }
}