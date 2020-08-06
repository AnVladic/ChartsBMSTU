var defaultGraph = [
    {
        name: 'First',
        graph: [
            {
                type: 'bar',
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
                calc: 'осреднить за ч.',
                y: 'color_red',
                x: 'Date',
            }
        ],
        //type: 'scatter',
    },
    {
        name: 'Second',
        graph: [
            {
                type: 'scatter',
                label: 'My Second dataset',
                borderColor: '#9d94ff',
                backgroundColor: 'transparent',
                showLine: true,
                pointBorderColor: 'transparent',
                pointBackgroundColor: 'transparent',
                lineTension: 0
            },
            {
                type: 'scatter',
                label: 'My Third dataset',
                borderColor: '#2eff32',
                backgroundColor: 'transparent',
                showLine: true,
                pointBorderColor: 'transparent',
                pointBackgroundColor: 'transparent',
                lineTension: 0
            },
        ],
        param: [
            {
                device: 'TEST',
                y: 'dallas_temp2',
                x: 'dallas_temp1',
                calc: 'осреднить за ч.',
            },
            {
                device: 'TEST',
                y: 'system_RSSI',
                x: 'dallas_temp1',
                calc: 'осреднить за ч.',
            }
        ],
        type: 'scatter',
    }
]

var createDefaultGraph = {
    graph: {
        label: 'name graph',
        borderColor: '#faa',
        backgroundColor: 'transparent',
        showLine: true,
        pointBorderColor: 'transparent',
        pointBackgroundColor: 'transparent',
        lineTension: 0
    },
    param: {
        device: 'TEST',
        y: 'dallas_temp1',
        x: 'dallas_temp1',
        calc: 'как есть',
    }
}