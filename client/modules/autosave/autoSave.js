document.addEventListener('DOMContentLoaded', function() {
    var csInterface = new CSInterface();
    var saveInterval = 5; // minutos
    var timer = null;

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
                timer = setInterval(function() {
                    csInterface.evalScript('app.activeDocument.save()');
                    updateTimers();
                }, saveInterval * 60 * 1000);
                document.getElementById('saveStatus').textContent = 'Autosave pending';
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

    function updateTimers() {
        var now = new Date();
        document.getElementById('lastSaveTime').textContent = formatTime(now);
        
        var nextSave = new Date(now.getTime() + (saveInterval * 60 * 1000));
        document.getElementById('nextSaveTime').textContent = formatTime(nextSave);
    }

    function checkLastSaveTime() {
        try {
            csInterface.evalScript(`
                function getLastSaveTime() {
                    if (app.documents.length > 0) {
                        var currentDoc = app.activeDocument;
                        if (currentDoc.saved) {
                            var fileObj = new File(currentDoc.fullName);
                            return fileObj.modified.getTime();
                        }
                    }
                    return null;
                }
                getLastSaveTime();
            `, function(result) {
                if (result && result !== 'null') {
                    var lastSaveDate = new Date(parseInt(result));
                    document.getElementById('lastSaveTime').textContent = formatTime(lastSaveDate);
                    document.getElementById('lastSaveDate').textContent = formatDate(lastSaveDate);
                } else {
                    document.getElementById('lastSaveTime').textContent = '--:--:--';
                    document.getElementById('lastSaveDate').textContent = '--/--/--';
                }
            });
        } catch (e) {
            console.error('Erro ao verificar última gravação:', e);
            document.getElementById('lastSaveTime').textContent = '--:--:--';
            document.getElementById('lastSaveDate').textContent = '--/--/--';
        }
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

    // Verifica a cada 30 segundos
    setInterval(checkLastSaveTime, 30000);
    
    // Verifica imediatamente ao carregar
    checkLastSaveTime();

    // Inicialização
    updateTimers();
});
