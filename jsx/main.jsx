#include 'importarFormaBase.jsx'

function runScript() {
    try {
        if (typeof importarFormaBase === 'function') {
            importarFormaBase();
        } else if (typeof $.global !== "undefined" && typeof $.global.importarFormaBase === 'function') {
            $.global.importarFormaBase();
        } else {
            alert('Função importarFormaBase não encontrada!');
            return 'Função importarFormaBase não encontrada!';
        }
        alert('importarFormaBase chamada!');
        return 'OK';
    } catch(e) {
        alert('Erro ao executar importarFormaBase: ' + e);
        return 'Erro: ' + e;
    }
}

// Garantir que a função está global
$.runScript = runScript;
$.global.runScript = runScript;