function load_api(src) {
    let script = document.createElement('script');
    script.src = src;
    document.head.append(script);
}
//load_api('static/js/defaultSet.js')

function average(nums) {
    if (nums.length == 0) {
        console.log('average пусто')
        return null
    }
    return nums.reduce((a, b) => (a + b)) / nums.length;
}


function toFormat(label) {
    var d = new Date(label)
    var str = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
    str += ' ' + d.getHours() + ':' + d.getMinutes()
    return str
}


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
    static focus
    static focusColor

    constructor(chart, dataset, param, templateSetGraphBlock, getDataset=name=>this.dataset[name], setDataset=(name, color)=>(this.dataset[name] = color)) {
        var self = this
        this.chart = chart
        this.dataset = dataset
        this.param = param
        this.data = []
        this.getDataset = getDataset
        this.setDataset = setDataset

        this.div = templateSetGraphBlock.content.cloneNode(true).firstElementChild
        var setGrPanel = chart.block.querySelector('.settingsGraphPanel')
        setGrPanel.append(this.div)

        var keys =  Object.keys(data_parameters[param.device])
        keys.shift()
        createDownTownList(this.div.querySelector('[name="parametersY"]'), keys, param.y, function(p) {
            param.y = p
            self.updateGraph()
        })

        this.graphName = this.div.querySelector('.graphName')
        this.header = this.div.querySelector('[name=header]')
        this.graphColor = this.div.querySelector('[name="graphColor"]')
        this.arrow = this.div.querySelector('.arrow')
        this.heightSetting = this.div.querySelector('.datasetSettings').offsetHeight + this.header.offsetHeight + 5

        this.colors = {
            borderColor: this.div.querySelector('[name="borderColor"]'),
            backgroundColor: this.div.querySelector('[name="backgroundColor"]')
        }

        this.graphName.innerHTML = this.getDataset('label')
        this.graphColor.style.backgroundColor = this.getDataset('backgroundColor')
        this.graphColor.style.borderColor = this.getDataset('borderColor')
        this.colors.borderColor.style.backgroundColor = this.getDataset('borderColor')
        this.colors.backgroundColor.style.backgroundColor = this.getDataset('backgroundColor')

        this.colors.borderColor.onclick = (e) => this.clickColor('borderColor', e.pageX + 100, e.pageY - 100)
        this.colors.backgroundColor.onclick = (e) => this.clickColor('backgroundColor', e.pageX + 100, e.pageY - 100)
        this.header.onclick = () => this.show()
    }

    getSetting() {}

    mapDate(range, func, ready) {
        var self = this,
        data = [],
        start = 0
        function addSlice(end) {
            if (end < self.data.length) {
                var d = self.data.slice(start, end)
                data.push({
                    x: average(d.map(x => x.x)),
                    y: func(d.map(x => x.y)),
                })
                start = end
                self.getClosedDataIndex(end, range, addSlice)
            } else
                ready(data)
        }

        self.getClosedDataIndex(start, range, addSlice)
    }

    static findTheClosest(arr, startIndex, base){
        var arrLen = arr.length;
        var theClosest = Infinity;
        var i, temp, index;

        for(i = startIndex; i < arrLen; i++) {
            temp = Math.abs(arr[i] - base);
            if (temp <= theClosest) {
                theClosest = temp;
                index = i;
            };
        };
        return index
    };

    getClosedDataIndex(startIndex, rangeTime, func, dataName='Date') {
        getData(this.param.device, dataName, function(date) {
            var endV = date[startIndex] + rangeTime
            var endIndex = SettingGraph.findTheClosest(date, startIndex, endV) + 1
            func(endIndex)
        })
    }

    updateGraph() {}
    static addGraph(dataset, param) {
        // return: SetthinGraph
    }
    static connectGraph(parent, chart) {}

    update() {
        this.graphColor.style.backgroundColor = this.getDataset('backgroundColor')
        this.graphColor.style.borderColor = this.getDataset('borderColor')
    }

    clickColor(color, x, y) {
        SettingGraph.focus = this
        SettingGraph.focusColor = color
        Graph.focus = this.chart
        $.farbtastic('#colorpicker').setColor(this.getDataset(color))
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


class Scatter extends SettingGraph {
    static templateSetGraphBlock = document.getElementById('setGraphBlockScatter')
    static setBar = document.getElementById('setBarScatter')

    constructor(chart, param) {
        var dataset = {
            label: param.label,
            borderColor: param.borderColor,
            backgroundColor: param.backgroundColor,
            showLine: true,
            pointBorderColor: 'transparent',
            pointBackgroundColor: 'transparent',
            lineTension: 0,
        }
        var parameters = {
            device: param.device,
            calc: param.calc,
            y: param.y,
            x: param.x,
        }
        chart.chart.data.datasets.push(dataset)

        super(chart, dataset, parameters, Scatter.templateSetGraphBlock)
        var self = this

        createDownTownList(this.div.querySelector('[name="devices"]'), Object.keys(data_parameters), param.device, function(device) {
            param.device = device
            var parY = self.div.querySelector('[name="parametersY"]')
            var keys = Object.keys(data_parameters[param.device])
            keys.shift()
            replaceDownTownList(parY, keys)
            parY.querySelector('.dropdown-menu').firstChild.onclick()
            var parX = self.div.querySelector('[name="parametersX"]')
            replaceDownTownList(parX, Object.keys(data_parameters[param.device]))
            parX.querySelector('.dropdown-menu').firstChild.onclick()
        })

        this.calculation = {
            'как есть': (func) => func(self.data),
            'осреднить за ч.': (func) => self.mapDate(1000 * 60 * 60, average, func),
            'осреднить за 3 ч.': (func) => self.mapDate(1000 * 60 * 60 * 3, average, func),
            'осреднить за сут.': (func) => self.mapDate(1000 * 60 * 60 * 24, average, func),
            'макс значения за сут': (func) => self.mapDate(1000 * 60 * 60 * 24, (array) => Math.max.apply(null, array), func),
            'мин значения за сут.': (func) => self.mapDate(1000 * 60 * 60 * 24, (array) => Math.min.apply(null, array), func),
        }
        createDownTownList(this.div.querySelector('[name="parametersX"]'), Object.keys(data_parameters[this.param.device]), this.param.x, function(p) {
            self.param.x = p
            self.updateGraph()   
        })
        createDownTownList(this.div.querySelector('[name="calculation"]'), Object.keys(this.calculation), this.param.calc, function(p) {
            self.param.calc = p
            self.calculation[p](function(data) {
                self.dataset.data = data
                self.chart.chart.update()
            })
        })
        this.updateGraph()
    }

    updateGraph() {
        var self = this
        if (this.param.x == 'Date') {
            this.chart.chart.options.scales.xAxes = [{
                ticks: {
                    userCallback: function(label, index, labels) {
                        return toFormat(label)
                    }
                }
            }]
            this.chart.chart.options.tooltips.callbacks = {
                    label: function(tooltipItems) {
                        var str = toFormat(tooltipItems.xLabel)
                        str += '; ' + tooltipItems.yLabel.toFixed(2)
                        return str;
                    }
            }
        } else {
            delete this.chart.chart.options.scales.xAxes
            delete this.chart.chart.options.tooltips.callbacks.label
        }
        buildData(this.param.device, this.param.x, this.param.device, this.param.y, function(data) {
            self.data = data
            self.calculation[self.param.calc](function(data) {
                self.dataset.data = data
                self.chart.chart.options.animation.duration = 1000
                self.chart.chart.update()
            })
        })
    }

    getSetting() {
        return {
            label: this.dataset.label,
            borderColor: this.dataset.borderColor,
            backgroundColor: this.dataset.backgroundColor,
            device: this.param.device,
            calc: this.param.calc,
            y: this.param.y,
            x: this.param.x,
        }
    }
}


class Bar extends SettingGraph {
    static templateSetGraphBlock = document.getElementById('setGraphBlockBar')
    static setBar = document.getElementById('setBarBar')

    constructor(chart, param) {
        var index = chart.chart.data.labels.length
        var dataset = chart.chart.data.datasets[0]
        dataset.label.push(param.label)
        dataset.borderColor.push(param.borderColor)
        dataset.backgroundColor.push(param.backgroundColor) 
        var param = {
            device: param.device,
            y: param.y,
            x: chart.options.x
        }
        super(chart, dataset, param, Bar.templateSetGraphBlock, 
            name=>dataset[name][index], (name, color)=>(dataset[name][index]=color))
        var self = this
        this.index = index
        this.chart.chart.data.labels.push(chart.options.x)
        this.updateRangeX(function() {
            var range = self.chart.rangeX.max - self.chart.rangeX.min
            var isDate = chart.options.x == 'Date'
            self.chart.setInputRange('min', self.chart.rangeX.min + range * self.chart.options.range[0], isDate)
            self.chart.setInputRange('max', self.chart.rangeX.min + range * self.chart.options.range[1], isDate)
            self.updateGraph()
        })
    }

    updateRangeX(func) {
        var self = this
        getData(this.param.device, this.chart.options.x, function(data) {
            data.sort(function(a, b) {
                return a - b
            })
            function set(minmax, value) {
                self.chart.rangeX[minmax] = value
                self.chart.setInputRange(minmax, value, self.chart.options.x == 'Date', true)
                var minmaxIndex = minmax + 'Index'
                self.chart.rangeX[minmaxIndex][self.param.device] = null
                for (dev in self.chart.rangeX[minmaxIndex])
                    getData(dev, self.chart.options.x, function(data) {
                        self.chart.rangeX[minmaxIndex][dev] = SettingGraph.findTheClosest(data, 0, self.chart.rangeX[minmax])
                    })
            }
            if (data[0] > self.chart.rangeX.min)
                set('min', data[0])
            if (data[data.length - 1] < self.chart.rangeX.max)
                set('max', data[data.length - 1])
            func()
        })
    }

    updateGraph(update=true) {
        var self = this
        getTwoData(this.param.device, this.chart.options.x, this.param.device, this.param.y, function(x, y) {
            var data = []
            for (var i = 0; i < x.length; i++)
            data.push({
                x: x[i],
                y: y[i],
            })
            data.sort(function(a, b) {
                return a.x - b.x
            })
            data = data.slice(self.chart.rangeX.minIndex[self.param.device], self.chart.rangeX.maxIndex[self.param.device]) 
            data = uniq(data)
            self.data = data

            var range = data[data.length - 1].x - data[0].x
            var xData = data.map(x=>x.x)
            var start = SettingGraph.findTheClosest(xData, 0, range * self.chart.options.range[0] + xData[0])
            var end = SettingGraph.findTheClosest(xData, start, range * self.chart.options.range[1] + xData[0]) + 1

            var dt = data.slice(start, end)
            self.dataset.data[self.index] =  self.chart.calculation[self.chart.options.calc](dt.map(x=>x.y))
            self.chart.chart.data.labels[self.index] = self.dataset.label[self.index]

            if (update)
                self.chart.chart.update()
        })
    }

    getSetting() {
        var index = this.dataset.label.length - 1 
        return {
            label: this.dataset.label[index],
            borderColor: this.dataset.borderColor[index],
            backgroundColor: this.dataset.backgroundColor[index],
            device: this.param.device,
            y: this.param.y,
        }
    }
}


class PolarArea extends Bar {
    static templateSetGraphBlock = document.getElementById('setGraphBlockBar')
    static setBar = document.getElementById('setBarPolarArea')

    constructor(chart, param) {
        if (param.backgroundColor != 'transparent' && param.backgroundColor.length < 8)
            param.backgroundColor += '89'
        super(chart, param)
    }

    static connectGraph(parent, chart, device) {
        var setBat = PolarArea.setBar.content.cloneNode(true).firstElementChild
        parent.append(setBat)
        PolarArea.connectHTML(PolarArea, setBat, chart, device)
    }
}


class Graph {
    static templateGraphBlock = document.getElementById('graphBlock')
    static focus

    constructor(options) {
        this.block = GraphScatter.templateGraphBlock.content.cloneNode(true).firstElementChild
        GraphScatter.templateGraphBlock.before(this.block)
        this.block.getElementsByTagName('h1')[0].innerHTML = options.name
        this.options = options

        this.settingGraph = []
    }
    
    addGraph(Type, options=null) {
        if (options == null)
            options = this.settingGraph.length == 0 ? createDefaultGraph[this.options.type] : this.settingGraph[this.settingGraph.length - 1].getSetting()
        this.settingGraph.push(new Type(this, options))
    }
}


class GraphScatter extends Graph {
    constructor(options=[]) {
        super(options)

        var self = this
        var ctx = this.block.getElementsByClassName('Chart')[0].getContext('2d');
        this.chart = new Chart(ctx, {
            type: options.type,
            options: {
                responsive: true,
                pan: {
                    enabled: true,
                    mode: 'x',
                    speed: 100,
                    threshold: 100,
                },
                zoom: {
                    enabled: true,
                    drag: false,
                    mode: 'x',
                    limits: {
                        max: 10,
                        min: 0.5
                    }
                },
                elements: {
                    line: {
                        tension: 0,
                        borderDash: []
                    }
                },
                tooltips: {
                    displayColors: false,
                },
                animation: {
                    duration: 0
                }
            },
        });
        
        var setBat = Scatter.setBar.content.cloneNode(true).firstElementChild
        this.block.querySelector('.gr').append(setBat)
        this.block.querySelector('.gr').querySelector('[name="reser_zoom"]').onclick = function() {
            self.chart.resetZoom()
        }

        for (var i = options.graph.length - 1; i >= 0; i--)
            this.addGraph(Scatter, options.graph[i])

        this.block.querySelector('[name="add_graph"]').onclick = function() {
            self.addGraph(Scatter)
        }
    }
}


class GraphBar extends Graph {
    constructor(options=[]) {        
        super(options)

        var self = this

        this.rangeX = {
            min: -Infinity, 
            max: Infinity,
            minIndex: {},
            maxIndex: {},
        }
        this.fromto
        this.calculation = {
            'среднее': average,
            'максимум': data => Math.max.apply(null, data),
            'минимум': data => Math.min.apply(null, data),
        }
        this.getNewGraph(options)
    }

    getNewGraph(options) {
        var self = this
        var ctx = this.block.getElementsByClassName('Chart')[0].getContext('2d');
        this.chart = new Chart(ctx, {
            type: options.type,
            data: {
                datasets: [{
                    label: [],
                    borderColor: [],
                    backgroundColor: [],
                    lineTension: 0,
                    borderWidth: 2,
                }]
            },
        });
        this.setMinAxes(0)

        var setBat = Bar.setBar.content.cloneNode(true).firstElementChild
        this.block.querySelector('.gr').append(setBat)
        this.connectHTML(setBat, 'РОСА К-2')
        this.chart.options.legend.display = false

        for (var i = options.graph.length - 1; i >= 0; i--)
            this.addGraph(Bar, options.graph[i])

        this.block.querySelector('[name="add_graph"]').onclick = function() {
            self.addGraph(Bar)
        }
        return this.chart
    }

    connectHTML(setBat, device) {
        var self = this

        this.fromto = [setBat.querySelector('[name="from_value"]'), setBat.querySelector('[name="to_value"]')]
        createDownTownList(this.block.querySelector('[name="parametersX"]'), Object.keys(data_parameters[device]), this.options.x, 
            function(p) {
                if (p == 'Date')
                    self.fromto[0].type = 'datetime-local'
                else
                    self.fromto[0].type = 'number'
                self.fromto[1].type = self.fromto[0].type
                self.options.range[0] = 0
                self.options.range[1] = 1
                range.set(0, 1)
                self.rangeX.min = -Infinity
                self.rangeX.max = Infinity
                for (let i = 0; i < self.settingGraph.length; i++) {
                    self.options.x = p
                    self.settingGraph[i].updateRangeX(()=>self.settingGraph[i].updateGraph(false))
                }
                self.chart.update()
            }
        )

        createDownTownList(this.block.querySelector('[name="calc"]'), Object.keys(this.calculation), Object.keys(this.calculation)[0], 
            function(p) {
                self.options.calc = p
                for (var i = 0; i < self.settingGraph.length; i++) {
                    self.settingGraph[i].updateGraph(false)
                }
                self.chart.update()
            }
        )

        function unpdateGraphWithRange(x, x1) {
            self.options.range[0] = x
            self.options.range[1] = x1
            for (var i = 0; i < self.settingGraph.length; i++) {
                self.settingGraph[i].updateGraph(false)
            }
            self.chart.update()
        }

        this.fromto[0].oninput = function() {
            var rangeA = self.rangeX.max - self.rangeX.min
            var value = this.value
            if (this.type != 'number') {
                value = Date.parse(value)
                self.setInputRange('min', value, true)
            } else {
                self.setInputRange('min', value)
            }
            var start = (value - self.rangeX.min) / rangeA
            range.set(start, self.options.range[1])
            unpdateGraphWithRange(start, self.options.range[1])
        }

        this.fromto[1].oninput = function() {
            var rangeA = self.rangeX.max - self.rangeX.min
            var value = this.value
            if (this.type != 'number') {
                value = Date.parse(value)
                self.setInputRange('max', value, true)
            } else {
                self.setInputRange('max', value)
            }
            var end = (value - self.rangeX.min) / rangeA
            range.set(self.options.range[0], end)
            unpdateGraphWithRange(self.options.range[0], end)
        }

        if (this.block.querySelector('[name="min_value"]'))
        this.block.querySelector('[name="min_value"]').addEventListener('input', function() {
            self.chart.options.scales.yAxes[0].ticks.min = parseInt(this.value)
            self.chart.update()
        })

        var range = new Range(this.block.querySelector('.doubleRange'), function(x, x1) {
            var isDate = self.options.x == 'Date'
            var range = self.rangeX.max - self.rangeX.min
            self.setInputRange('min', self.rangeX.min + range * x, isDate)
            self.setInputRange('max', self.rangeX.min + range * x1, isDate)
            unpdateGraphWithRange(x, x1)
        })
        range.set(this.options.range[0], this.options.range[1])
    }

    setMinAxes(min) {
        this.chart.options.scales.yAxes[0].ticks.min = min
    }

    setInputRange(elemName, value, isDate, edge=false) {
        if (isDate) {
            var d = (new Date(parseInt(value / 1000) * 1000)).toISOString()
            value = d.substring(0, d.length - 1)
        }
        if (elemName == 'min') {
            this.fromto[0].value = value
            this.fromto[1].min = value 
            if (edge)
                this.fromto[0].min = value
        } else {
            this.fromto[1].value = value
            this.fromto[0].max = value 
            if (edge)
                this.fromto[1].max = value
        }
    }
}


class GraphPolarArea extends GraphBar {
    getNewGraph(options) {
        var self = this
        var ctx = this.block.getElementsByClassName('Chart')[0].getContext('2d');
        this.chart = new Chart(ctx, {
            type: options.type,
            data: {
                datasets: [{
                    label: [],
                    borderColor: [],
                    backgroundColor: [],
                    lineTension: 0,
                    borderWidth: 2,
                }]
            },
        });

        var setBat = PolarArea.setBar.content.cloneNode(true).firstElementChild
        this.block.querySelector('.gr').append(setBat)
        this.connectHTML(setBat, 'РОСА К-2')
        this.chart.options.legend.display = false

        for (var i = options.graph.length - 1; i >= 0; i--)
            this.addGraph(PolarArea, options.graph[i])

        this.block.querySelector('[name="add_graph"]').onclick = function() {
            self.addGraph(PolarArea)
        }
        return this.chart
    }
}


var graphs = []
var TypeGraphs = {
    'scatter': GraphScatter,
    'bar': GraphBar,
    'polarArea': GraphPolarArea,
}
for (var i = 0; i < defaultGraph.length; i++) {
    graphs.push(new TypeGraphs[defaultGraph[i].type](defaultGraph[i]))
    Graph.templateGraphBlock.before(document.createElement('hr'))
}


document.getElementById('addGraph').addEventListener('click', function() {
    graphs.push(new Graph())
})