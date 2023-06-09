console.log("chat.js loaded")

var userCards = document.querySelectorAll("#user-card")
console.log(userCards,"======>>.user")
userCards.forEach(function(card){
    console.log(card,"=>>>carddd")
    card.addEventListener('click', function (){
        var username = card.querySelector('.card-title').textContent
        var profile_img = card.querySelector('.profile_img')
        console.log(username,"==========================username")
        console.log(profile_img,"==========================profile_img",profile_img.tagName, username[0])

        var selectedUserBlock = document.getElementById("selectedUserBlock")
        selectedUserBlock.querySelector("#usernameR").textContent = username
        console.log(selectedUserBlock.querySelector("#profileReceiver"),"MMMMMMMMMMMM")

        if (profile_img.tagName === 'IMG'){
           console.log( profile_img.getAttribute('src'))
           selectedUserBlock.querySelector('#imgProfileR').setAttribute('src', profile_img.getAttribute('src'))
           selectedUserBlock.querySelector('#imgProfileR').style.display = 'block'
        } else {
            var p = selectedUserBlock.querySelector("#profileReceiver")
            var ele = document.createElement('span') 
            ele.textContent = username[0]
            p.appendChild()
            p.style.display = 'block'
        }

    })
})


function selectUser(){
    console.log("clicked to user card")
    var selectedUserBlock = document.getElementById("selectedUserBlock")
    



    // console.log(user.getElementsByClassName('.card-title'),"======>>.user.find('.)")
    // console.log(selectedUserBlock,"======>>.selectedUserBlock")
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