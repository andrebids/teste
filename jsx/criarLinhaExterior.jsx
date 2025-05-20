function criarLinhaExterior() {
    if (app.documents.length === 0) {
        alert('Por favor, abra um documento primeiro!');
        return 'Sem documento';
    }
    var doc = app.activeDocument;
    if (doc.selection.length === 0) {
        alert('Por favor, selecione o grupo de texto expandido!');
        return 'Nada selecionado';
    }
    var sel = doc.selection[0];
    if (sel.typename !== 'GroupItem') {
        alert('Selecione um grupo de paths (texto expandido)!');
        return 'Seleção inválida';
    }
    // Cor #494949 para o stroke
    var corTextura = new RGBColor();
    corTextura.red = 73;
    corTextura.green = 73;
    corTextura.blue = 73;
    // Duplicar o grupo para não destruir o original
    var grupo = sel.duplicate();
    grupo.selected = true;
    // Desagrupar tudo dentro do grupo
    function desagruparTudo(gr) {
        var mudou = false;
        for (var i = gr.pageItems.length - 1; i >= 0; i--) {
            var item = gr.pageItems[i];
            if (item.typename === 'GroupItem') {
                item.ungroup();
                mudou = true;
            }
        }
        return mudou;
    }
    while (desagruparTudo(grupo)) {}
    // Selecionar todos os PathItem e CompoundPathItem
    for (var i = 0; i < doc.pageItems.length; i++) {
        doc.pageItems[i].selected = false;
    }
    for (var i = 0; i < grupo.pageItems.length; i++) {
        var item = grupo.pageItems[i];
        if (item.typename === 'PathItem' || item.typename === 'CompoundPathItem') {
            item.selected = true;
        }
    }
    // Agrupar antes do Pathfinder
    app.executeMenuCommand('group');
    // Pathfinder Add (primeiro botão do Shape Modes)
    app.executeMenuCommand('Live Pathfinder Add');
    app.executeMenuCommand('expandStyle');
    app.executeMenuCommand('ungroup');
    // Função recursiva robusta para aplicar só stroke
    function aplicarStroke(obj) {
        if (obj.typename === 'PathItem') {
            obj.filled = false;
            obj.stroked = true;
            obj.strokeColor = corTextura;
            obj.strokeWidth = 19.843;
            // Não definir strokeJoin
        } else if (obj.typename === 'GroupItem') {
            for (var i = 0; i < obj.pageItems.length; i++) {
                aplicarStroke(obj.pageItems[i]);
            }
        } else if (obj.typename === 'CompoundPathItem') {
            for (var i = 0; i < obj.pathItems.length; i++) {
                aplicarStroke(obj.pathItems[i]);
            }
        }
    }
    var resultSel = app.activeDocument.selection;
    for (var i = 0; i < resultSel.length; i++) {
        aplicarStroke(resultSel[i]);
    }
    // Procurar grupo I_OUTLINES dentro do grupo duplicado
    var grupoI = null;
    for (var i = 0; i < grupo.pageItems.length; i++) {
        var item = grupo.pageItems[i];
        if (item.typename === 'GroupItem' && item.name === 'I_OUTLINES') {
            grupoI = item;
            break;
        }
    }
    // Mover todos os elementos do grupo duplicado para baixo
    var altura = sel.height;
    var deslocamento = altura + 40;
    for (var i = 0; i < grupo.pageItems.length; i++) {
        grupo.pageItems[i].top = grupo.pageItems[i].top - deslocamento;
    }
    // Garantir que o grupo dos I's também é movido (caso esteja fora do grupo principal)
    if (grupoI) {
        grupoI.top = sel.top - deslocamento;
    }
    // Apagar o texto original (seleção inicial)
    sel.remove();
    return 'Linha exterior criada!';
} 