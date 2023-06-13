console.log("chat.js loaded")

var user1_id = document.getElementById('user1_id').value
let input_message = document.getElementById('input-message')
console.log(user1_id,"=============user_1_id")

var data;
var ws;
var user2_id;

var userCards = document.querySelectorAll("#user-card")
userCards.forEach(function(card){
    card.addEventListener('click', function (){

        console.log("click to user card")

        user2_id = card.querySelector('.receiver-id').value
        console.log(user2_id,"=============user_2_id")

        // Hide the default block
        document.querySelector('.col-8').classList.add('d-none');
        // Show the selected user block
        document.getElementById('selectedUserBlock').classList.remove('d-none');

        var username = card.querySelector('.card-title').textContent
        var profile_img = card.querySelector('.profile_img')

        document.getElementById('usernameReceiver').textContent = username

        if (profile_img.tagName === 'IMG') {
            var imgProfile_Receiver = document.getElementById('imgProfileR')
            imgProfile_Receiver.setAttribute('src', profile_img.getAttribute('src'))
            imgProfile_Receiver.style.display = 'block'
            document.getElementById('profileReceiver').style.display = 'none'
        } else {
            document.getElementById('customProfile').textContent = username[0]
            document.getElementById('profileReceiver').style.display = 'block'
            document.getElementById('imgProfileR').style.display = 'none' 
        }


        // Websocket connection
        ws = new WebSocket('ws://' + window.location.host + '/ws/async/' + user1_id + '/' + user2_id) 
        // console.log(ws,":ws")

        ws.onopen = function(){
            console.log("Connected")
        }
        
        ws.onerror = function(e){
            console.log("Error :",e)
        }
        
        ws.onclose = function(){
            console.log("Disconnected")
        }
        
        ws.onmessage = function(e){
            console.log("Message from Server: ",e.data)            
        
            data = JSON.parse(e.data)
            console.log("done")

            var msg_body = document.querySelector('.message-body')

            if (data.sent_by === user1_id){
                // var msg_body_sent_by = document.querySelector('.message-container_sender')
                // var msg_body_send_to = document.getElementsByClassName('message-container_receiver')
                
                var message_ele = `<div class="d-flex flex-column align-items-end mt-2">
                                        <span class="p-2 px-3 m-1" style="border-radius: 17px; background-color: #C5E6A1;">${data.message} </span>
                                    <div/>`

                // var message_ele = `<span class="p-2 px-3 m-1" style="border-radius: 17px; background-color: #C5E6A1;">${data.message} </span>`
                msg_body.innerHTML += message_ele
            } else {

                var message_ele = `<div class="d-flex flex-column align-items-start mt-2">
                                        <span class="bg-white p-2 px-3 mt-1" style="border-radius: 17px;">${data.message} </span>
                                    <div/>`

                // var message_ele = `<span class="p-2 px-3 m-1" style="border-radius: 17px; background-color: #C5E6A1;">${data.message} </span>`
                msg_body.innerHTML += message_ele

                // <div class="d-flex flex-column align-items-start message-container_receiver mt-2">

                // var msg_body_sent_by = document.querySelector('.message-container_sender')
                // var msg_body_send_to = document.querySelector('.message-container_receiver')
                // var message_ele = `<span class="bg-white p-2 px-3 mt-1" style="border-radius: 17px;">${data.message} </span>`
                // msg_body_send_to.innerHTML += message_ele
            }

        }
    })
})
// ws.onopen = function(){
//     console.log("Connected")
// }

// ws.onerror = function(e){
//     console.log("Error :",e)
// }

// ws.onclose = function(){
//     console.log("Disconnected")
// }

// ws.onmessage = function(e){
//     console.log("Message from Server: ",e.data)

//     data = JSON.parse(e.data)
// }

function msg_send(){
    console.log("click to send")
    
    ws.send(JSON.stringify({
        'message' : input_message.value,
        'sent_by' : user1_id
    }))
    input_message.value = ""
    
    console.log("data: ", data)
}

// ws.onmessage = function(e){
//     console.log("Message from Server: ",e.data)

//     var data = JSON.parse(e.data)

//     // var msg_body_sent_by = document.querySelector('.message-container_sender')
//     // var msg_body_send_to = document.getElementsByClassName('message-container_receiver')
//     // // console.log(msg_body_sent_by)
//     // var message_ele = `<span class="p-2 px-3" style="border-radius: 17px; background-color: #C5E6A1;">${data.message} </span>`
//     // msg_body_sent_by.innerHTML += message_ele
//     // console.log(msg_body_sent_by.getAttribute('chat_id'))

//     // var message_ele = document.createElement('span');
//     // message_ele.classList.add('p-2', 'px-3');
//     // message_ele.style.borderRadius = '17px';
//     // message_ele.style.backgroundColor = '#C5E6A1';
//     // message_ele.textContent = data.message;
//     // msg_body_sent_by.appendChild(message_ele);

//     // msg_body_sent_by.appendChild(message_ele)

//     // if (msg_body_sent_by.getAttribute('chat_id') === user) {
//     //     console.log("if block")
//     // } else {
//     //     console.log("else")
//     // }


//     // console.log(document.getElementById('msg_content'),"===================msg_content",e.data)
//     // console.log(data.message,"=============data")
//     // document.getElementById("msg_content").textContent = data.message
// }



function verifyOtp(value){
    console.log(value)
    var phone = document.getElementById("phone").value
    var otp = document.getElementById("otp").value
    $.ajax({
        url: '/verifyOtp/',
        type: 'POST',
        data: {
            'otp' : otp,
            'phone': phone,
            csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val(),
        },
        success: function(response){
            if (response.msg === 'OTP has been expired!' || response.msg === 'Invalid OTP!'){
                var msgblock = document.getElementById("msg")
                var msg = document.createElement('h5')
                msg.textContent = response.msg
                msgblock.appendChild(msg)
                document.getElementById("msg").style.display = 'block'
            } else {
                if (value === 'login'){
                    window.location.href = '/chat'
                } else {
                    window.location.href = '/'
                }
            }
        },
        error: function(error){
            console.log("error: ",error)
        }
    })
}

function changeImage(value){
    console.log(value,"========>>>>>>>>>.value------------onchnge")
    var imgChange = document.getElementById("profileIMG").files[0]
    var formdata = new FormData();
    formdata.append('img', imgChange)
    formdata.append('user_id', value)
    $.ajax({
        url: '/chat/',
        type: 'POST',
        data: formdata,
        processData: false,
        contentType: false,
        headers: {
            'X-CSRFToken': $('input[name=csrfmiddlewaretoken]').val() 
          },
        success: function(response){
            console.log("success",response)
            document.getElementById("imgchange").src = response.image_url
        },
        error: function(error){
            console.log("error:  ",error)
        }

    })
}