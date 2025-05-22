function expandirLinhaExterior() {
    if (app.documents.length === 0) {
        alert('Por favor, abra um documento primeiro!');
        return 'Sem documento';
    }
    var doc = app.activeDocument;
    if (doc.selection.length === 0) {
        alert('Por favor, selecione a linha exterior!');
        return 'Nada selecionado';
    }
    // Caminho para o arquivo .aia na pasta elementos
    var actionFile = new File("C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/cartas/elementos/cartas.aia");
    if (actionFile.exists) {
        app.loadAction(actionFile);
        app.doScript("Expand", "cartas");
        return 'Linha exterior expandida via ação!';
    } else {
        alert("Arquivo de ação cartas.aia não encontrado na pasta elementos!");
        return 'Ação não encontrada';
    }
}

if (typeof $.global !== "undefined") {
    $.global.expandirLinhaExterior = expandirLinhaExterior;
} else {
    expandirLinhaExterior = expandirLinhaExterior;
} 