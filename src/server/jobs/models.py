from __future__ import unicode_literals

from django.db import models


class Job(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(null=True, blank=True)
