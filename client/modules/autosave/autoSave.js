document.addEventListener('DOMContentLoaded', function() {
    try {
        var csInterface = new CSInterface();
        var timer = null;
        var lastSaveTime = null;
        var autoSaveInterval = 10; // minutos

        // Função para atualizar status
        function updateStatus(message) {
            var statusElement = document.getElementById('saveStatus');
            if (statusElement) { // Verifica se o elemento existe
                statusElement.textContent = message;
            }
        }

        // Função para verificar se há um container de autosave
        function toggleAutoSaveContainer() {
            var container = document.getElementById('autoSaveContainer');
            if (container) { // Verifica se o elemento existe
                container.classList.toggle('hidden');
            }
        }

        // Função para buscar o intervalo das settings
        function getSettingsInterval(callback) {
            csInterface.evalScript(`
                function getSettings() {
                    var settingsFile = new File(app.path + '/Presets/en_GB/Scripts/Legenda/settings.json');
                    if (settingsFile.exists) {
                        settingsFile.open('r');
                        var content = settingsFile.read();
                        settingsFile.close();
                        var settings = JSON.parse(content);
                        return settings.autoSaveInterval || 10;
                    }
                    return 10;
                }
                getSettings();
            `, function(result) {
                callback(parseInt(result) || 10);
            });
        }

        // Botões
        var legendaBtn = document.getElementById('legendaBtn');
        var autoSaveBtn = document.getElementById('autoSaveBtn');
        var backupBtn = document.getElementById('backupBtn');
        var settingsBtn = document.getElementById('settingsBtn');
        var reloadBtn = document.getElementById('reloadBtn');

        // Event Listeners
        if (legendaBtn) {
            legendaBtn.addEventListener('click', function() {
                var scriptPath = "C:/Program Files/Adobe/Adobe Illustrator 2025/Presets/en_GB/Scripts/Legenda/script.jsx";
                csInterface.evalScript('$.evalFile("' + scriptPath + '")');
            });
        }

        if (autoSaveBtn) {
            autoSaveBtn.addEventListener('click', function() {
                if (timer) {
                    clearInterval(timer);
                    timer = null;
                    updateStatus('Autosave disabled');
                } else {
                    // Verificar se há um documento aberto antes de iniciar o autosave
                    csInterface.evalScript('app.documents.length > 0', function(result) {
                        if (result === 'true') {
                            getSettingsInterval(function(interval) {
                                timer = setInterval(function() {
                                    csInterface.evalScript('app.activeDocument.save()', function(saveResult) {
                                        if (saveResult === 'true') {
                                            checkLastSaveTime();
                                            updateNextSave();
                                            updateStatus('Document saved');
                                        } else {
                                            updateStatus('Error saving document');
                                        }
                                    });
                                }, interval * 60 * 1000);
                                updateStatus('Autosave enabled');
                                updateNextSave();
                            });
                        } else {
                            updateStatus('No document open');
                        }
                    });
                }
            });
        }

        if (backupBtn) {
            backupBtn.addEventListener('click', function() {
                alert('Função de backup será implementada em breve');
            });
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', function() {
                toggleAutoSaveContainer(); // Usa a função segura
            });
        }

        if (reloadBtn) {
            reloadBtn.addEventListener('click', function() {
                location.reload();
            });
        }

        function checkLastSaveTime() {
            csInterface.evalScript(`
                if (app.documents.length > 0) {
                    var doc = app.activeDocument;
                    var file = new File(doc.fullName);
                    file.modified.getTime();
                } else {
                    "null";
                }
            `, function(result) {
                try {
                    if (result && result !== "null") {
                        var lastSaveDate = new Date(parseInt(result));
                        document.getElementById('lastSaveTime').textContent = 
                            padNumber(lastSaveDate.getHours()) + ':' + 
                            padNumber(lastSaveDate.getMinutes()) + ':' + 
                            padNumber(lastSaveDate.getSeconds());
                        
                        document.getElementById('lastSaveDate').textContent = 
                            padNumber(lastSaveDate.getDate()) + '/' + 
                            padNumber(lastSaveDate.getMonth() + 1) + '/' + 
                            lastSaveDate.getFullYear();
                    } else {
                        document.getElementById('lastSaveTime').textContent = '--:--:--';
                        document.getElementById('lastSaveDate').textContent = '--/--/--';
                    }
                } catch(e) {
                    console.error('Erro ao processar data:', e);
                }
            });
        }

        function updateNextSave() {
            getSettingsInterval(function(interval) {
                var now = new Date();
                var nextSave = new Date(now.getTime() + (interval * 60 * 1000));
                
                document.getElementById('nextSaveTime').textContent = formatTime(nextSave);
                document.getElementById('nextSaveDate').textContent = formatDate(nextSave);
            });
        }

        function formatTime(date) {
            return padNumber(date.getHours()) + ':' + 
                   padNumber(date.getMinutes()) + ':' + 
                   padNumber(date.getSeconds());
        }

        function formatDate(date) {
            return padNumber(date.getDate()) + '/' + 
                   padNumber(date.getMonth() + 1) + '/' + 
                   date.getFullYear();
        }

        function padNumber(num) {
            return num.toString().padStart(2, '0');
        }

        // Verificações periódicas
        setInterval(checkLastSaveTime, 30000);
        setInterval(updateNextSave, 60000);

        // Verificação inicial
        setTimeout(checkLastSaveTime, 1000);
        updateNextSave();

        function checkDocumentStatus() {
            csInterface.evalScript('checkDocumentStatus()', function(result) {
                var status = document.getElementById('saveStatus');
                if (status) {
                    status.textContent = result;
                }
            });
        }

        function updateSaveTimes() {
            try {
                var lastSaveElement = document.getElementById('lastSaveTime');
                var nextSaveElement = document.getElementById('nextSaveTime');
                var lastSaveDateElement = document.getElementById('lastSaveDate');
                var nextSaveDateElement = document.getElementById('nextSaveDate');
                
                if (lastSaveElement) lastSaveElement.textContent = lastSaveTime.toLocaleTimeString();
                if (lastSaveDateElement) lastSaveDateElement.textContent = lastSaveTime.toLocaleDateString();
                
                if (nextSaveElement && nextSaveDateElement) {
                    nextSaveTime = new Date(lastSaveTime.getTime() + (autoSaveInterval * 60000));
                    nextSaveElement.textContent = nextSaveTime.toLocaleTimeString();
                    nextSaveDateElement.textContent = nextSaveTime.toLocaleDateString();
                }
            } catch(e) {
                console.error('Erro ao atualizar tempos:', e);
            }
        }
    } catch(e) {
        console.error('Erro na inicialização do autoSave:', e);
    }
});
