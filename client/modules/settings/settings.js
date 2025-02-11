document.addEventListener('DOMContentLoaded', function() {
    var csInterface = new CSInterface();

    // Carregar settings atuais
    function loadSettings() {
        csInterface.evalScript(`
            function getSettings() {
                var settingsFile = new File(app.path + '/Presets/en_GB/Scripts/Legenda/settings.json');
                if (settingsFile.exists) {
                    settingsFile.open('r');
                    var content = settingsFile.read();
                    settingsFile.close();
                    return content;
                }
                return '{"autoSaveInterval": 10}';
            }
            getSettings();
        `, function(result) {
            var settings = JSON.parse(result);
            document.getElementById('autoSaveInterval').value = settings.autoSaveInterval || 10;
        });
    }

    // Salvar settings
    window.saveSettings = function() {
        var autoSaveInterval = parseInt(document.getElementById('autoSaveInterval').value) || 10;
        var settings = {
            autoSaveInterval: autoSaveInterval
        };

        csInterface.evalScript(`
            function saveSettings(settingsStr) {
                var settingsFile = new File(app.path + '/Presets/en_GB/Scripts/Legenda/settings.json');
                settingsFile.open('w');
                settingsFile.write('${JSON.stringify(settings)}');
                settingsFile.close();
                return true;
            }
            saveSettings();
        `, function(result) {
            if (result === 'true') {
                window.close();
            } else {
                alert('Error saving settings');
            }
        });
    };

    // Carregar settings ao abrir
    loadSettings();
});