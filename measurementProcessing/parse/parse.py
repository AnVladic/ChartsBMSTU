import json
from datetime import datetime


"""
####################
    LOG
####################
"""
with open('measurementProcessing/parse/log.txt', encoding='utf-8') as f:
    dataset = json.load(f)


def get_dataset(name):
    return map(
              lambda x: dataset[x]['data'],
              filter(lambda x: dataset[x]['uName'] == name, dataset)
    )


def get_date(name):
    return map(
              lambda x: dataset[x]['Date'],
              filter(lambda x: dataset[x]['uName'] == name, dataset)
    )


def remove_keys(ls, key):
    if key in ls:
        ls.remove(key)


name_parameters = {}
for name_d in set(map(lambda x: dataset[x]['uName'], dataset)):
    ds = tuple(get_dataset(name_d))
    keys = []
    for d in ds:
        for k in d:
            if k not in keys:
                keys.append(k)
    remove_keys(keys, 'system_MAC')
    remove_keys(keys, 'system_Version')
    name_parameters[name_d] = keys


"""
####################
    WEATHER
####################
"""
with open('measurementProcessing/parse/weather.txt', encoding='utf-8') as f:
    weather = json.load(f)

weather_params = []
keys = list(weather.keys())[1:]
for name in keys[:len(keys) // 2]:
    weather_params.append(name[:-4])
del keys
for name in name_parameters:
    name_parameters[name].extend(weather_params)


def get_weather(device, param):
    start_day = int(weather['day'][0])
    # for k in weather:
    #    weather[k] = weather[k][:21]
    #    weather[k][1:] = weather[k][:-1]
    # weather['day'][0] = 11
    # with open('measurementProcessing/parse/weather.txt', 'w', encoding='utf-8') as f:
    #     f.write(str(json.dumps(weather)))

    def paste_weather(x):
        date = datetime.strptime(x, '%Y-%m-%d %H:%M:%S')
        day = '_day'
        if date.hour < 12:
            day = '_night'
        return weather[param + day][date.day - start_day]

    return map(paste_weather, get_date(device))


get_weather('TEST', 'temp')
