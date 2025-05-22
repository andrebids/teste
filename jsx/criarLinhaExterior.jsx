// Função global para enviar mensagens ao painel HTML
function logToPanel(msg) {
    try {
        if (typeof CSInterface !== 'undefined') {
            new CSInterface().evalScript('logMsg("' + msg.replace(/"/g, '\"') + '")');
        } else {
            $.writeln(msg);
        }
    } catch(e) {
        $.writeln(msg);
    }
}

function criarLinhaExterior() {
    if (app.documents.length === 0) {
        logToPanel('Por favor, abra um documento primeiro!');
        return 'Sem documento';
    }
    var doc = app.activeDocument;
    if (doc.selection.length === 0) {
        logToPanel('Por favor, selecione o grupo de texto expandido!');
        return 'Nada selecionado';
    }
    var sel = doc.selection[0];
    if (sel.typename !== 'GroupItem') {
        logToPanel('Selecione um grupo de paths (texto expandido)!');
        return 'Seleção inválida';
    }
    // Cor #494949 para o stroke
    var corTextura = new RGBColor();
    corTextura.red = 73;
    corTextura.green = 73;
    corTextura.blue = 73;
    // Não duplicar o grupo, trabalhar diretamente sobre o selecionado
    var grupo = sel; // agora grupo é apenas um alias para sel
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
    // Aplicar stroke cinza nos itens resultantes
    var v_selection = doc.selection;
    aplicarStrokeCinza(v_selection);
    logToPanel('Pathfinder Unite aplicado e stroke cinza definido!');
    // Duplicar o path exterior criado e nomear como TEMP_TEXTURA
    var tempTextura = null;
    var tempSel = app.activeDocument.selection;
    // Procurar o maior path na seleção (normalmente o exterior)
    var maiorArea = 0;
    for (var i = 0; i < tempSel.length; i++) {
        var item = tempSel[i];
        if (item.typename === 'PathItem' || item.typename === 'CompoundPathItem') {
            var b = item.geometricBounds;
            var area = Math.abs((b[2] - b[0]) * (b[1] - b[3]));
            if (area > maiorArea) {
                maiorArea = area;
                tempTextura = item;
            }
        }
    }
    if (tempTextura) {
        var copiaTemp = tempTextura.duplicate();
        copiaTemp.name = 'TEMP_TEXTURA';
        copiaTemp.selected = false;
    }
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
    // Procurar grupo I_OUTLINES dentro do grupo
    var grupoI = null;
    for (var i = 0; i < grupo.pageItems.length; i++) {
        var item = grupo.pageItems[i];
        if (item.typename === 'GroupItem' && item.name === 'I_OUTLINES') {
            grupoI = item;
            break;
        }
    }
    // Não apagar o texto original, pois agora é o mesmo grupo
    // Expandir a linha exterior (Outline Stroke)
    app.executeMenuCommand('OffsetPath v22');
    // Nomear o grupo final das linhas exteriores
    var grupoFinal = null;
    var selecaoAtual = app.activeDocument.selection;
    for (var i = 0; i < selecaoAtual.length; i++) {
        if (selecaoAtual[i].typename === 'GroupItem') {
            grupoFinal = selecaoAtual[i];
            break;
        }
    }
    if (grupoFinal !== null) {
        grupoFinal.name = 'LINHA_EXTERIOR';
        logToPanel('Grupo LINHA_EXTERIOR criado! Tipo: ' + grupoFinal.typename);
    } else if (selecaoAtual.length > 0) {
        // Se não for grupo, nomear o primeiro item da seleção
        var itemSel = selecaoAtual[0];
        if (itemSel.typename === 'PathItem' || itemSel.typename === 'CompoundPathItem') {
            itemSel.name = 'LINHA_EXTERIOR';
            logToPanel('LINHA_EXTERIOR nomeado em item do tipo: ' + itemSel.typename);
        } else {
            logToPanel('Item selecionado não é PathItem nem CompoundPathItem. Tipo: ' + itemSel.typename);
        }
    } else {
        logToPanel('Nenhum item selecionado para nomear como LINHA_EXTERIOR.');
    }

    // Aplicar apenas stroke cinza em todos os paths selecionados (recursivo)
    function aplicarStrokeCinza(objSel) {
        for (var i = 0; i < objSel.length; i++) {
            var pathRef = objSel[i];
            if (pathRef.typename == 'GroupItem') {
                aplicarStrokeCinza(pathRef.pageItems);
                continue;
            }
            if (pathRef.typename == 'CompoundPathItem') {
                aplicarStrokeCinza(pathRef.pathItems);
                continue;
            }
            if (pathRef.typename == 'PathItem') {
                pathRef.filled = false;
                pathRef.stroked = true;
                pathRef.strokeColor = corTextura;
                pathRef.strokeWidth = 19.843;
            }
        }
    }
    var v_selection = app.activeDocument.selection;
    aplicarStrokeCinza(v_selection);
    redraw();

    // Aplicar OffsetPath v22 ao grupo I_OUTLINES, se existir
    var doc = app.activeDocument;
    var itemIOutlines = null;
    for (var i = 0; i < doc.pageItems.length; i++) {
        var item = doc.pageItems[i];
        if (item.name === 'I_OUTLINES') {
            itemIOutlines = item;
            break;
        }
    }
    if (itemIOutlines !== null) {
        // Desmarcar todos
        for (var i = 0; i < doc.pageItems.length; i++) {
            doc.pageItems[i].selected = false;
        }
        itemIOutlines.selected = true;
        try {
            app.executeMenuCommand('OffsetPath v22');
            logToPanel('Outline stroke aplicado com sucesso no I_OUTLINES!');
        } catch(e) {
            logToPanel('Erro ao aplicar outline stroke ao I_OUTLINES: ' + e);
        }
    } else {
        logToPanel('I_OUTLINES não encontrado para aplicar outline stroke.');
    }

    selecionarItensOutlinesELinhaExterior();
    desagruparEUnirOutlinesELinhaExterior();
    return 'Linha exterior criada e expandida!';
}

function selecionarGrupoIOutlines() {
    try {
        if (app.documents.length === 0) {
            logToPanel('Por favor, abra um documento primeiro!');
            return;
        }
        var doc = app.activeDocument;
        var grupoEncontrado = null;
        var grupos = doc.groupItems;
        for (var i = 0; i < grupos.length; i++) {
            if (grupos[i].name === 'I_OUTLINES') {
                grupoEncontrado = grupos[i];
                break;
            }
        }
        if (grupoEncontrado !== null) {
            // Selecionar apenas o grupo I_OUTLINES
            for (var i = 0; i < doc.pageItems.length; i++) {
                doc.pageItems[i].selected = false;
            }
            grupoEncontrado.selected = true;
            try {
                app.executeMenuCommand('OffsetPath v22');
                logToPanel('Outline stroke aplicado com sucesso no grupo I_OUTLINES!');
            } catch(e) {
                logToPanel('Erro ao aplicar outline stroke: ' + e);
            }
        } else {
            logToPanel('Grupo I_OUTLINES não encontrado.');
        }
    } catch(e) {
        logToPanel('Erro ao selecionar grupo: ' + e);
    }
}

function selecionarItensOutlinesELinhaExterior() {
    if (app.documents.length === 0) {
        logToPanel('Por favor, abra um documento primeiro!');
        return;
    }
    var doc = app.activeDocument;
    var itemIOutlines = null;
    var itemLinhaExterior = null;
    for (var i = 0; i < doc.pageItems.length; i++) {
        var item = doc.pageItems[i];
        if (item.name === 'I_OUTLINES') {
            itemIOutlines = item;
        }
        if (item.name === 'LINHA_EXTERIOR') {
            itemLinhaExterior = item;
        }
    }
    // Desmarcar todos
    for (var i = 0; i < doc.pageItems.length; i++) {
        doc.pageItems[i].selected = false;
    }
    // Selecionar os dois itens se existirem
    var msg = '';
    if (itemIOutlines !== null) {
        itemIOutlines.selected = true;
        msg += 'I_OUTLINES selecionado (' + itemIOutlines.typename + ').\n';
    } else {
        msg += 'I_OUTLINES não encontrado.\n';
    }
    if (itemLinhaExterior !== null) {
        itemLinhaExterior.selected = true;
        msg += 'LINHA_EXTERIOR selecionado (' + itemLinhaExterior.typename + ').';
    } else {
        msg += 'LINHA_EXTERIOR não encontrado.';
    }
    logToPanel(msg);
}

function desagruparEUnirOutlinesELinhaExterior() {
    if (app.documents.length === 0) {
        logToPanel('Por favor, abra um documento primeiro!');
        return;
    }
    var doc = app.activeDocument;
    var itemIOutlines = null;
    var itemLinhaExterior = null;
    for (var i = 0; i < doc.pageItems.length; i++) {
        var item = doc.pageItems[i];
        if (item.name === 'I_OUTLINES') {
            itemIOutlines = item;
        }
        if (item.name === 'LINHA_EXTERIOR') {
            itemLinhaExterior = item;
        }
    }
    if (itemIOutlines === null || itemLinhaExterior === null) {
        logToPanel('É necessário que ambos os grupos I_OUTLINES e LINHA_EXTERIOR existam no documento!');
        return;
    }
    // Desmarcar todos
    for (var i = 0; i < doc.pageItems.length; i++) {
        doc.pageItems[i].selected = false;
    }
    itemIOutlines.selected = true;
    itemLinhaExterior.selected = true;
    // Desagrupar ambos
    try {
        if (itemIOutlines.typename === 'GroupItem') {
            app.executeMenuCommand('ungroup');
        }
        if (itemLinhaExterior.typename === 'GroupItem') {
            app.executeMenuCommand('ungroup');
        }
    } catch(e) {
        logToPanel('Erro ao desagrupar: ' + e);
        return;
    }
    // Selecionar todos os itens resultantes (os paths que estavam dentro dos grupos)
    var itensParaAgrupar = [];
    for (var i = 0; i < doc.pageItems.length; i++) {
        var item = doc.pageItems[i];
        if (item.name === 'I_OUTLINES' || item.name === 'LINHA_EXTERIOR') {
            // Pode ter sobrado paths com esses nomes, selecionar
            item.selected = true;
            itensParaAgrupar.push(item);
        }
    }
    // Se não encontrou nada para agrupar, alertar
    if (itensParaAgrupar.length === 0) {
        logToPanel('Nenhum item encontrado para agrupar após desagrupar!');
        return;
    }
    // Agrupar tudo
    app.executeMenuCommand('group');
    // Renomear o novo grupo
    var novoGrupo = null;
    var selecaoAtual = doc.selection;
    for (var i = 0; i < selecaoAtual.length; i++) {
        if (selecaoAtual[i].typename === 'GroupItem') {
            novoGrupo = selecaoAtual[i];
            break;
        }
    }
    if (novoGrupo !== null) {
        novoGrupo.name = 'OUTLINES_E_LINHA_EXTERIOR';
        logToPanel('Novo grupo OUTLINES_E_LINHA_EXTERIOR criado com sucesso!');
        // Selecionar apenas o novo grupo
        for (var i = 0; i < doc.pageItems.length; i++) {
            doc.pageItems[i].selected = false;
        }
        novoGrupo.selected = true;
        // Aplicar Pathfinder Unite
        try {
            app.executeMenuCommand('Live Pathfinder Add');
            app.executeMenuCommand('expandStyle');
            app.executeMenuCommand('ungroup');
            // Aplicar stroke cinza nos itens resultantes
            var v_selection = doc.selection;
            aplicarStrokeCinza(v_selection);
            logToPanel('Pathfinder Unite aplicado e stroke cinza definido!');
        } catch(e) {
            logToPanel('Erro ao aplicar Pathfinder Unite: ' + e);
        }
    } else {
        logToPanel('Falha ao criar o novo grupo!');
    }
}

// Função recursiva para aplicar stroke cinza em paths, grupos e compound paths
function aplicarStrokeCinza(objSel) {
    var corTextura = new RGBColor();
    corTextura.red = 73;
    corTextura.green = 73;
    corTextura.blue = 73;
    for (var i = 0; i < objSel.length; i++) {
        var pathRef = objSel[i];
        if (pathRef.typename == 'GroupItem') {
            aplicarStrokeCinza(pathRef.pageItems);
            continue;
        }
        if (pathRef.typename == 'CompoundPathItem') {
            aplicarStrokeCinza(pathRef.pathItems);
            continue;
        }
        if (pathRef.typename == 'PathItem') {
            pathRef.filled = false;
            pathRef.stroked = true;
            pathRef.strokeColor = corTextura;
            pathRef.strokeWidth = 19.843;
        }
    }
}