var csInterface = new CSInterface();

function init() {
    themeManager.init();
}

function executarScript() {
    try {
        var scriptPath = 'C:/Program Files/Adobe/Adobe Illustrator 2025/Presets/en_GB/Scripts/Legenda/script.jsx';
        csInterface.evalScript('$.evalFile("' + scriptPath + '")', function(result) {
            if (result === 'EvalScript error.') {
                alert('Erro ao executar o script. Verifique se o caminho está correto.');
            }
        });
    } catch (e) {
        alert('Erro ao executar script: ' + e.message);
    }
}

// Função para abrir a janela de configurações usando CSInterface
function abrirSettings() {
    // Verifica se a interface está disponível
    if (!csInterface) {
        alert('Erro: Interface CSInterface não inicializada');
        return;
    }

    try {
        // Tenta abrir a janela de configurações como um diálogo modal
        var extensionId = "com.bids.settings";
        csInterface.requestOpenExtension(extensionId, "");
    } catch (e) {
        alert('Erro ao abrir configurações: ' + e.message);
    }
}

init();

var btnTestar = document.getElementById("btnTestar");
btnTestar.onclick = function() {
    csInterface.evalScript("testarPlugin()", function(resultado) {
        alert(resultado);
    });
}