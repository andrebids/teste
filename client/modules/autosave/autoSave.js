document.addEventListener('DOMContentLoaded', function() {
    var csInterface = new CSInterface();
    var timer = null;

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
                document.getElementById('saveStatus').textContent = 'Autosave disabled';
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
                                        document.getElementById('saveStatus').textContent = 'Document saved';
                                    } else {
                                        document.getElementById('saveStatus').textContent = 'Error saving document';
                                    }
                                });
                            }, interval * 60 * 1000);
                            document.getElementById('saveStatus').textContent = 'Autosave enabled';
                            updateNextSave();
                        });
                    } else {
                        document.getElementById('saveStatus').textContent = 'No document open';
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
            document.getElementById('autoSaveContainer').classList.toggle('hidden');
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
});
