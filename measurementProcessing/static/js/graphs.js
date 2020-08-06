function load_api(src) {
    let script = document.createElement('script');
    script.src = src;
    document.head.append(script);
}
//load_api('static/js/defaultSet.js')

function average(nums) {
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
    static templateSetGraphBlock = document.getElementById('setGraphBlock')
    static focus
    static focusColor

    constructor(chart, dataset, param) {
        var self = this
        this.chart = chart
        this.dataset = dataset
        this.param = param
        this.data = []

        this.div = SettingGraph.templateSetGraphBlock.content.cloneNode(true).firstElementChild
        var setGrPanel = chart.block.querySelector('[class="settingsGraphPanel"]')
        setGrPanel.append(this.div)

        this.calculation = {
            'как есть': (func) => func(self.data),
            'осреднить за ч.': (func) => self.mapDate(1000 * 60 * 60, average, func),
            'осреднить за 3 ч.': (func) => self.mapDate(1000 * 60 * 60 * 3, average, func),
            'осреднить за сут.': (func) => self.mapDate(1000 * 60 * 60 * 24, average, func),
            'макс значения за сут': (func) => self.mapDate(1000 * 60 * 60 * 24, (array) => Math.max.apply(null, array), func),
            'мин значения за сут.': (func) => self.mapDate(1000 * 60 * 60 * 24, (array) => Math.min.apply(null, array), func),
        }

        createDownTownList(this.div.querySelector('[name="devices"]'), Object.keys(data_parameters), param.device, function(device) {
            param.device = device
            var parY = self.div.querySelector('[name="parametersY"]')
            var keys =  Object.keys(data_parameters[param.device])
            keys.shift()
            replaceDownTownList(parY, keys)
            parY.querySelector('.dropdown-menu').firstChild.onclick()
            var parX = self.div.querySelector('[name="parametersX"]')
            replaceDownTownList(parX, Object.keys(data_parameters[param.device]))
            parX.querySelector('.dropdown-menu').firstChild.onclick()
        })
        var keys =  Object.keys(data_parameters[param.device])
        createDownTownList(this.div.querySelector('[name="parametersX"]'), keys, param.x, function(p) {
            param.x = p
            self.updateGraph()   
        })
        keys.shift()
        createDownTownList(this.div.querySelector('[name="parametersY"]'), keys, param.y, function(p) {
            param.y = p
            self.updateGraph()
        })
        createDownTownList(this.div.querySelector('[name="calculation"]'), Object.keys(this.calculation), this.param.calc, function(p) {
            self.param.calc = p
            self.calculation[p](function(data) {
                console.log(data.length)
                self.dataset.data = data
                self.chart.chart.update()
            })
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

    mapDate(range, func, ready) {
        var self = this,
        data = [],
        x1 = this.data.map((x) => x.x),
        start = 0

        function addSlice(end) {
            if (end < x1.length) {
                var x = x1.slice(start, end)
                var y = data_parameters[self.param.device][self.param.y][1].slice(start, end)
                data.push({
                    x: average(x),
                    y: func(y),
                })
                start = end
                self.getDateRange(end, range, addSlice)
            } else
                ready(data)
        }

        self.getDateRange(start, range, addSlice)
    }

    getDateRange(startIndex, rangeTime, func) {
        var self = this
        function findTheClosest(arr, startIndex, base){
            var arrLen = arr.length;
            var theClosest = Infinity;
            var i, temp, index;

            for(i = startIndex; i < arrLen; i++) {
                temp = Math.abs(arr[i] - base);
                if(temp < theClosest){
                    theClosest = temp;
                    index = i;
                };
            };
            return index
        };
        getData(this.param.device, 'Date', function(date) {
            var endV = date[startIndex] + rangeTime
            var endIndex = findTheClosest(date, startIndex, endV) + 1
            func(endIndex)
        })
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
                        str += '; ' + tooltipItems.yLabel
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
                self.chart.chart.update()
            })
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

    constructor(options={
        name: 'Name',
        graph: [],
        param: [
        ],
        type: 'scatter',
    }) {
        var self = this

        this.block = Graph.templateGraphBlock.content.cloneNode(true).firstElementChild
        Graph.templateGraphBlock.before(this.block)
        this.block.getElementsByTagName('h1')[0].innerHTML = options.name
        this.options = options

        var ctx = this.block.getElementsByClassName('Chart')[0].getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: options.graph
            },
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
                        tension: 0, // disables bezier curves
                        borderDash: []
                    }
                },
                scales: {
                    xAxes: [{
                        ticks: {
                            userCallback: function(label, index, labels) {
                                var d = new Date(label)
                                var str = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
                                str += ' ' + d.getHours() + ':' + d.getMinutes()
                                return str;
                            }
                        }
                    }]
                },
                tooltips: {
                    displayColors: false,
                }
            },
        });

        this.settingGraph = []
        for (var i = options.graph.length - 1; i >= 0; i--)
            this.settingGraph.push(new SettingGraph(this, this.chart.data.datasets[i], options.param[i]))

        this.block.querySelector('[name="reser_zoom"]').onclick = function() {
            self.chart.resetZoom()
        }
        this.block.querySelector('[name="add_graph"]').onclick = function() {
            self.chart.data.datasets.push(Object.assign({}, createDefaultGraph.graph))
            var param = options.param[options.param.length - 1]
            if (options.param.length == 0)
                param = createDefaultGraph.param
            self.settingGraph.push(new SettingGraph(
                self,
                self.chart.data.datasets[self.chart.data.datasets.length - 1],
                param,
            ))
        }
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