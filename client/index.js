document.addEventListener('DOMContentLoaded', function() {
    try {
        var csInterface = new CSInterface();
        console.log('Iniciando aplicação...');

        // Event Listeners
        document.getElementById('settingsBtn').addEventListener('click', function() {
            try {
                console.log('Tentando abrir configurações...');
                var extensionId = "com.bids.settings";
                csInterface.requestOpenExtension(extensionId, "");
                console.log('Requisição para abrir settings enviada');
            } catch(e) {
                console.error('Erro ao abrir configurações:', e);
            }
        });

        document.getElementById('reloadBtn').addEventListener('click', function() {
            location.reload();
        });

    } catch(e) {
        console.error('Erro na inicialização:', e);
    }
});

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