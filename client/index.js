var csInterface = new CSInterface();

function init() {
    themeManager.init();
}

function executarScript() {
    var scriptPath = "C:/Program Files/Adobe/Adobe Illustrator 2025/Presets/en_GB/Scripts/Legenda/script.jsx";
    csInterface.evalScript('$.evalFile("' + scriptPath + '")');
}

init();

var btnTestar = document.getElementById("btnTestar");
btnTestar.onclick = function() {
    csInterface.evalScript("testarPlugin()", function(resultado) {
        alert(resultado);
    });
}