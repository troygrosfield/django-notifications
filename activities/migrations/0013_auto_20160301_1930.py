# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-03-01 19:30
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('activities', '0012_auto_20160301_1829'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='activity',
            name='replies',
        ),
        migrations.AlterField(
            model_name='activityreply',
            name='activity',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='replies', to='activities.Activity'),
        ),
    ]
