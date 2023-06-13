from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from django.core.validators import RegexValidator
from django.db.models import F,Q

class MyUserManager(BaseUserManager):
    def create_user(self, phone=None, password=None, username=None):
       
        user = self.model(
            phone=phone,
            username=username,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None):
        user = self.create_user(
            password=password,
            phone=phone,
        )
        user.is_admin = True
        user.save(using=self._db)
        return user

class MyUser(AbstractBaseUser):
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$', message="Phone number must be entered in the format: '+999999999'. Up to 10 digits allowed.")
    phone = models.CharField(validators=[phone_regex], max_length=10, unique=True, blank=True, null=True) 
    username = models.CharField(max_length=255)
    otp = models.CharField(max_length=6,blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    profile_picture = models.ImageField(upload_to='profile_picture',null=True,blank=True)

    is_admin = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = MyUserManager()

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.phone
    

# class PrivateChat(models.Model):
#     first_user = models.ForeignKey(MyUser, on_delete=models.CASCADE)
#     second_user = models.ForeignKey(MyUser, on_delete=models.CASCADE)
#     messages = models.TextField()
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         unique_together = ['first_user','seocnd_user']
#         contarints = [models.CheckConstraint(check=Q(first_user__id__lt=F('second_user__id')), name='unique_user_pair'),]

# class Messages(models.Model):
#     room = models.ForeignKey(PrivateChat, on_delete=models.CASCADE)
#     messages = models.TextField()
#     sender = models.ForeignKey(MyUser, on_delete=models.CASCADE)
#     receiver = models.ForeignKey(MyUser, on_delete=models.CASCADE)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

    # class Meta:
    #     constraints = [
    #         models.CheckConstraint(
    #             check=Q(sender=F('privatechat__first_user') & Q(receiver=F('privatechat__second_user')))
    #                 | Q(sender=F('privatechat__second_user') & Q(receiver=F('privatechat__first_user'))), 
    #             name='valid_sender_and_receiver'
    #         ),
    #     ]
    



# class Chat(models.Model):
#     user = models.ForeignKey(MyUser, on_delete=models.CASCADE)
#     message = models.CharField(max_length=255)
#     profile_picture = models.ImageField(upload_to='profile_picture')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

# class Group(models.Model):
#     group_name = models.CharField(max_length=255)
