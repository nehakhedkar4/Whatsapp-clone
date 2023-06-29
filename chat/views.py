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
import json

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

from django.core import serializers
def whatsappFun(request):

    if 'user' in request.session:
        users = MyUser.objects.all()
        logged_in_user = MyUser.objects.get(phone=request.session['user'])

        if request.GET.get('action') == 'start-conversion':
            print(">>>>>>>>>>>>>.....ajax>>>>>>>>>>... start-conversion")

            second_user = MyUser.objects.get(id=int(request.GET.get('second_user')))

            second_user_j = serializers.serialize('json' ,[second_user])

            return JsonResponse({
                'second_user' : second_user_j,
                'second_user_id' : second_user.id
            })

        threads = Thread.objects.filter(first_user=logged_in_user.id).prefetch_related('chat_messages').order_by('-created_at')

        return render(request, 'messages.html',{
            'users': users,
            'logged_in_user': logged_in_user,
            'threads': threads,
        })
    else:
        redirect('/')


def newFun(request, id=None, username=None):

    if request.method == 'POST':

        if request.POST.get('action') == 'create_group':

            member_ids = json.loads(request.POST.get('memberIDs'))
            group_name = request.POST.get('grpName')
            group_icon = request.FILES.get('img')

            if group_icon != None:
                group = Group.objects.create(group_name=group_name,group_icon=group_icon)
            else:
                group = Group.objects.create(group_name=group_name)
            
            group.group_members.add(MyUser.objects.get(phone=request.session['user']))
            for i in member_ids:
                group.group_members.add(MyUser.objects.get(id=i))
            
            return  JsonResponse({'status' : 200})

        if request.POST.get('action') == 'Update-Group-Icon':
            group_img = request.FILES.get('group_icon')
            group_id = request.POST.get('group_id')
            group_inst = Group.objects.get(id=int(group_id))
            group_inst.group_icon = group_img
            group_inst.save()
            icon_url = group_inst.group_icon.url
            return JsonResponse({
                'status' : 200,
                'image_url' : icon_url
                })
        
        if request.POST.get('action') == 'Rename-Group-Name':
            gr_inst = Group.objects.get(id=int(request.POST.get('group_id')))
            gr_inst.group_name = request.POST.get('new_grp_name')
            gr_inst.save()
            group_name_new = gr_inst.group_name
            return JsonResponse({
                'status' : 200,
                'group_name' : group_name_new
            })
        
        if request.POST.get('action') == 'Update-Group-Description':
            gr_inst = Group.objects.get(id=int(request.POST.get('group_id')))
            gr_inst.group_description = request.POST.get('description')
            gr_inst.save()
            group_description_new = gr_inst.group_description
            return JsonResponse({
                'status' : 200,
                'group_description' : group_description_new
            })

        if request.POST.get('action') == 'add-members-to-group':
            members_list = json.loads(request.POST.get('add_members'))
            grp = Group.objects.get(id=int(request.POST.get('group_id')))
            for member in members_list:
                grp.group_members.add(MyUser.objects.get(id=member))
            return JsonResponse({
                'status' : 200
            })

        if request.POST.get('action') == 'Exit-From-Group':
            grp = Group.objects.get(id=int(request.POST.get('group_id')))
            grp.group_members.remove(MyUser.objects.get(id=int(request.POST.get('user'))))
            return JsonResponse({
                'status' : 200
            })       

        if request.POST.get('action') == 'Make-Group-Admin':
            group_id = int(request.POST.get('group_id'))
            member_id = int(request.POST.get('member_id'))
            group = Group.objects.get(id=group_id)
            member = MyUser.objects.get(id=member_id)
            group.group_admin.add(member)
            return JsonResponse({
                'status': 200
            })
        
        if request.POST.get('action') == 'Remove-Member-From-Group':
            group_id = int(request.POST.get('group_id'))
            member_id = int(request.POST.get('member_id'))
            group = Group.objects.get(id=group_id)
            member = MyUser.objects.get(id=member_id)
            group.group_members.remove(member)
            return JsonResponse({
                'status': 200
            })

        img = request.FILES.get('img')
        user_id = request.POST.get('user_id')
        
        if img and user_id:
            user = MyUser.objects.get(id=user_id)
            user.profile_picture = img
            user.save()
            image_url = user.profile_picture.url
            return JsonResponse({'image_url' : image_url})

        return redirect('/chat/')

    if 'user' in request.session:
        logged_in_user = MyUser.objects.get(phone=request.session['user'])
        users = Thread.objects.filter(Q(first_user=logged_in_user) | Q(second_user=logged_in_user))
    # else:
    #     return redirect('/')
    
    all_users = MyUser.objects.all().exclude(id=logged_in_user.id)

    groups = Group.objects.filter(group_members=logged_in_user)

    chat_user = ''

    if username != None and '/user' in request.path:
        try: 
            second_user = MyUser.objects.get(username=username)
            chat_user = second_user
            thread = Thread.objects.create(first_user=logged_in_user, second_user=second_user)
            id = thread.id
            return JsonResponse({
                'status': 200,
                'thread':id
                })
        except:
            return JsonResponse({
                'status': 400,
                'error': "User Doesn't exists!"
                })

    
    if id != None and '/user' in request.path:
        print("Thread id: ", id)

        chat_messages = ChatMessage.objects.filter(thread=id)

        if chat_messages:
            for i in chat_messages:
                if i.user != logged_in_user:
                    chat_user = i.user
                else:
                    thread_in = Thread.objects.get(id=id)
                    if thread_in.first_user == logged_in_user:
                        chat_user = thread_in.second_user
                    else:
                        chat_user = thread_in.first_user

        else :
            thread_in = Thread.objects.get(id=id)
            if thread_in.first_user == logged_in_user:
                chat_user = thread_in.second_user
            else:
                chat_user = thread_in.first_user

        return render(request, 'chat_conversion.html', {
            'logged_in_user': logged_in_user,
            'conversation': users,
            'chat_messages' : chat_messages,
            'chat_user': chat_user,
            'all_users' : all_users,
            'groups' : groups,
        })   

    if id != None and '/group' in request.path:
        group_obj = Group.objects.get(id=id)
        print('group_obj: ', group_obj.group_description)

        group_messages = GroupChat.objects.filter(group_name=group_obj)

        users_not_in_group = MyUser.objects.exclude(groups=group_obj)

        return render(request, 'chat_conversion.html', {
            'group_obj' : group_obj,
            'logged_in_user': logged_in_user,
            'conversation': users,
            'all_users' : all_users,
            'groups' : groups,
            'group_messages' : group_messages,
            'users_not_in_group' : users_not_in_group,
        })


    return render(request, 'chat_conversion.html', {
        'logged_in_user': logged_in_user,
        'conversation': users,
        'all_users' : all_users,
        'groups' : groups,
    })


def chatfunct(request):

    if request.method == 'GET':

        if 'user' in request.session:

            users = MyUser.objects.all().order_by('-created_at')
            user = MyUser.objects.get(phone=request.session['user'])
            threads = Thread.objects.filter(first_user=14).prefetch_related('chat_messages').order_by('-created_at')


            neh = "nnnnnnnnnnnnnnnnnnnnn"
            if request.GET.get('action') == 'chat_conversion':

                print("============>>>>>> AJAX called chat_conversion")
                print()
                print("user1_id: ",request.GET.get('user1_id'), type(request.GET.get('user1_id')))
                print("user2_id: ",request.GET.get('user2_id'), type(request.GET.get('user2_id')))
                print()
                second_user = MyUser.objects.get(id=int(request.GET.get('user2_id')))

                context = {
                    'users': users,
                    'user': user,
                    'threads': threads,
                    'second_user': second_user.id
                }

                return render(request, 'chat.html', context)
            
            
            print("after render=========")

            context = {
                'users': users,
                'user': user,
                # 'threads': threads,
            }

            return render(request, 'chat.html', context)
        else:
            return redirect('/')
    



        # user2_id = int(request.GET.get('user2_id'))
        # user2 = MyUser.objects.get(id=user2_id)

        # print(user2.id,"=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>..user2.id")
        # print("AJAX for user2 called------------------------------------------------")

        # second_user = user2.id

        # # print(request.GET.get('user2_id'),"=====================================request.GET.get('user2_id')")

        # # request.session['secondUser'] = int(request.GET.get('user2_id'))

        # # print(request.session.get('secondUser') ,"=========>>>>>>>>get user2 session id")

        # # return JsonResponse({'msg' : 'success'})

        # return render(request, 'chat.html', {
        #     'second_user' : second_user
        # })

    if request.method == 'POST':

        # if request.POST.get('action') == 'chat_conversion':

        #     print("============>>>>>> AJAX called chat_conversion")

        #     print()
        #     print("user1_id: ",request.POST.get('user1_id'))
        #     print("user2_id: ",request.POST.get('user2_id'))
        #     print()
        #     return render(request, 'chat.html', {
        #         'neha' : 'neha mmmmmmmmmm'
        #     })

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

