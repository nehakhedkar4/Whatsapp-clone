console.log("chat.js loaded")

var userCards = document.querySelectorAll("#user-card")
userCards.forEach(function(card){
    card.addEventListener('click', function (){

        // Hide the default block
        document.querySelector('.col-8').classList.add('d-none');
        // Show the selected user block
        document.getElementById('selectedUserBlock').classList.remove('d-none');

        var username = card.querySelector('.card-title').textContent
        var profile_img = card.querySelector('.profile_img')

        document.getElementById('usernameReceiver').textContent = username

        if (profile_img.tagName === 'IMG') {
            console.log("if block") 
            var imgProfile_Receiver = document.getElementById('imgProfileR')
            imgProfile_Receiver.setAttribute('src', profile_img.getAttribute('src'))
            imgProfile_Receiver.style.display = 'block'
            document.getElementById('profileReceiver').style.display = 'none'
        } else {
            console.log("else block")
            document.getElementById('customProfile').textContent = username[0]
            document.getElementById('profileReceiver').style.display = 'block'
            document.getElementById('imgProfileR').style.display = 'none' 
        }
    })
})

// Websocket
let input_message = document.getElementById('input-message')

var ws = 'ws://' + window.location.host + '/ws/async/'
console.log(ws)



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