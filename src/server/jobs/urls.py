from django.conf.urls import include, url

from .api import JobResource

entry_resource = JobResource()


urlpatterns = [
    url(r'^', include(entry_resource.urls))
]
