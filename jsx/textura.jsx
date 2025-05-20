function adicionarTextura() {
    if (app.documents.length === 0) {
        alert('Por favor, abra um documento primeiro!');
        return 'Sem documento';
    }
    var doc = app.activeDocument;
    if (doc.selection.length === 0) {
        alert('Por favor, selecione o stroke exterior!');
        return 'Nada selecionado';
    }
    var sel = doc.selection[0];
    // Duplicar o stroke
    var duplicado = sel.duplicate();
    duplicado.selected = true;
    app.executeMenuCommand('releaseMask'); // Se for clipping mask, desfaz
    app.executeMenuCommand('outline'); // Converter stroke em path fechado
    duplicado.selected = false;
    // Caminho absoluto da extensão
    var texturaPath = new File("C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/cartas/elementos/texturalinhas.ai");
    if (!texturaPath.exists) {
        alert('Ficheiro de textura não encontrado!');
        return 'Ficheiro textura não encontrado';
    }
    var textura = doc.placedItems.add();
    textura.file = texturaPath;
    textura.selected = false;
    // Posicionar a textura sobre o duplicado
    textura.left = duplicado.left;
    textura.top = duplicado.top;
    // Embed da textura para converter em paths
    textura.embed();
    // Selecionar o grupo criado pelo embed (normalmente fica selecionado)
    var texturaGrupo = doc.selection[0];
    // Garantir que o duplicado é um path/grupo válido
    if (texturaGrupo) texturaGrupo.selected = true;
    // Selecionar o duplicado do stroke por último
    duplicado.selected = true;
    // Garantir que o duplicado está acima da textura
    duplicado.zOrder(ZOrderMethod.BRINGTOFRONT);
    // Criar máscara de recorte
    app.executeMenuCommand('makeMask');
    // Enviar a máscara de recorte para o fundo
    if (doc.selection.length > 0) {
        var clippingGroup = doc.selection[0];
        clippingGroup.zOrder(ZOrderMethod.SENDTOBACK);
    }
    // Garantir que a linha exterior original fica no topo
    sel.zOrder(ZOrderMethod.BRINGTOFRONT);
    return 'Textura aplicada!';
} 