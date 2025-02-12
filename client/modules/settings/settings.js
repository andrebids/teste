document.addEventListener('DOMContentLoaded', function() {
    try {
        var csInterface = new CSInterface();
        console.log('Settings iniciadas...');

        // Carregar settings atuais
        function loadSettings() {
            var extensionPath = csInterface.getSystemPath(SystemPath.EXTENSION);
            console.log('Caminho da extensão:', extensionPath);
            
            csInterface.evalScript(`
                function getSettings() {
                    try {
                        var extensionPath = '${extensionPath}';
                        var settingsFile = new File(extensionPath + '/settings.json');
                        console.log('Tentando abrir arquivo:', extensionPath + '/settings.json');
                        
                        if (settingsFile.exists) {
                            console.log('Arquivo encontrado!');
                            settingsFile.open('r');
                            var content = settingsFile.read();
                            settingsFile.close();
                            console.log('Conteúdo lido:', content);
                            return content;
                        } else {
                            console.log('Arquivo não encontrado, usando valores padrão');
                            return '{"autoSaveInterval": 10}';
                        }
                    } catch(e) {
                        console.log('Erro ao ler settings:', e.message);
                        return '{"autoSaveInterval": 10}';
                    }
                }
                getSettings();
            `, function(result) {
                try {
                    console.log('Resultado recebido:', result);
                    var settings = JSON.parse(result);
                    document.getElementById('autoSaveInterval').value = settings.autoSaveInterval || 10;
                    console.log('Settings carregadas com sucesso');
                } catch(e) {
                    console.error('Erro ao processar settings:', e);
                }
            });
        }

        // Salvar settings
        window.saveSettings = function() {
            try {
                var autoSaveInterval = parseInt(document.getElementById('autoSaveInterval').value) || 10;
                var settings = {
                    autoSaveInterval: autoSaveInterval
                };
                
                var extensionPath = csInterface.getSystemPath(SystemPath.EXTENSION);
                console.log('Salvando em:', extensionPath + '/settings.json');

                csInterface.evalScript(`
                    function saveSettings() {
                        try {
                            var extensionPath = '${extensionPath}';
                            var settingsFile = new File(extensionPath + '/settings.json');
                            console.log('Criando/abrindo arquivo para escrita');
                            settingsFile.open('w');
                            settingsFile.write('${JSON.stringify(settings)}');
                            settingsFile.close();
                            console.log('Arquivo salvo com sucesso');
                            return true;
                        } catch(e) {
                            console.log('Erro ao salvar:', e.message);
                            return false;
                        }
                    }
                    saveSettings();
                `, function(result) {
                    console.log('Resultado do save:', result);
                    if (result === 'true') {
                        console.log('Settings salvas com sucesso');
                        window.close();
                    } else {
                        console.error('Erro ao salvar configurações');
                        alert('Erro ao salvar configurações');
                    }
                });
            } catch(e) {
                console.error('Erro ao salvar settings:', e);
                alert('Erro ao salvar configurações: ' + e.message);
            }
        };

        // Carregar settings ao abrir
        loadSettings();
        
    } catch(e) {
        console.error('Erro na inicialização das settings:', e);
    }
});