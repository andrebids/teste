// Função para abrir as settings via JSX
try {
    // O CEP (Common Extensibility Platform) já cuida da comunicação
    // Não precisamos fazer nada aqui
} catch(e) {
    console.error("Erro no JSX:", e);
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
        console.error('Erro ao ler settings:', e);
        return '{"autoSaveInterval": 10}';
    }
}

function saveSettings(settings) {
    try {
        var extensionPath = app.path + '/settings.json';
        $.writeln('Tentando salvar em: ' + extensionPath);
        
        var settingsFile = new File(extensionPath);
        $.writeln('Arquivo criado');
        
        if (!settingsFile.open('w')) {
            throw new Error('Não foi possível abrir o arquivo para escrita. Permissões?');
        }
        $.writeln('Arquivo aberto para escrita');
        
        if (!settingsFile.write(settings)) {
            throw new Error('Não foi possível escrever no arquivo');
        }
        $.writeln('Conteúdo escrito');
        
        settingsFile.close();
        $.writeln('Arquivo fechado');
        
        return true;
    } catch(e) {
        $.writeln('Erro ao salvar settings: ' + e.message + ' em linha: ' + e.line);
        return false;
    }
}
