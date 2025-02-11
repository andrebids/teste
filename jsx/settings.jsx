// Função para abrir as settings via JSX
try {
    alert("1. Iniciando script JSX");
    
    var eventObj = new CSXSEvent();
    alert("2. Evento criado");
    
    eventObj.type = "com.bids.settings";
    alert("3. Tipo do evento definido");
    
    eventObj.dispatch();
    alert("4. Evento disparado");
} catch(e) {
    alert("Erro no JSX: " + e);
}
