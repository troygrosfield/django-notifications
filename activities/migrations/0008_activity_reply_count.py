# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-02-21 18:49
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('activities', '0007_auto_20160220_0103'),
    ]

    operations = [
        migrations.AddField(
            model_name='activity',
            name='reply_count',
            field=models.IntegerField(default=0),
        ),
    ]