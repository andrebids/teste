function importarFormaBase() {
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
                for (var j = item.pageItems.length - 1; j >= 0; j--) {
                    var subitem = item.pageItems[j];
                    if (subitem.typename === "PathItem" && subitem.clipping) {
                        subitem.remove();
                        masksRemovidas++;
                    }
                }
            }
            if (item.typename === "GroupItem") {
                removerClippingMasks(item);
            }
        }
    }
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

    // Remover o retângulo da artboard
    function removerRetanguloArtboard(grupo) {
        var maiorArea = 0;
        var indexMaior = -1;
        for (var i = 0; i < grupo.pageItems.length; i++) {
            var item = grupo.pageItems[i];
            if (item.typename === 'PathItem') {
                var b = item.geometricBounds;
                var area = Math.abs((b[2] - b[0]) * (b[1] - b[3]));
                if (area > maiorArea) {
                    maiorArea = area;
                    indexMaior = i;
                }
            }
        }
        // Remove o maior path (provavelmente o retângulo da artboard)
        if (indexMaior >= 0) {
            try { grupo.pageItems[indexMaior].remove(); } catch(e) {}
        }
    }
    removerRetanguloArtboard(baseLayer);

}

if (typeof $.global !== "undefined") {
    $.global.importarFormaBase = importarFormaBase;
} else {
    importarFormaBase = importarFormaBase;
}