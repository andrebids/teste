// Função para abrir as settings via JSX
try {
    alert("1. Iniciando script JSX");
    
    // Não precisamos criar um evento aqui
    // O CEP (Common Extensibility Platform) já cuida da comunicação
    
    // Podemos apenas retornar sucesso
    alert("2. Script JSX executado com sucesso");
    
} catch(e) {
    alert("Erro no JSX: " + e);
}

// Funções para manipular as settings
function getSettings() {
    try {
        var settingsFile = new File(app.path + '/settings.json');
        if (settingsFile.exists) {
            settingsFile.open('r');
            var content = settingsFile.read();
            settingsFile.close();
            return content;
        }
        return '{"autoSaveInterval": 10}';
    } catch(e) {
        alert('Erro ao ler settings: ' + e);
        return '{"autoSaveInterval": 10}';
    }
}

function saveSettings(settings) {
    try {
        var settingsFile = new File(app.path + '/settings.json');
        settingsFile.open('w');
        settingsFile.write(settings);
        settingsFile.close();
        return true;
    } catch(e) {
        alert('Erro ao salvar settings: ' + e);
        return false;
    }
}
