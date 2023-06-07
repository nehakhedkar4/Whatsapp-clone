from django.shortcuts import render,redirect
import random
from twilio.rest import Client
import os
from dotenv import load_dotenv
from .models import *
from django.utils import timezone
from django.contrib import messages
import datetime
from django.http import JsonResponse

load_dotenv()

def generate_otp():
    return random.randrange(0000,9999)

def send_otp_phone(phone):

    otp = generate_otp()

    account_sid = os.getenv("TWILIO_ACCOUNT_SID")     
    auth_token = os.getenv("TWILIO_TOKEN")       

    client = Client(account_sid, auth_token)
    message = client.messages \
                    .create(
                        body=f"Your verification code is: {otp}",
                        from_= os.getenv("TWILIO_PHONE"),           
                        to= f'+91{phone}',
                        # to='+918758691652'
                    )
    user = MyUser.objects.get(phone=phone)
    user.created_at = timezone.now()
    user.otp = otp
    user.save()
    return phone

# LOGIN 
def login(request):
    if request.method == 'POST':
        phone = request.POST.get('phone')
        send_otp_phone(phone)
    return render(request, 'login.html')

def register(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        phone = request.POST.get('phone')
        if MyUser.objects.filter(phone=phone).exists():
            return JsonResponse({'msg' : "User already exists!"})
        else:
            MyUser(username=username,phone=phone,otp=generate_otp()).save()
            send_otp_phone(phone)
            
    return render(request,'register.html')

def verifyOtp(request):
    otp = request.POST.get('otp')
    user = MyUser.objects.get(phone=request.POST.get('phone'))
    expired_OTP_time = user.created_at + datetime.timedelta(minutes=1)

    if timezone.now() > expired_OTP_time:
        user.otp = ''
        user.is_verified = False
        user.save()
        return JsonResponse({'msg' : 'OTP has been expired!'})
    else:
        if user.otp == otp:
            user.is_verified = True
            user.save()
            return JsonResponse({'msg' : 'OTP has been verified!'}) 
        else:
            return JsonResponse({'msg' : 'Invalid OTP!'}) 

def chatfunct(request):
    return render(request,'chat.html')
