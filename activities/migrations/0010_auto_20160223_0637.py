# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-02-23 06:37
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('activities', '0009_auto_20160222_0605'),
    ]

    operations = [
        migrations.AlterField(
            model_name='activity',
            name='privacy',
            field=models.CharField(choices=[('PUBLIC', 'Public - everyone can see'), ('PRIVATE', 'Private - only created user can see'), ('CUSTOM', 'Custom - users must be granted visibility')], default='PRIVATE', max_length=20),
        ),
    ]