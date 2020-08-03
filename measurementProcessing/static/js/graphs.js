var defaultGraph = [
    {
        name: 'First',
        graph: [
            {
                label: 'My First dataset',
                borderColor: '#ff42b8',
                backgroundColor: '#ff94b6',
                showLine: true,
                pointBorderColor: 'transparent',
                pointBackgroundColor: 'transparent',
                lineTension: 0
            },
        ],
        param: [
            {
                device: 'РОСА К-2',
                y: 'soil_soilH',
                x: 'soil_soilT',
            }
        ],
        type: 'scatter',
    },
    {
        name: 'Second',
        graph: [
            {
                label: 'My Second dataset',
                borderColor: '#9d94ff',
                backgroundColor: 'transparent',
                showLine: true,
                pointBorderColor: 'transparent',
                pointBackgroundColor: 'transparent',
            },
            {
                label: 'My Third dataset',
                borderColor: '#2eff32',
                backgroundColor: 'transparent',
                showLine: true,
                pointBorderColor: 'transparent',
                pointBackgroundColor: 'transparent',
            },
        ],
        param: [
            {
                device: 'TEST',
                y: 'dallas_temp2',
                x: 'dallas_temp1',
            },
            {
                device: 'TEST',
                y: 'system_RSSI',
                x: 'dallas_temp1',
            }
        ],
        type: 'scatter',
    }
]


function createDownTownList(parent, list, header, func=function(){}) {
    var head = parent.querySelector('.dropdown-toggle')
    head.innerHTML += header
    replaceDownTownList(parent, list, func)
}


function replaceDownTownList(parent, list, func=function(){}) {
    var menu = parent.querySelector('.dropdown-menu')
    var head = parent.querySelector('.dropdown-toggle')
    var cl = function() {
        head.childNodes[2].data = this.innerHTML
        func(this.innerHTML)
    }
    if (menu.firstChild.onclick)
        cl = menu.firstChild.onclick

    while (menu.firstChild)
        menu.removeChild(menu.firstChild);

    for (var i = 0; i < list.length; i++) {
        a = document.createElement('p')
        a.classList.add('dropdown-item')
        a.innerHTML = list[i]
        a.onclick = cl
        menu.append(a)
    }
}


class SettingGraph {
    static templateSetGraphBlock = document.getElementById('setGraphBlock')
    static focus
    static focusColor

    constructor(chart, dataset, param) {
        var self = this
        this.chart = chart
        this.dataset = dataset
        this.param = param

        this.div = SettingGraph.templateSetGraphBlock.content.cloneNode(true).firstElementChild
        chart.block.querySelector('[class="settingsGraphPanel"]').append(this.div)

        createDownTownList(this.div.querySelector('[name="devices"]'), Object.keys(data_parameters), param.device, function(device) {
            param.device = device
            var parY = self.div.querySelector('[name="parametersY"]')
            replaceDownTownList(parY, Object.keys(data_parameters[param.device]))
            parY.querySelector('.dropdown-menu').firstChild.onclick()
            var parX = self.div.querySelector('[name="parametersX"]')
            replaceDownTownList(parX, Object.keys(data_parameters[param.device]))
            parX.querySelector('.dropdown-menu').firstChild.onclick()
            //self.updateGraph()    
        })
        createDownTownList(this.div.querySelector('[name="parametersY"]'), Object.keys(data_parameters[param.device]), param.y, function(p) {
            param.y = p
            self.updateGraph()   
        })
        createDownTownList(this.div.querySelector('[name="parametersX"]'), Object.keys(data_parameters[param.device]), param.x, function(p) {
            param.x = p
            self.updateGraph()   
        })

        this.updateGraph()
        this.graphName = this.div.querySelector('.graphName')
        this.header = this.div.querySelector('[name=header]')
        this.graphColor = this.div.querySelector('[name="graphColor"]')
        this.arrow = this.div.querySelector('.arrow')
        this.heightSetting = this.div.querySelector('.datasetSettings').offsetHeight + this.header.offsetHeight + 20


        this.colors = {
            borderColor: this.div.querySelector('[name="borderColor"]'),
            backgroundColor: this.backgroundColor = this.div.querySelector('[name="backgroundColor"]')
        }

        this.graphName.innerHTML = dataset.label
        this.graphColor.style.backgroundColor = dataset.backgroundColor
        this.graphColor.style.borderColor = dataset.borderColor
        this.colors.borderColor.style.backgroundColor = dataset.borderColor
        this.colors.backgroundColor.style.backgroundColor = dataset.backgroundColor

        this.colors.borderColor.onclick = (e) => this.clickColor('borderColor', e.pageX + 100, e.pageY - 100)
        this.colors.backgroundColor.onclick = (e) => this.clickColor('backgroundColor', e.pageX + 100, e.pageY - 100)
        this.header.onclick = () => this.show()
    }

    updateGraph() {
        var self = this
        buildData(this.param.device, this.param.x, this.param.device, this.param.y, function(data) {
            self.dataset.data = data
            self.chart.chart.update()
        })
    }

    update() {
        this.graphColor.style.backgroundColor = this.dataset.backgroundColor
        this.graphColor.style.borderColor = this.dataset.borderColor
    }

    clickColor(color, x, y) {
        SettingGraph.focus = this
        SettingGraph.focusColor = color
        Graph.focus = this.chart
        $.farbtastic('#colorpicker').setColor(this.dataset[color])
        this.showFarbtastic(x, y)
    }

    showFarbtastic(x, y) {
        $(document).mouseup(function (e) {
            var div = $('#colorPickerBlock');
            if (!div.is(e.target) && div.has(e.target).length === 0) {
                document.getElementById('colorPickerBlock').style.display = 'none'
                $(this).off('mouseup')
            }
        })
        $('#colorPickerBlock').css({display: 'block', top: y + 'px', left: x + 'px'})
    }

    show() {
        this.div.style.height = this.heightSetting + 'px'
        this.graphColor.style.display = 'none'
        this.arrow.style.transform = 'rotate(-90deg)'
        this.div.classList.remove('addLine')
        this.div.style.overflow = 'visible'
        this.header.onclick = () => this.hide()
    }

    hide() {
        this.update()
        this.div.style.height = ''
        this.graphColor.style.display = ''
        this.arrow.style.transform = ''
        this.div.style.overflow = ''
        this.div.classList.add('addLine')
        this.header.onclick = () => this.show()
    }
}


class Graph {
    static templateGraphBlock = document.getElementById('graphBlock')
    static focus

    constructor(options) {
        this.block = Graph.templateGraphBlock.content.cloneNode(true).firstElementChild
        Graph.templateGraphBlock.before(this.block)
        this.block.getElementsByTagName('h1')[0].innerHTML = options.name
        this.options = options

        var ctx = this.block.getElementsByClassName('Chart')[0].getContext('2d');
        this.chart = new Chart(ctx, {
            type: options.type,
            data: {
                datasets: options.graph
            },
        });

        this.settingGraph = []
        for (var i = options.graph.length - 1; i >= 0; i--)
            this.settingGraph.push(new SettingGraph(this, this.chart.data.datasets[i], options.param[i]))
    }
}

var graphs = []
for (var i = 0; i < defaultGraph.length; i++) {
    graphs.push(new Graph(defaultGraph[i]))
    Graph.templateGraphBlock.before(document.createElement('hr'))
}


document.getElementById('addGraph').addEventListener('click', function() {
    graphs.push(new Graph())
})
