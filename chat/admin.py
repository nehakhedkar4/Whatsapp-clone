from django.contrib import admin
from .models import *

@admin.register(MyUser)
class MyUserAdmin(admin.ModelAdmin):
    list_display = ('id','username','phone')
