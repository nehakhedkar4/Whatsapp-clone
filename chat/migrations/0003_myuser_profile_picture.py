# Generated by Django 4.2.2 on 2023-06-08 12:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0002_remove_myuser_is_active'),
    ]

    operations = [
        migrations.AddField(
            model_name='myuser',
            name='profile_picture',
            field=models.ImageField(null=True, upload_to='profile_picture'),
        ),
    ]