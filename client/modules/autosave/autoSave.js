document.addEventListener('DOMContentLoaded', function() {
    var csInterface = new CSInterface();
    var timer = null;

    function checkAndSaveIfNeeded() {
        csInterface.evalScript(`
            function getInfo() {
                if (app.documents.length > 0) {
                    var doc = app.activeDocument;
                    var file = new File(doc.fullName);
                    return file.modified.getTime();
                }
                return "null";
            }
            getInfo();
        `, function(lastSaveResult) {
            if (lastSaveResult && lastSaveResult !== "null") {
                var lastSaveTime = new Date(parseInt(lastSaveResult));
                var now = new Date();
                
                // Buscar intervalo das settings
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
                `, function(interval) {
                    var intervalMinutes = parseInt(interval) || 10;
                    var timeDiff = (now - lastSaveTime) / (1000 * 60); // diferença em minutos

                    if (timeDiff > intervalMinutes) {
                        // Se passou mais tempo que o intervalo, salva imediatamente
                        csInterface.evalScript('app.activeDocument.save()', function(saveResult) {
                            if (saveResult === 'true') {
                                checkLastSaveTime();
                                updateNextSave();
                                document.getElementById('saveStatus').textContent = 'Document saved';
                            }
                        });
                    }
                });
            }
        });
    }

    // Função para buscar o intervalo das settings
    function getSettingsInterval(callback) {
        csInterface.evalScript(`
            function getSettings() {
                try {
                    var settingsFile = new File(Folder.userData + '/Adobe/Illustrator/AutoSaviour/settings.json');
                    if (settingsFile.exists) {
                        settingsFile.open('r');
                        var content = settingsFile.read();
                        settingsFile.close();
                        var settings = JSON.parse(content);
                        return settings.autoSaveInterval || 10;
                    }
                    return 10;
                } catch(e) {
                    return 10;
                }
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
            var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION);
            
            var settingsContainer = document.createElement('div');
            settingsContainer.id = 'settingsOverlay';
            settingsContainer.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #2d2d2d;
                z-index: 1000;
                padding: 20px;
                border-radius: 4px;
                width: 300px;
            `;
            
            // Carregar o HTML das settings
            var xhr = new XMLHttpRequest();
            var settingsPath = 'file:///' + extensionRoot + '/client/settings.html';
            
            xhr.open('GET', settingsPath, true);
            xhr.responseType = 'text';
            
            xhr.onload = function() {
                if (xhr.status === 200 || xhr.status === 0) {
                    if (xhr.responseText) {
                        settingsContainer.innerHTML = xhr.responseText;
                        
                        // Remover os scripts existentes
                        var existingScripts = settingsContainer.getElementsByTagName('script');
                        while(existingScripts.length > 0) {
                            existingScripts[0].parentNode.removeChild(existingScripts[0]);
                        }
                        
                        document.body.appendChild(settingsContainer);
                        
                        // Adicionar o CSS
                        var styleLink = document.createElement('link');
                        styleLink.rel = 'stylesheet';
                        styleLink.href = 'file:///' + extensionRoot + '/client/style.css';
                        settingsContainer.appendChild(styleLink);
                        
                        // Adicionar CSInterface.js
                        var csInterfaceScript = document.createElement('script');
                        csInterfaceScript.src = 'file:///' + extensionRoot + '/client/CSInterface.js';
                        settingsContainer.appendChild(csInterfaceScript);
                        
                        // Sobrescrever a função window.saveSettings
                        window.saveSettings = function() {
                            var autoSaveInterval = parseInt(document.getElementById('autoSaveInterval').value) || 10;
                            var settings = {
                                autoSaveInterval: autoSaveInterval
                            };
                            
                            csInterface.evalScript(`
                                function saveSettings(settingsStr) {
                                    try {
                                        var settingsFolder = new Folder(Folder.userData + '/Adobe/Illustrator/AutoSaviour');
                                        if (!settingsFolder.exists) {
                                            settingsFolder.create();
                                        }
                                        
                                        var settingsFile = new File(settingsFolder + '/settings.json');
                                        settingsFile.open('w');
                                        settingsFile.write('${JSON.stringify(settings)}');
                                        settingsFile.close();
                                        return 'true';
                                    } catch(e) {
                                        return 'error: ' + e.message;
                                    }
                                }
                                saveSettings();
                            `, function(result) {
                                if (result === 'true') {
                                    document.body.removeChild(settingsContainer);
                                    var saveTime = settings.autoSaveInterval;
                                    document.getElementById('saveStatus').textContent = 
                                        'Autosave configurado para ' + saveTime + ' minutos';
                                    updateNextSave();
                                } else {
                                    alert('Erro ao salvar configurações: ' + result);
                                }
                            });
                        };
                        
                        window.loadSettings = function() {
                            csInterface.evalScript(`
                                function getSettings() {
                                    try {
                                        var settingsFile = new File(Folder.userData + '/Adobe/Illustrator/AutoSaviour/settings.json');
                                        if (settingsFile.exists) {
                                            settingsFile.open('r');
                                            var content = settingsFile.read();
                                            settingsFile.close();
                                            return content;
                                        }
                                        return '{"autoSaveInterval": 10}';
                                    } catch(e) {
                                        return '{"autoSaveInterval": 10}';
                                    }
                                }
                                getSettings();
                            `, function(result) {
                                try {
                                    var settings = JSON.parse(result);
                                    document.getElementById('autoSaveInterval').value = settings.autoSaveInterval || 10;
                                } catch(e) {
                                    document.getElementById('autoSaveInterval').value = 10;
                                }
                            });
                        };
                        
                        // Adicionar settings.js após o CSInterface carregar
                        csInterfaceScript.onload = function() {
                            var settingsScript = document.createElement('script');
                            settingsScript.src = 'file:///' + extensionRoot + '/client/modules/settings/settings.js';
                            settingsContainer.appendChild(settingsScript);
                            
                            settingsScript.onload = function() {
                                if (typeof loadSettings === 'function') {
                                    loadSettings();
                                }
                            };
                        };
                        
                        // Adicionar botão de fechar
                        var closeBtn = document.createElement('button');
                        closeBtn.textContent = '×';
                        closeBtn.style.cssText = `
                            position: absolute;
                            top: 10px;
                            right: 10px;
                            background: none;
                            border: none;
                            color: white;
                            font-size: 20px;
                            cursor: pointer;
                        `;
                        
                        closeBtn.onclick = function() {
                            document.body.removeChild(settingsContainer);
                        };
                        settingsContainer.appendChild(closeBtn);
                    }
                }
            };
            
            xhr.onerror = function(e) {
                console.error('Erro XHR:', e);
                alert('Erro ao carregar settings. Detalhes no console.');
            };
            
            try {
                xhr.send();
            } catch(e) {
                console.error('Erro ao enviar requisição:', e);
                alert('Erro ao enviar requisição: ' + e.message);
            }
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
        // Primeiro pegamos o último save
        csInterface.evalScript(`
            function getLastSaveTime() {
                if (app.documents.length > 0) {
                    var doc = app.activeDocument;
                    var file = new File(doc.fullName);
                    return file.modified.getTime();
                }
                return "null";
            }
            getLastSaveTime();
        `, function(lastSaveResult) {
            if (lastSaveResult && lastSaveResult !== "null") {
                var lastSaveTime = new Date(parseInt(lastSaveResult));
                
                // Depois pegamos o intervalo das settings
                getSettingsInterval(function(interval) {
                    // Calculamos o próximo save baseado no último save + intervalo
                    var nextSave = new Date(lastSaveTime.getTime() + (interval * 60 * 1000));
                    
                    document.getElementById('nextSaveTime').textContent = formatTime(nextSave);
                    document.getElementById('nextSaveDate').textContent = formatDate(nextSave);
                });
            }
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

    // Adicionar a verificação inicial com um pequeno delay
    setTimeout(function() {
        checkLastSaveTime();
        checkAndSaveIfNeeded();
        updateNextSave();
    }, 1000);

    // Verificar periodicamente
    setInterval(checkAndSaveIfNeeded, 60000); // Verifica a cada minuto
});
