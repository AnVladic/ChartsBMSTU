function getData(device, param, func) {
    if (!(device in data_parameters)) {
        console.log(device, 'was not find')
        return
    }
    if (!(param in data_parameters[device]))  {
        console.log(param, 'was not find')
        return
    }


    if (data_parameters[device][param][1].length == 0) {
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
                    data_parameters[device][param][1] = response
                    for (var i = 0; i < data_parameters[device][param][0].length; i++)
                        data_parameters[device][param][0][i](response)
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


function buildData(deviceX, paramX, deviceY, paramY, func) {
    var firstReady = false

    function ready() {
        var data = []
        if (firstReady) {
            for (var i = 0; i < data_parameters[deviceX][paramX][1].length; i++)
                data.push({
                    x: data_parameters[deviceX][paramX][1][i],
                    y: data_parameters[deviceY][paramY][1][i],
                })
            data = uniq(data)
            data.sort(function(a, b) {
                return a.x - b.x
            })
            func(data)
        } else firstReady = true
    }

    getData(deviceX, paramX, ready)
    getData(deviceY, paramY, ready)
}