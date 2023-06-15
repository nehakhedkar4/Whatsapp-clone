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
from django.contrib.auth.decorators import login_required

load_dotenv()

def generate_otp():
    return random.randrange(0000,9999)

def send_otp_phone(phone):

    otp = generate_otp()

    account_sid = os.getenv("TWILIO_ACCOUNT_SID")     
    auth_token = os.getenv("TWILIO_TOKEN")       

    try:
        user = MyUser.objects.get(phone=phone)
        client = Client(account_sid, auth_token)
        try:
            message = client.messages \
                            .create(
                                body=f"Your verification code is: {otp}",
                                from_= os.getenv("TWILIO_PHONE"),           
                                to= f'+91{phone}',
                                # to='+918758691652'
                            )
        except:
            pass
        
        user.created_at = timezone.now()
        user.otp = otp
        user.save()
        return True
    
    except MyUser.DoesNotExist:
        print("-=======================except")
        return False
    

# LOGIN 
def login(request):
    if request.method == 'POST':        
        phone = request.POST.get('phone')
        try:
            user = MyUser.objects.get(phone=phone)
            send_otp_phone(phone)   
            request.session['user'] = phone 
            return JsonResponse({'status' : 200})
        except MyUser.DoesNotExist:
            return JsonResponse({'msg' : "User Doesn't exists!", 'status' : 400}) 
    return render(request, 'login.html')

def logout(request):
    del request.session['user']
    return redirect('/')

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

    if request.method == 'POST':

        img = request.FILES.get('img')
        user_id = request.POST.get('user_id')
        
        if img and user_id:
            user = MyUser.objects.get(id=user_id)
            user.profile_picture = img
            # user.profile_picture.save(img.name, img)
            user.save()
            image_url = user.profile_picture.url
            return JsonResponse({'image_url' : image_url})

        return redirect('/chat/')

    if 'user' in request.session:

        print(type(request.session['user']),"====================================")

        users = MyUser.objects.all().order_by('-created_at')
        user = MyUser.objects.get(phone=request.session['user'])
        threads = Thread.objects.filter(first_user=14).prefetch_related('chat_messages').order_by('-created_at')
        return render(request,'chat.html',{'users' : users, 'user' : user, 'threads' : threads })
    else:
        return redirect('/')

print()
print()
threads = Thread.objects.filter(first_user=14).prefetch_related('chat_messages').order_by('-created_at')
print(threads)
for i in threads:
    print(i.chat_messages.all())
    for j in i.chat_messages.all():
        print(j.message)
       
# print(ChatMessage.objects.filter(user=14))
# for i in ChatMessage.objects.filter(user=14):
#     print(i)
print()
