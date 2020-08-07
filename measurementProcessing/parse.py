import json

with open('measurementProcessing/log.txt', encoding='utf-8') as f:
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
    # remove_keys(keys, 'DS18B20_temp')
    # remove_keys(keys, 'BME280_pressure')
    # remove_keys(keys, 'BME280_humidity')
    # remove_keys(keys, 'BME280_temp')
    # remove_keys(keys, 'BH1750_blink')
    # remove_keys(keys, 'BH1750_blinkmax')
    # remove_keys(keys, 'BH1750_blinkmin')
    # remove_keys(keys, 'BH1750_lux')
    name_parameters[name_d] = keys
