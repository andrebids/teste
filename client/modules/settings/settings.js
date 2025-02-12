document.addEventListener('DOMContentLoaded', function() {
    try {
        var csInterface = new CSInterface();
        console.log('Settings iniciadas...');

        // Salvar settings
        window.saveSettings = function() {
            try {
                var autoSaveInterval = parseInt(document.getElementById('autoSaveInterval').value) || 10;
                var settings = {
                    autoSaveInterval: autoSaveInterval
                };

                var extensionPath = csInterface.getSystemPath(SystemPath.EXTENSION);
                console.log('Tentando salvar settings:', settings);
                console.log('Caminho da extensão:', extensionPath);

                csInterface.evalScript(`
                    (function() {
                        try {
                            var extensionPath = '${extensionPath}';
                            $.writeln('==== INÍCIO DO SALVAMENTO ====');
                            $.writeln('Caminho do arquivo: ' + extensionPath + '/settings.json');
                            
                            var settingsFile = new File(extensionPath + '/settings.json');
                            $.writeln('Arquivo criado');
                            
                            if (!settingsFile.open('w')) {
                                throw new Error('Não foi possível abrir o arquivo');
                            }
                            $.writeln('Arquivo aberto para escrita');
                            
                            var conteudo = '${JSON.stringify(settings)}';
                            $.writeln('Conteúdo a ser escrito: ' + conteudo);
                            
                            if (!settingsFile.write(conteudo)) {
                                throw new Error('Não foi possível escrever no arquivo');
                            }
                            $.writeln('Conteúdo escrito com sucesso');
                            
                            settingsFile.close();
                            $.writeln('Arquivo fechado');
                            $.writeln('==== FIM DO SALVAMENTO ====');
                            
                            return 'success';
                        } catch(e) {
                            $.writeln('!!!! ERRO NO SALVAMENTO !!!!');
                            $.writeln('Erro: ' + e.message);
                            return 'Erro: ' + e.message;
                        }
                    })();
                `, function(result) {
                    console.log('Resultado da operação:', result);
                    if (result === 'success') {
                        console.log('Settings salvas com sucesso!');
                        alert('Configurações salvas com sucesso!');
                        window.close();
                    } else {
                        console.error('Erro ao salvar:', result);
                        alert('Erro ao salvar configurações: ' + result);
                    }
                });
            } catch(e) {
                console.error('Erro ao salvar settings:', e);
                alert('Erro ao salvar settings: ' + e.message);
            }
        };

        // Carregar settings
        function loadSettings() {
            console.log('Iniciando carregamento das settings...');
            csInterface.evalScript(`
                (function() {
                    try {
                        var extensionPath = '${csInterface.getSystemPath(SystemPath.EXTENSION)}';
                        $.writeln('==== INÍCIO DA LEITURA ====');
                        $.writeln('Tentando ler de: ' + extensionPath + '/settings.json');
                        
                        var settingsFile = new File(extensionPath + '/settings.json');
                        if (settingsFile.exists) {
                            $.writeln('Arquivo encontrado');
                            settingsFile.open('r');
                            var content = settingsFile.read();
                            settingsFile.close();
                            $.writeln('Conteúdo lido: ' + content);
                            $.writeln('==== FIM DA LEITURA ====');
                            return content;
                        }
                        $.writeln('Arquivo não encontrado, usando padrão');
                        return '{"autoSaveInterval": 10}';
                    } catch(e) {
                        $.writeln('!!!! ERRO NA LEITURA !!!!');
                        $.writeln('Erro: ' + e.message);
                        return '{"autoSaveInterval": 10}';
                    }
                })();
            `, function(result) {
                try {
                    console.log('Settings carregadas:', result);
                    var settings = JSON.parse(result);
                    document.getElementById('autoSaveInterval').value = settings.autoSaveInterval || 10;
                    console.log('Settings aplicadas com sucesso');
                } catch(e) {
                    console.error('Erro ao carregar settings:', e);
                    alert('Erro ao carregar settings: ' + e.message);
                }
            });
        }

        // Carregar settings ao iniciar
        loadSettings();
        
    } catch(e) {
        console.error('Erro na inicialização das settings:', e);
        alert('Erro na inicialização das settings: ' + e.message);
    }
});