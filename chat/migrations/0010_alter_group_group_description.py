# Generated by Django 4.1.5 on 2023-06-29 14:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0009_group_group_description'),
    ]

    operations = [
        migrations.AlterField(
            model_name='group',
            name='group_description',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
