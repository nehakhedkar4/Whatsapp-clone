console.log("messages.js loaded")

let input_message = document.getElementById('input-message')
var first_user = document.getElementById('first_user').value
var second_user;
var ws;

var userCards = document.querySelectorAll('#user-card')

function establish_websocket_connection(){

        var msg_body = document.querySelector('.message-body')

        // Websocket connection
        ws = new WebSocket('ws://' + window.location.host + '/ws/async/' + first_user + '/' + second_user) 
        console.log("ws: ",ws)

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


            if (data.sent_by === first_user){
                
                var message_ele = `<div class="d-flex flex-column align-items-end mt-2">
                                        <span class="p-2 px-3 m-1" style="border-radius: 17px; background-color: #C5E6A1;">${data.message} </span>
                                    </div>`

                msg_body.innerHTML += message_ele
            } else {

                var message_ele = `<div class="d-flex flex-column align-items-start mt-2">
                                        <span class="bg-white p-2 px-3 mt-1" style="border-radius: 17px;">${data.message} </span>
                                    </div>`

                msg_body.innerHTML += message_ele
            }

        }
}

userCards.forEach(function(card){
    card.addEventListener('click', function (){

        second_user = card.querySelector('.second-user').value
        
        // TO DISPLAY CONVERSION
        $.ajax({
            url: '/whatsapp/',
            type: 'GET',
            data: {
                'action' : 'start-conversion',
                'second_user' : second_user,
            },
            success: function(response){
                console.log("success: ",response)
                var secondUser = JSON.parse(response.second_user)[0];
                var second_user = secondUser.fields
                console.log(second_user,"===========>>.secondUser",response.second_user_id)

                // console.log(document.getElementById('second_user_id'))
                
                // document.getElementById('second_user_id').textContent = response.second_user_id
                // document.getElementById('second_user_id_input').value = response.second_user_id;
                // console.log(document.getElementById('second_user_id'))

                document.getElementById('default-block').classList.add('d-none')
                document.getElementById('chat-conversion-block').classList.remove('d-none')

                document.getElementById('second_user_username').textContent = second_user.username

                var img = document.getElementById('second_user_ImgProfile')
                var customImg = document.getElementById('second_user_profile_custom')
                if (second_user.profile_picture !== ""){
                    // console.log(second_user.profile_picture)
                    img.setAttribute('src', '/media/' + second_user.profile_picture)
                    img.style.display = 'block'
                    customImg.style.display = 'none'
                } else {
                    document.getElementById('customProfile').textContent = second_user.username[0]
                    customImg.style.display = 'block'
                    img.style.display = 'none'
                }
                establish_websocket_connection()

            },
            error: function(error){
                console.log("error: ", error)
            }
        })

    })
})

function msg_send(){
    console.log("click to send")
    console.log("first_user: ",first_user)
    console.log("second_user: ",second_user)
    
    ws.send(JSON.stringify({
        'message' : input_message.value,
        'sent_by' : first_user,
        'send_to' : second_user,
    }))
    input_message.value = ""
    
    console.log("data: ", data)
}


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