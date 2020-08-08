from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from measurementProcessing.parse import parse


def index(request):
    context = {
        'name_parameters': parse.name_parameters
    }
    return render(request, 'index.html', context)


def dataset(request):
    if request.POST:
        param = request.POST['param']
        device = request.POST['device']

        if param == 'Date':
            return JsonResponse(list(parse.get_date(device)), safe=False)
        if param in parse.weather_params:
            return JsonResponse(list(parse.get_weather(device, param)), safe=False)

        device_set = parse.get_dataset(device)
        data = list(map(lambda x: x[param] if param in x else None, device_set))
        return JsonResponse(data, safe=False)
    return HttpResponse(0)
