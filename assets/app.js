// Lista de produtos e movimentações
let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let movimentacoes = JSON.parse(localStorage.getItem("movimentacoes")) || [];
let limiteEstoque = Number(localStorage.getItem("limiteEstoque")) || 5;

// Salvar os dados
function salvarDados() {
    localStorage.setItem("produtos", JSON.stringify(produtos));
    localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes));
    localStorage.setItem("limiteEstoque", limiteEstoque);
}

// Formatar valores em reais
function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Mostrar mensagens
function mostrarMensagem(mensagem) {
    let aviso = document.getElementById("toast");

    aviso.textContent = mensagem;
    aviso.classList.add("show");

    setTimeout(function() {
        aviso.classList.remove("show");
    }, 2500);
}

// Verificar situação do estoque
function verificarEstoque(produto) {
    if (produto.quantidade == 0) {
        return '<span class="status out">Sem estoque</span>';
    }

    if (produto.quantidade <= limiteEstoque) {
        return '<span class="status low">Estoque baixo</span>';
    }

    return '<span class="status ok">Disponível</span>';
}

// Atualizar o painel inicial
function atualizarPainel() {
    document.getElementById("statProducts").textContent = produtos.length;

    let total = 0;
    let baixo = 0;
    let valor = 0;

    produtos.forEach(function(produto) {
        total += produto.quantidade;
        valor += produto.quantidade * produto.preco;

        if (produto.quantidade <= limiteEstoque) {
            baixo++;
        }
    });

    document.getElementById("statItems").textContent = total;
    document.getElementById("statLow").textContent = baixo;
    document.getElementById("statValue").textContent = formatarPreco(valor);

    mostrarProdutosPainel();
    mostrarMovimentacoesRecentes();
}

// Mostrar produtos no painel
function mostrarProdutosPainel() {
    let tabela = document.getElementById("dashboardTable");
    tabela.innerHTML = "";

    if (produtos.length == 0) {
        tabela.innerHTML = '<tr><td colspan="6" class="empty">Nenhum produto cadastrado.</td></tr>';
        return;
    }

    produtos.slice(0, 6).forEach(function(produto) {
        tabela.innerHTML += `
            <tr>
                <td>${produto.nome}</td>
                <td>${produto.codigo}</td>
                <td>${produto.categoria}</td>
                <td>${produto.quantidade}</td>
                <td>${formatarPreco(produto.preco)}</td>
                <td>${verificarEstoque(produto)}</td>
            </tr>
        `;
    });
}

// Mostrar todos os produtos
function mostrarProdutos(pesquisa = "") {
    let tabela = document.getElementById("productsTable");
    tabela.innerHTML = "";

    let encontrados = produtos.filter(function(produto) {
        return produto.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
            produto.codigo.toLowerCase().includes(pesquisa.toLowerCase()) ||
            produto.categoria.toLowerCase().includes(pesquisa.toLowerCase());
    });

    document.getElementById("productCount").textContent =
        encontrados.length + " produto(s)";

    if (encontrados.length == 0) {
        tabela.innerHTML = '<tr><td colspan="7" class="empty">Nenhum produto encontrado.</td></tr>';
        return;
    }

    encontrados.forEach(function(produto) {
        tabela.innerHTML += `
            <tr>
                <td><strong>${produto.nome}</strong></td>
                <td>${produto.codigo}</td>
                <td>${produto.categoria}</td>
                <td>${produto.quantidade}</td>
                <td>${formatarPreco(produto.preco)}</td>
                <td>${verificarEstoque(produto)}</td>
                <td>
                    <div class="actions">
                        <button class="mini-button" onclick="editarProduto('${produto.id}')">Editar</button>
                        <button class="mini-button" onclick="excluirProduto('${produto.id}')">Excluir</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

// Abrir cadastro de produto
function abrirCadastro() {
    document.getElementById("productForm").reset();
    document.getElementById("productId").value = "";
    document.getElementById("productModalTitle").textContent = "Novo produto";

    abrirJanela("productModal");
}

// Salvar produto
document.getElementById("productForm").addEventListener("submit", function(evento) {
    evento.preventDefault();

    let id = document.getElementById("productId").value;
    let nome = document.getElementById("productName").value.trim();
    let codigo = document.getElementById("productCode").value.trim();
    let categoria = document.getElementById("productCategory").value.trim();
    let quantidade = Number(document.getElementById("productQuantity").value);
    let preco = Number(document.getElementById("productPrice").value);

    if (nome == "" || codigo == "" || categoria == "") {
        mostrarMensagem("Preencha todos os campos.");
        return;
    }

    if (quantidade < 0 || !Number.isInteger(quantidade) || preco < 0 || !Number.isFinite(preco)) {
        mostrarMensagem("Informe valores válidos.");
        return;
    }

    let repetido = produtos.some(function(produto) {
        return produto.codigo.toLowerCase() == codigo.toLowerCase() &&
            produto.id != id;
    });

    if (repetido) {
        mostrarMensagem("Esse código já está cadastrado.");
        return;
    }

    if (id != "") {
        let produto = produtos.find(function(p) {
            return p.id == id;
        });

        if (produto.quantidade != quantidade) {
            let diferenca = quantidade - produto.quantidade;

            registrarHistorico(
                produto,
                diferenca > 0 ? "Entrada" : "Saída",
                Math.abs(diferenca),
                "Alteração no cadastro"
            );
        }

        produto.nome = nome;
        produto.codigo = codigo;
        produto.categoria = categoria;
        produto.quantidade = quantidade;
        produto.preco = preco;

        mostrarMensagem("Produto atualizado!");
    } else {
        produtos.push({
            id: Date.now().toString(),
            nome: nome,
            codigo: codigo,
            categoria: categoria,
            quantidade: quantidade,
            preco: preco
        });

        mostrarMensagem("Produto cadastrado!");
    }

    salvarDados();
    atualizarTudo();
    fecharJanela("productModal");
});

// Editar produto
function editarProduto(id) {
    let produto = produtos.find(function(p) {
        return p.id == id;
    });

    if (!produto) return;

    document.getElementById("productId").value = produto.id;
    document.getElementById("productName").value = produto.nome;
    document.getElementById("productCode").value = produto.codigo;
    document.getElementById("productCategory").value = produto.categoria;
    document.getElementById("productQuantity").value = produto.quantidade;
    document.getElementById("productPrice").value = produto.preco;

    document.getElementById("productModalTitle").textContent = "Editar produto";

    abrirJanela("productModal");
}

// Excluir produto
function excluirProduto(id) {
    let produto = produtos.find(function(p) {
        return p.id == id;
    });

    if (produto && confirm("Deseja excluir " + produto.nome + "?")) {
        produtos = produtos.filter(function(p) {
            return p.id != id;
        });

        salvarDados();
        atualizarTudo();

        mostrarMensagem("Produto excluído!");
    }
}

// Abrir janela
function abrirJanela(id) {
    document.getElementById(id).classList.add("open");
}

// Fechar janela
function fecharJanela(id) {
    document.getElementById(id).classList.remove("open");
}

// Registrar histórico
function registrarHistorico(produto, tipo, quantidade, observacao) {
    movimentacoes.push({
        produto: produto.nome,
        tipo: tipo,
        quantidade: quantidade,
        observacao: observacao,
        data: new Date().toLocaleString("pt-BR")
    });
}

// Abrir movimentação
function abrirMovimentacao(tipo) {
    if (produtos.length == 0) {
        mostrarMensagem("Cadastre um produto primeiro.");
        return;
    }

    document.getElementById("movementForm").reset();
    document.getElementById("movementType").value = tipo;

    document.getElementById("movementModalTitle").textContent =
        tipo == "Entrada" ? "Registrar entrada" : "Registrar saída";

    let lista = document.getElementById("movementProduct");
    lista.innerHTML = "";

    produtos.forEach(function(produto) {
        lista.innerHTML += `
            <option value="${produto.id}">
                ${produto.nome} - Estoque: ${produto.quantidade}
            </option>
        `;
    });

    abrirJanela("movementModal");
}

// Confirmar entrada ou saída
document.getElementById("movementForm").addEventListener("submit", function(evento) {
    evento.preventDefault();

    let id = document.getElementById("movementProduct").value;
    let quantidade = Number(document.getElementById("movementQuantity").value);
    let tipo = document.getElementById("movementType").value;
    let observacao = document.getElementById("movementNote").value.trim();

    let produto = produtos.find(function(p) {
        return p.id == id;
    });

    if (!produto || !Number.isInteger(quantidade) || quantidade <= 0) {
        mostrarMensagem("Informe uma quantidade válida.");
        return;
    }

    if (tipo == "Saída" && quantidade > produto.quantidade) {
        mostrarMensagem("Estoque insuficiente!");
        return;
    }

    if (tipo == "Entrada") {
        produto.quantidade += quantidade;
    } else {
        produto.quantidade -= quantidade;
    }

    registrarHistorico(produto, tipo, quantidade, observacao);

    salvarDados();
    atualizarTudo();
    fecharJanela("movementModal");

    mostrarMensagem("Movimentação registrada!");
});

// Mostrar histórico
function mostrarMovimentacoesRecentes() {
    let lista = document.getElementById("recentMovements");
    lista.innerHTML = "";

    let recentes = [...movimentacoes].reverse().slice(0, 5);

    if (recentes.length == 0) {
        lista.innerHTML = '<p class="muted">Nenhuma movimentação registrada.</p>';
        return;
    }

    recentes.forEach(function(movimento) {
        lista.innerHTML += `
            <div class="recent-item">
                <span class="movement-icon ${movimento.tipo == "Entrada" ? "in" : "out"}">
                    ${movimento.tipo == "Entrada" ? "+" : "−"}
                </span>
                <div>
                    <strong>${movimento.tipo} de ${movimento.produto}</strong>
                    <small>${movimento.quantidade} unidade(s) - ${movimento.data}</small>
                </div>
            </div>
        `;
    });
}

// Mostrar histórico completo
function mostrarHistorico(pesquisa = "") {
    let tabela = document.getElementById("movementsTable");
    tabela.innerHTML = "";

    let encontrados = [...movimentacoes].reverse().filter(function(m) {
        return (m.produto + m.tipo + m.observacao)
            .toLowerCase().includes(pesquisa.toLowerCase());
    });

    if (encontrados.length == 0) {
        tabela.innerHTML = '<tr><td colspan="5" class="empty">Nenhuma movimentação encontrada.</td></tr>';
        return;
    }

    encontrados.forEach(function(m) {
        tabela.innerHTML += `
            <tr>
                <td>${m.data}</td>
                <td>${m.produto}</td>
                <td>${m.tipo}</td>
                <td>${m.quantidade}</td>
                <td>${m.observacao || "—"}</td>
            </tr>
        `;
    });
}

// Pesquisar produtos
document.getElementById("productSearch").addEventListener("input", function() {
    mostrarProdutos(this.value);
});

// Pesquisar movimentações
document.getElementById("movementSearch").addEventListener("input", function() {
    mostrarHistorico(this.value);
});

// Botões de entrada e saída
document.getElementById("entryButton").addEventListener("click", function() {
    abrirMovimentacao("Entrada");
});

document.getElementById("exitButton").addEventListener("click", function() {
    abrirMovimentacao("Saída");
});

// Navegação do menu
document.querySelectorAll(".nav-link").forEach(function(botao) {
    botao.addEventListener("click", function() {
        let pagina = this.dataset.page;

        document.querySelectorAll(".page").forEach(function(p) {
            p.classList.remove("active");
        });

        document.getElementById("page-" + pagina).classList.add("active");

        document.querySelectorAll(".nav-link").forEach(function(item) {
            item.classList.remove("active");
        });

        this.classList.add("active");

        let titulos = {
            dashboard: ["Painel Inicial", "Acompanhe seus produtos e movimentações."],
            products: ["Produtos", "Gerencie os produtos cadastrados."],
            movements: ["Movimentações", "Acompanhe todas as entradas e saídas."],
            settings: ["Configurações", "Personalize os alertas do estoque."]
        };

        document.getElementById("pageTitle").textContent = titulos[pagina][0];
        document.getElementById("pageSubtitle").textContent = titulos[pagina][1];

        document.getElementById("headerAddButton").style.display =
            pagina == "products" ? "inline-block" : "none";

        if (pagina == "products") mostrarProdutos();
        if (pagina == "movements") mostrarHistorico();
    });
});

// Botões de cadastro
document.getElementById("headerAddButton").addEventListener("click", abrirCadastro);
document.getElementById("productsAddButton").addEventListener("click", abrirCadastro);

// Fechar janelas pelos botões
document.querySelectorAll("[data-close]").forEach(function(botao) {
    botao.addEventListener("click", function() {
        fecharJanela(this.dataset.close);
    });
});

// Fechar clicando fora da janela
document.querySelectorAll(".modal-backdrop").forEach(function(janela) {
    janela.addEventListener("click", function(evento) {
        if (evento.target == janela) {
            fecharJanela(janela.id);
        }
    });
});

// Configuração do estoque baixo
document.getElementById("lowStockLimit").value = limiteEstoque;

document.getElementById("saveSettings").addEventListener("click", function() {
    let valor = Number(document.getElementById("lowStockLimit").value);

    if (!Number.isInteger(valor) || valor < 0) {
        mostrarMensagem("Informe um limite válido.");
        return;
    }

    limiteEstoque = valor;

    salvarDados();
    atualizarTudo();

    mostrarMensagem("Configuração salva!");
});

// Apagar todos os dados
document.getElementById("clearData").addEventListener("click", function() {
    if (confirm("Deseja apagar todos os produtos e movimentações?")) {
        produtos = [];
        movimentacoes = [];

        salvarDados();
        atualizarTudo();

        mostrarMensagem("Dados apagados!");
    }
});

// Atualizar todas as telas
function atualizarTudo() {
    atualizarPainel();
    mostrarProdutos(document.getElementById("productSearch").value);
    mostrarHistorico(document.getElementById("movementSearch").value);
}

// Iniciar sistema
atualizarTudo();