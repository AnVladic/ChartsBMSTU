$(document).ready(function() {
    var inputColor = document.getElementById('color')
    var noColor = document.getElementById('noColor')
    noColor.onclick = () => callback('transparent')

    function callback(color) {
        inputColor.style.backgroundColor = color
        inputColor.value = color
        SettingGraph.focus.setDataset(SettingGraph.focusColor, color)
        SettingGraph.focus.colors[SettingGraph.focusColor].style.backgroundColor = color
        Graph.focus.chart.update()
    }
    $('#colorpicker').farbtastic(callback)
    inputColor.addEventListener('input', function(e) {
        inputColor.style.backgroundColor = inputColor.value
        $.farbtastic('#colorpicker').setColor(inputColor.value)
    })   
})

