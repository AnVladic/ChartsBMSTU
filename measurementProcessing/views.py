from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from measurementProcessing import parse


def index(request):
    context = {
        'name_parameters': parse.name_parameters
    }
    return render(request, 'index.html', context)


def dataset(request):
    if request.POST:
        device_set = parse.get_dataset(request.POST['device'])
        param = request.POST['param']

        data = list(map(lambda x: x[param], device_set))
        return JsonResponse(data, safe=False)
    return HttpResponse(0)
