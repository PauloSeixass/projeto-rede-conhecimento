document.addEventListener('DOMContentLoaded', function() {
    
    // 1. SELEÇÃO DE ELEMENTOS
    const etapas = document.querySelectorAll('.etapa');
    const botoesConcluir = document.querySelectorAll('.concluir-etapa');
    const botoesPular = document.querySelectorAll('.pular-etapa');
    const botoesVoltar = document.querySelectorAll('.voltar-etapa');
    const checkboxesassistido = document.querySelectorAll('.checkbox-assistido');
    const botaoResetar = document.getElementById('botao-resetar-progresso');
    const modal = document.getElementById('modal-playlist');
    const botaoFecharModal = document.getElementById('fechar-modal');
    const iframePlaylist = document.getElementById('iframe-playlist');
    const cardsParaAbrirModal = document.querySelectorAll('.abrir-modal');

    // 2. DEFINIÇÃO DE FUNÇÕES
    function navegarParaEtapa(numeroEtapa) {
        const etapaAtual = document.querySelector('.etapa.ativa');
        if (etapaAtual) etapaAtual.classList.remove('ativa');

        const novaEtapa = document.querySelector(`.etapa[data-etapa="${numeroEtapa}"]`);
        if (novaEtapa) {
            novaEtapa.classList.add('ativa');
            novaEtapa.scrollIntoView({ behavior: 'smooth', block: 'start' });
            atualizarVisibilidadeBotoesNav(novaEtapa);
        }
    }

    function atualizarVisibilidadeBotoesNav(etapaAtiva) {
        if (!etapaAtiva) return;
        const numeroEtapa = parseInt(etapaAtiva.dataset.etapa);
        const totalEtapas = etapas.length;
        const botaoVoltar = etapaAtiva.querySelector('.voltar-etapa');
        const botaoPular = etapaAtiva.querySelector('.pular-etapa');
        const botaoConcluir = etapaAtiva.querySelector('.concluir-etapa');

        if (botaoVoltar) botaoVoltar.classList.toggle('escondido', numeroEtapa === 1);
        if (botaoPular) botaoPular.classList.toggle('escondido', numeroEtapa === totalEtapas);
        if (botaoConcluir) botaoConcluir.classList.toggle('escondido', numeroEtapa === totalEtapas);
    }

    function atualizarvisibilidade(etapaelemento) {
        if (!etapaelemento) return;
        const checkboxesetapa = etapaelemento.querySelectorAll('.checkbox-assistido');
        const botaoconcluir = etapaelemento.querySelector('.concluir-etapa');
        if (!botaoconcluir || parseInt(etapaelemento.dataset.etapa) === etapas.length) return;
        let todosmarcados = true;
        checkboxesetapa.forEach(cb => { if (!cb.checked) todosmarcados = false; });
        botaoconcluir.classList.toggle('escondido', !todosmarcados);
    }

    function verificartudo() {
        const totalCheckboxes = checkboxesassistido.length;
        const totalMarcados = document.querySelectorAll('.checkbox-assistido:checked').length;
        const botaoPaginaFinal = document.getElementById('botao-pagina-final');
        if (!botaoPaginaFinal) return;

        if (totalCheckboxes > 0 && totalMarcados === totalCheckboxes) {
            if (!localStorage.getItem('jaFoiParabenizado')) {
                localStorage.setItem('jaFoiParabenizado', 'true');
                window.location.href = 'parabens.html';
            } else {
                botaoPaginaFinal.classList.remove('escondido');
            }
        } else {
            botaoPaginaFinal.classList.add('escondido');
        }
    }

    function atualizarBarrasDeProgresso() {
        const totalCheckboxes = checkboxesassistido.length;
        const totalMarcados = document.querySelectorAll('.checkbox-assistido:checked').length;
        const progressoGeral = totalCheckboxes > 0 ? (totalMarcados / totalCheckboxes) * 100 : 0;
        
        document.getElementById('progresso-geral').value = progressoGeral;
        document.getElementById('progresso-geral-texto').textContent = `${Math.round(progressoGeral)}%`;

        etapas.forEach(etapa => {
            const numeroEtapa = etapa.dataset.etapa;
            const checkboxesNaEtapa = etapa.querySelectorAll('.checkbox-assistido');
            const marcadosNaEtapa = etapa.querySelectorAll('.checkbox-assistido:checked');
            const progressoEtapa = checkboxesNaEtapa.length > 0 ? (marcadosNaEtapa.length / checkboxesNaEtapa.length) * 100 : 0;
            
            document.getElementById(`progresso-etapa-${numeroEtapa}`).value = progressoEtapa;
            document.getElementById(`progresso-etapa-${numeroEtapa}-texto`).textContent = `${Math.round(progressoEtapa)}%`;
        });
    }

    function salvarProgresso() {
        const videosMarcadosIds = Array.from(checkboxesassistido)
                                       .filter(checkbox => checkbox.checked)
                                       .map(checkbox => checkbox.id);
        localStorage.setItem('progressoCursosRede', JSON.stringify(videosMarcadosIds));
    }

    function carregarProgresso() {
        const progressoSalvo = localStorage.getItem('progressoCursosRede');
        if (progressoSalvo) {
            const videosMarcadosIds = JSON.parse(progressoSalvo);
            videosMarcadosIds.forEach(id => {
                const checkbox = document.getElementById(id);
                if (checkbox) checkbox.checked = true;
            });
        }
    }
    
    function fecharModal() {
        if(modal) modal.classList.add('escondido');
        if(iframePlaylist) iframePlaylist.src = ""; 
    }

    function inicializarUI() {
        checkboxesassistido.forEach(checkbox => {
            if (checkbox.checked) {
                checkbox.dispatchEvent(new Event('change'));
            }
        });
        
        const etapaAtivaInicial = document.querySelector('.etapa.ativa');
        if (etapaAtivaInicial) {
            atualizarvisibilidade(etapaAtivaInicial);
            atualizarVisibilidadeBotoesNav(etapaAtivaInicial);
        }
        
        atualizarBarrasDeProgresso();
        verificartudo();
    }

    // 3. EXECUÇÃO E EVENT LISTENERS
    carregarProgresso();

    if (botaoResetar) {
        botaoResetar.addEventListener('click', () => {
            if (confirm("Tem certeza que deseja resetar todo o seu progresso? Esta ação não pode ser desfeita.")) {
                localStorage.removeItem('progressoCursosRede');
                localStorage.removeItem('jaFoiParabenizado');
                window.location.reload();
            }
        });
    }

    cardsParaAbrirModal.forEach(card => {
        card.addEventListener('click', function(event) {
            if (event.target.closest('.controle-assistido')) return;
            const playlistSrc = this.dataset.playlistSrc;
            if (playlistSrc && iframePlaylist && modal) {
                iframePlaylist.src = playlistSrc;
                modal.classList.remove('escondido');
            }
        });
    });
    
    if(botaoFecharModal) botaoFecharModal.addEventListener('click', fecharModal);
    if(modal) modal.addEventListener('click', event => { if (event.target === modal) fecharModal(); });

    checkboxesassistido.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const label = document.querySelector(`label[for="${checkbox.id}"]`);
            if (label) label.textContent = checkbox.checked ? 'Visto ✅' : 'Marcar como visto';
            const etapa = checkbox.closest('.etapa');
            if (etapa) atualizarvisibilidade(etapa);
            atualizarBarrasDeProgresso();
            verificartudo(); 
            salvarProgresso(); 
        });
    });

    [...botoesConcluir, ...botoesPular].forEach(botao => {
        botao.addEventListener('click', function() {
            const etapaAtual = this.closest('.etapa');
            navegarParaEtapa(parseInt(etapaAtual.dataset.etapa) + 1);
        });
    });
    
    botoesVoltar.forEach(botao => {
        botao.addEventListener('click', function() {
            const etapaAtual = this.closest('.etapa');
            navegarParaEtapa(parseInt(etapaAtual.dataset.etapa) - 1);
        });
    });
    
    inicializarUI();
});