import json

with open('measurementProcessing/log.txt', encoding='utf-8') as f:
    dataset = json.load(f)


def get_dataset(name):
    return map(
              lambda x: dataset[x]['data'],
              filter(lambda x: dataset[x]['uName'] == name, dataset)
    )


name_parameters = {}
for name_d in set(map(lambda x: dataset[x]['uName'], dataset)):
    ds = tuple(get_dataset(name_d))
    name_parameters[name_d] = list(ds[0].keys())

