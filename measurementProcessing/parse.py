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


name_parameters = {}
for name_d in set(map(lambda x: dataset[x]['uName'], dataset)):
    ds = tuple(get_dataset(name_d))
    keys = []
    for d in ds:
        for k in d:
            if k not in keys:
                keys.append(k)
    if 'system_MAC' in keys:
        keys.remove('system_MAC')
    name_parameters[name_d] = keys
