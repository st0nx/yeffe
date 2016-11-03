from tastypie.authorization import Authorization
from tastypie.resources import ModelResource

from models import Job


class JobResource(ModelResource):
    """
    API Facet
    """

    class Meta:
        queryset = Job.objects.all()
        resource_name = 'job'
        # authorization = Authorization()

    def get_object_list(self, request):
        object_list = super(JobResource, self).get_object_list(request)
        return object_list