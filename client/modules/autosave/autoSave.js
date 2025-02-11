document.addEventListener('DOMContentLoaded', function() {
    var csInterface = new CSInterface();
    var saveInterval = 5; // valor padrão em minutos
    var timer = null;
    var isAutoSaveEnabled = false;

    function startAutoSave() {
        if (!isAutoSaveEnabled) {
            isAutoSaveEnabled = true;
            timer = setInterval(function() {
                saveDocument();
                updateNextSaveTime();
            }, saveInterval * 60 * 1000);
            
            document.getElementById('saveStatus').textContent = 'Auto-save ativado';
            updateNextSaveTime();
        }
    }

    function stopAutoSave() {
        if (isAutoSaveEnabled) {
            isAutoSaveEnabled = false;
            clearInterval(timer);
            timer = null;
            document.getElementById('saveStatus').textContent = 'Auto-save desativado';
            document.getElementById('nextSaveTime').textContent = '--:--:--';
            document.getElementById('nextSaveDate').textContent = '--/--/--';
        }
    }

    function saveDocument() {
        csInterface.evalScript('app.activeDocument.save()', function(result) {
            if (result === 'true') {
                checkLastSaveTime();
                document.getElementById('saveStatus').textContent = 'Documento salvo com sucesso';
            } else {
                document.getElementById('saveStatus').textContent = 'Erro ao salvar documento';
            }
        });
    }

    function updateNextSaveTime() {
        if (isAutoSaveEnabled) {
            var nextSave = new Date(Date.now() + (saveInterval * 60 * 1000));
            document.getElementById('nextSaveTime').textContent = formatTime(nextSave);
            document.getElementById('nextSaveDate').textContent = formatDate(nextSave);
        }
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

    // Carregar configurações do settings.html
    function loadSettings() {
        var settings = localStorage.getItem('bids_settings');
        if (settings) {
            try {
                settings = JSON.parse(settings);
                if (settings.interval) {
                    saveInterval = parseInt(settings.interval);
                    
                    // Se o auto-save já estiver rodando, reinicia com o novo intervalo
                    if (isAutoSaveEnabled) {
                        stopAutoSave();
                        startAutoSave();
                    }
                }
            } catch (e) {
                console.error('Erro ao carregar configurações:', e);
            }
        }
    }

    // Observador para mudanças nas configurações
    window.addEventListener('storage', function(e) {
        if (e.key === 'bids_settings') {
            loadSettings();
        }
    });

    // Event Listeners
    document.getElementById('autoSaveBtn').addEventListener('click', function() {
        if (isAutoSaveEnabled) {
            stopAutoSave();
        } else {
            startAutoSave();
        }
    });

    // Verifica a cada 30 segundos
    setInterval(checkLastSaveTime, 30000);
    
    // Inicialização
    checkLastSaveTime();
    loadSettings();
});
