function getData(device, param, func) {
    if (!(device in data_parameters)) {
        console.log(device, 'was not found')
        return
    }
    if (!(param in data_parameters[device]))  {
        console.log(param, 'was not found')
        return
    }


    if ($.isEmptyObject(data_parameters[device][param][1])) {
        data_parameters[device][param][0].push(func)
        if (data_parameters[device][param][0].length == 1)
            $.ajax({
                url: '/dataset',
                type: 'POST',
                data: {
                    'device': device,
                    'param': param,
                },
                success: function(response) {
                    if (param == 'Date')
                        data_parameters[device][param][1] = response.map((x) => Date.parse(x))
                    else 
                        data_parameters[device][param][1] = response.map((x) => parseFloat(x))
                    for (var i = 0; i < data_parameters[device][param][0].length; i++)
                        data_parameters[device][param][0][i](data_parameters[device][param][1])
                    delete data_parameters[device][param][0]
                }
            })
    } else func(data_parameters[device][param][1])
}


uniq = function(xs) {
    var seen = {};
    return xs.filter(function(x) {
        var key = JSON.stringify(x);
        return !(key in seen) && (seen[key] = x);
    });
}

function getTwoData(deviceX, paramX, deviceY, paramY, func) {
    var firstReady = false

    function ready() {
        if (firstReady) {
            func(data_parameters[deviceX][paramX][1], data_parameters[deviceY][paramY][1])            
        } else firstReady = true
    }

    getData(deviceX, paramX, ready)
    getData(deviceY, paramY, ready)
}

function buildData(deviceX, paramX, deviceY, paramY, func) {
    var data = []
    getTwoData(deviceX, paramX, deviceY, paramY, function(x, y) {
        for (var i = 0; i < x.length; i++)
            data.push({
                x: x[i],
                y: y[i],
            })
        data = uniq(data)
        data.sort(function(a, b) {
            return a.x - b.x
        })
        func(data)
    })
}
