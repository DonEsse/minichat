const chatBox = document.getElementById("chat-box");
const input = document.getElementById("input");
const btnEnviar = document.getElementById("enviar");

let etapa = "nome";
let nomeCliente = "";
let cpfCliente = "";

// identifica papel da sessão (cliente por padrão)
// se este mesmo script for usado pelo atendente, altere para 'atendente'
let papel = "cliente";

// novo: controle de typing
let typingTimeout = null;

// Função para formatar hora
function horaAtual() {
  const agora = new Date();
  return agora.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Função para adicionar mensagem visualmente
function adicionarMensagem(texto, tipo) {
  const msg = document.createElement("div");
  msg.classList.add("msg", tipo);
  msg.innerHTML = `${texto}<span class="hora">${horaAtual()}</span>`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// novo: mostra/oculta indicador de "digitando..."
function mostrarTyping(autor, ativo) {
  const seletor = `.typing[data-autor="${autor}"]`;
  let el = chatBox.querySelector(seletor);

  if (ativo) {
    if (!el) {
      el = document.createElement("div");
      el.classList.add("typing");
      el.setAttribute("data-autor", autor);

      // se o autor for o cliente, exibimos "Cliente digitando..." para o atendente
      // se a sessão atual for o próprio cliente, mostrará "Você digitando..."
      if (autor === "cliente") {
        el.textContent = papel === "cliente" ? "Você digitando..." : "Cliente digitando...";
      } else {
        el.textContent = papel === "atendente" ? "Você digitando..." : "Atendente digitando...";
      }

      chatBox.appendChild(el);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  } else {
    if (el) el.remove();
  }
}

// Envia mensagem ao Firebase
function enviarParaFirebase(nome, texto, autor) {
  if (!cpfCliente) return;

  const msg = {
    nome: nome,
    texto: texto,
    autor: autor,
    timestamp: Date.now()
  };

  db.ref("suporte/" + cpfCliente + "/mensagens").push(msg);
}

// novo: atualiza estado de "digitando" no Firebase (cliente)
function setClienteDigitando(ativo) {
  if (!cpfCliente) return;
  db.ref("suporte/" + cpfCliente + "/typing/cliente").set(ativo);
  mostrarTyping("cliente", ativo);
}

// Processa mensagens do cliente
function processarMensagem() {
  const texto = input.value.trim();
  if (texto === "") return;

  if (etapa === "nome") {
    nomeCliente = texto;
    adicionarMensagem(`Olá! Meu nome é ${nomeCliente}.`, "cliente");
    adicionarMensagem(`Prazer, ${nomeCliente}! Agora digite seu CPF.`, "atendente");
    etapa = "cpf";
    input.value = "";
    input.placeholder = "Digite seu CPF e pressione Enter...";
  } 
  else if (etapa === "cpf") {
    cpfCliente = texto;
    adicionarMensagem(`Meu CPF é ${cpfCliente}.`, "cliente");
    adicionarMensagem(`Perfeito! Verificando suas informações, digite sua mensagem abaixo e breve você será atendido!`, "atendente");
    etapa = "chat";
    input.value = "";
    input.placeholder = "Digite sua mensagem...";

    // Salva metadados no Firebase
    db.ref("suporte/" + cpfCliente + "/meta").set({
      nome: nomeCliente,
      cpf: cpfCliente,
      status: "aguardando"
    });

    // Escuta mensagens do atendente em tempo real
    db.ref("suporte/" + cpfCliente + "/mensagens").on("child_added", (snapshot) => {
      const msg = snapshot.val();
      if (msg.autor === "atendente") {
        adicionarMensagem(msg.texto, "atendente");
      }
    });

    // novo: escuta status "digitando" no Firebase (atendente e cliente)
    db.ref("suporte/" + cpfCliente + "/typing").on("value", (snapshot) => {
      const val = snapshot.val() || {};
      mostrarTyping("atendente", !!val.atendente);
      // opcional: mostrar o cliente (útil para debug / múltiplas abas)
      mostrarTyping("cliente", !!val.cliente);
    });
  } 
  else if (etapa === "chat") {
    adicionarMensagem(texto, "cliente");
    enviarParaFirebase(nomeCliente, texto, "cliente");
    input.value = "";
    // ao enviar, desliga o indicador de digitação do cliente
    setClienteDigitando(false);
  }
}

// Escuta Enter e botão
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") processarMensagem();
});
btnEnviar.addEventListener("click", processarMensagem);

// novo: detecta quando cliente está digitando (apenas na etapa chat)
input.addEventListener("input", () => {
  if (etapa !== "chat") return;

  if (input.value.trim() !== "") {
    // indica que está digitando
    setClienteDigitando(true);

    // reinicia timeout para desligar indicador após inatividade (2s)
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      setClienteDigitando(false);
    }, 2000);
  } else {
    // campo vazio -> não está digitando
    clearTimeout(typingTimeout);
    setClienteDigitando(false);
  }
});

// novo: limpa flag de typing ao fechar a aba/janela
window.addEventListener("beforeunload", () => {
  if (papel === "cliente") {
    // garante que o atendente não fique com indicador preso
    if (cpfCliente) db.ref("suporte/" + cpfCliente + "/typing/cliente").set(false);
  } else {
    if (cpfCliente) db.ref("suporte/" + cpfCliente + "/typing/atendente").set(false);
  }
});
