function adicionarTextoNoIllustrator(texto) {
    try {
        if (app.documents.length === 0) {
            alert('Por favor, abra um documento primeiro!');
            return 'Sem documento';
        }
        var doc = app.activeDocument;
        var textoFinal = texto.toUpperCase();
        var tf = doc.textFrames.add();
        tf.contents = textoFinal;
        var fonte;
        try {
            fonte = app.textFonts.getByName("Montserrat-Bold");
        } catch (e) {
            fonte = app.textFonts.getByName("Arial-BoldMT");
        }
        tf.textRange.characterAttributes.textFont = fonte;
        tf.textRange.characterAttributes.size = 40;
        tf.textRange.characterAttributes.tracking = -120; // Ajuste conforme necessário
        var ab = doc.artboards[doc.artboards.getActiveArtboardIndex()];
        var abBounds = ab.artboardRect;
        var abCenterX = (abBounds[0] + abBounds[2]) / 2;
        var abCenterY = (abBounds[1] + abBounds[3]) / 2;
        tf.left = abCenterX - tf.width / 2;
        tf.top = abCenterY + tf.height / 2;
        if (tf.kind && tf.kind !== TextType.POINTTEXT) {
            tf.convertToPointObject();
        }
        var grupo = tf.createOutline();
        grupo.selected = true;
        // --- Ajuste pós-expand progressivo com overlaps personalizados ---
        if (grupo.pageItems && grupo.pageItems.length > 1) {
            // Pares especiais (exceto IN e NI)
            var paresOverlapExtra = {
                'ER': true, 'RE': true, 'CI': true, 'IC': true, 'EC': true, 'CE': true,
                'EA': true, 'AE': true, 'CO': true, 'OC': true, 'AT': true, 'TA': true,
                'AV': true, 'VA': true, 'AW': true, 'WA': true, 'FA': true, 'AF': true,
                'LT': true, 'TL': true, 'LA': true, 'AL': true, 'LV': true, 'VL': true,
                'LY': true, 'YL': true, 'TT': true, 'RT': true, 'TR': true, 'CT': true,
                'TC': true, 'IT': true, 'TI': true, 'IC': true, 'IL': true, 'LI': true,
                'IE': true, 'EI': true, 'CA': true, 'AC': true, 'CL': true, 'LC': true,
                'LO': true, 'OL': true, 'LE': true, 'EL': true, 'NO': true, 'ON': true,
                'NA': true, 'AN': true, 'NE': true, 'EN': true, 'RI': true, 'IR': true,
                'RA': true, 'AR': true, 'RO': true, 'OR': true, 'OA': true, 'AO': true,
                'OP': true, 'PO': true, 'PA': true, 'AP': true, 'PE': true, 'EP': true,
                'PI': true, 'IP': true, 'TO': true, 'OT': true, 'TI': true, 'TE': true, 'ET': true
            };
            // Overlaps personalizados por par
            var overlapsEspeciais = {
                'AT': -10,
                'TA': -10,
                'VA': -12.5,
                'AV': -6,
                'SS': -3,
                'SA': -4,
                'PA': -7,
                'OY': -6,
                'EC': -3,
                'IL': -0,
                'LI': -0,
                'DI': -2,
                'DA': -6
                // Adiciona aqui outros pares conforme necessário
            };
            // Ordenar as letras da esquerda para a direita
            var letras = [];
            for (var i = 0; i < grupo.pageItems.length; i++) {
                letras.push(grupo.pageItems[i]);
            }
            for (var i = 0; i < letras.length - 1; i++) {
                for (var j = i + 1; j < letras.length; j++) {
                    if (letras[j].visibleBounds[0] < letras[i].visibleBounds[0]) {
                        var temp = letras[i];
                        letras[i] = letras[j];
                        letras[j] = temp;
                    }
                }
            }
            // Aproximação progressiva com overlaps personalizados
            for (var k = 1; k < letras.length; k++) {
                var anterior = letras[k-1];
                var atual = letras[k];
                var direitaAnterior = anterior.visibleBounds[2];
                var esquerdaAtual = atual.visibleBounds[0];
                var distancia = esquerdaAtual - direitaAnterior;
                var letraEsq = '';
                var letraDir = '';
                try {
                    letraEsq = textoFinal.charAt(k-1);
                    letraDir = textoFinal.charAt(k);
                } catch(e) {}
                var par = letraEsq + letraDir;
                var overlapMax = 0; // padrão: não sobrepor
                if (overlapsEspeciais.hasOwnProperty(par)) {
                    overlapMax = overlapsEspeciais[par];
                } else if (paresOverlapExtra[par]) {
                    overlapMax = -1;
                }
                // Aproximar até tocar (ou até overlapMax)
                var step = 0.2;
                var tentativas = 0;
                while (distancia > 0.1 && tentativas < 50) {
                    atual.left -= step;
                    direitaAnterior = anterior.visibleBounds[2];
                    esquerdaAtual = atual.visibleBounds[0];
                    distancia = esquerdaAtual - direitaAnterior;
                    tentativas++;
                }
                // Se for par especial, permitir overlap personalizado
                if (overlapMax < 0 && distancia > overlapMax) {
                    while (distancia > overlapMax && tentativas < 100) {
                        atual.left -= step;
                        direitaAnterior = anterior.visibleBounds[2];
                        esquerdaAtual = atual.visibleBounds[0];
                        distancia = esquerdaAtual - direitaAnterior;
                        tentativas++;
                    }
                }
            }
        }
        return 'Texto adicionado, expandido e letras coladas automaticamente!';
    } catch(e) {
        alert('Erro ao adicionar texto: ' + e);
        return 'Erro: ' + e;
    }
} 