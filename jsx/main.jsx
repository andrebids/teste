$.runScript = function() {
    try {
        if (app.documents.length === 0) {
            alert('Por favor, abra um documento primeiro!');
            return;
        }
        var doc = app.activeDocument;
        var filePath = "C:/Program Files (x86)/Common Files/Adobe/CEP/extensions/cartas/elementos/arco.ai";
        var importFile = new File(filePath);
        if (!importFile.exists) {
            alert('O ficheiro arco.ai não foi encontrado!');
            return;
        }

        // Procurar ou criar a layer "Forma Base"
        var baseLayer = null;
        for (var i = 0; i < doc.layers.length; i++) {
            if (doc.layers[i].name === "Forma Base") {
                baseLayer = doc.layers[i];
                break;
            }
        }
        if (baseLayer) {
            // Apagar conteúdo anterior
            while (baseLayer.pageItems.length > 0) {
                baseLayer.pageItems[0].remove();
            }
        } else {
            baseLayer = doc.layers.add();
            baseLayer.name = "Forma Base";
        }

        // Adicionar o arquivo como placedItem e embedar
        var placed = baseLayer.placedItems.add();
        placed.file = importFile;

        // Redimensionar (opcional, pode ajustar conforme necessário)
        var larguraDesejada = 300;
        var alturaDesejada = 400;
        placed.width = larguraDesejada;
        placed.height = alturaDesejada;

        // Centralizar o placedItem na artboard ativa
        var ab = doc.artboards[doc.artboards.getActiveArtboardIndex()];
        var abBounds = ab.artboardRect;
        var abCenterX = (abBounds[0] + abBounds[2]) / 2;
        var abCenterY = (abBounds[1] + abBounds[3]) / 2;
        var pb = placed.visibleBounds;
        var placedCenterX = (pb[0] + pb[2]) / 2;
        var placedCenterY = (pb[1] + pb[3]) / 2;
        var dx = abCenterX - placedCenterX;
        var dy = abCenterY - placedCenterY;
        placed.left += dx;
        placed.top += dy;

        // Incorporar o vetor no documento
        placed.embed();

        // Função para liberar e remover todas clipping masks recursivamente
        var masksRemovidas = 0;
        function removerClippingMasks(grupo) {
            for (var i = grupo.pageItems.length - 1; i >= 0; i--) {
                var item = grupo.pageItems[i];
                if (item.typename === "GroupItem" && item.clipped) {
                    item.clipped = false;
                    // Remover todos os paths de máscara
                    for (var j = item.pageItems.length - 1; j >= 0; j--) {
                        var subitem = item.pageItems[j];
                        if (subitem.typename === "PathItem" && subitem.clipping) {
                            subitem.remove();
                            masksRemovidas++;
                        }
                    }
                }
                // Recursivo para subgrupos
                if (item.typename === "GroupItem") {
                    removerClippingMasks(item);
                }
            }
        }
        // Chamar a função na layer Forma Base
        removerClippingMasks(baseLayer);

        // Ungroup profundo até não restar mais nenhum grupo
        function ungroupAllDeep(grupo) {
            var gruposRestantes;
            do {
                gruposRestantes = 0;
                for (var i = grupo.groupItems.length - 1; i >= 0; i--) {
                    var subgrupo = grupo.groupItems[i];
                    ungroupAllDeep(subgrupo);
                    for (var j = subgrupo.pageItems.length - 1; j >= 0; j--) {
                        subgrupo.pageItems[j].move(grupo, ElementPlacement.PLACEATEND);
                    }
                    subgrupo.remove();
                    gruposRestantes++;
                }
            } while (grupo.groupItems.length > 0);
        }
        ungroupAllDeep(baseLayer);

        alert('Importação, centralização, clipping removido e ungroup TOTAL concluídos!');
    } catch(e) {
        alert('Erro: ' + e);
    }
}; 