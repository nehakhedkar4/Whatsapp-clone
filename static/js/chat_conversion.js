console.log("chat_conversion.js loaded")

var input_message = document.getElementById('input-message')
var first_user = document.getElementById('first_user').value
var second_user = document.getElementById('second-user').value
var msg_body = document.querySelector('.message-body')
console.log("first_user: ",first_user, "second_user: ",second_user)

// WEBSOCKET CONNECTION
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

function search_user(){
    var search_user = document.getElementById('search_user').value
    console.log(search_user,"=============================search_user")
    $.ajax({
        url: '/chat/' + search_user,
        type: 'GET',
        success: function(data){
            console.log("success",data)
            if (data.status === 200) {
                window.location.href = '/chat/'+ data.thread
            } else {
                console.log(data.error)
                alert(data.error)
            }
        },
        errro: function(error){
            console.log("ERROR: ",error)
        }
    })
}

function verifyOtp(value){
    console.log(value, "clicked to verify otp")
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