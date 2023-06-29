console.log("chat_conversion.js loaded")

var ws;
var second_user;
var addingMembersForGrp = [];

first_user = document.getElementById('first_user').value
// console.log("first_user: ",first_user)

var group_id = document.getElementById('group-id')
// console.log(group_id,":group_id")

var input_message = document.getElementById('input-message')
var msg_body = document.querySelector('.message-body')
msg_body.scrollTop = msg_body.scrollHeight;


// WEBSOCKET CONNECTION

if (group_id){
    ws = new WebSocket('ws://' + window.location.host + '/ws/async/group/' + group_id.value) 
} else {
    second_user = document.getElementById('second-user').value
    ws = new WebSocket('ws://' + window.location.host + '/ws/async/' + first_user + '/' + second_user) 
}


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

    if (data.from === 'group') {
        console.log(data.from,"==from")
        console.log("data.sender_id type: ",typeof(data.sender_id), "first_user type: ",typeof(first_user))

        if (data.sender_id === parseInt(first_user)) {

            var message_ele = `<div class="d-flex flex-column align-items-end mt-2">
                                    <span class="p-2 px-3 m-1" style="border-radius: 17px; background-color: #C5E6A1;">${data.message} </span>
                                </div>`
    
            msg_body.innerHTML += message_ele

        } else {

            var message_ele = `<div class="d-flex flex-column align-items-start mt-2">
                                    <small class="text-success">${data.sender}</small>
                                    <span class="bg-white p-2 px-3 mt-1" style="border-radius: 17px;">${data.message} </span>
                                </div>`

            msg_body.innerHTML += message_ele
        }
    } else {
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
    msg_body.scrollTop = msg_body.scrollHeight;
}

function msg_send(){
    console.log("click to send")

    if (input_message.value === ""){
        return;
    } else {
        if (group_id){
            console.log("send to grp")
            ws.send(JSON.stringify({
                'message_to' : 'group',
                'message': input_message.value,
                'sender' : first_user,
            }))
        } else {
            console.log("send to chat")
            console.log("first_user: ",first_user)
            console.log("second_user: ",second_user)
            
            ws.send(JSON.stringify({
                'message_to' : 'chat',
                'message' : input_message.value,
                'sent_by' : first_user,
                'send_to' : second_user,
            }))
        }
        input_message.value = ""
    }   
}

function search_user(){
    var search_user = document.getElementById('search_user').value
    console.log(search_user,"=============================search_user")
    $.ajax({
        url: '/chat/user/' + search_user,
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

    var msgblock = document.getElementById("msg")
    msgblock.innerHTML = '';

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

function ChangeGroupIcon(){

    var groupIconBlock = document.getElementById('pre-group-icon1')
    var group_img = document.getElementById('grpIcon1').files[0]
    var groupImgElement = document.getElementById('group-img-preview')
    var sidebar_profile = document.getElementById(`grp_profile_${group_id.value}`)
    console.log("group_id: ",group_id)

    var formdata = new FormData();
    formdata.append('action', 'Update-Group-Icon')
    formdata.append('group_icon', group_img)
    formdata.append('group_id', group_id.value)
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
            console.log("success")
            if (response.status === 200){
                if (groupIconBlock !== null) {
                    groupImgElement.setAttribute('src', response.image_url)
                    document.getElementById('group-profile').setAttribute('src', response.image_url)
                    document.getElementById('group-profile').classList.remove('d-none')
                    sidebar_profile.setAttribute('src', response.image_url)
                    groupIconBlock.classList.add('d-none')
                } else {
                    groupImgElement.setAttribute('src', response.image_url)
                    document.getElementById('group-profile').setAttribute('src', response.image_url)
                    document.getElementById('group-profile').classList.remove('d-none')
                    sidebar_profile.setAttribute('src', response.image_url)
                    sidebar_profile.classList.remove('d-none')
                }
            }
        },
        error: function(error){
            console.log("error:  ",error)
        }
    })
} 
var group_name = document.getElementById('group-name')
var grp_rename_block = document.getElementById('group-rename-block')
var update_input_GD = document.getElementById('update-input-GD')
var grp_name_block = document.getElementById('group-nameBlock')
var add_Group_discrip = document.getElementById('add-Group-discrip')
var new_group_name = document.getElementById('rename-group-name')
var GD_from_BE = document.getElementById('GD-from-BE')
var discription_input = document.getElementById('group-discription-name-input')

if (GD_from_BE.textContent === ""){
    add_Group_discrip.classList.remove('d-none')
    document.getElementById('display-group-descrip').classList.add('d-none')
}
function renameGroupName(){
    console.log("clickeed to rename")
    new_group_name.value = group_name.textContent
    grp_rename_block.classList.remove('d-none')
    grp_name_block.classList.add('d-none')
}

function AddGroupDecrip(){
    if (GD_from_BE.textContent !== ""){
        discription_input.value = GD_from_BE.textContent 
        document.getElementById('display-group-descrip').classList.add('d-none')
        update_input_GD.classList.remove('d-none')
    } else {
        add_Group_discrip.classList.add('d-none')
        update_input_GD.classList.remove('d-none')
    }
}

function updateGroupDescrip(){
    $.ajax({
        url: '/chat/',
        type: 'POST',
        data: {
            'action' : 'Update-Group-Description',
            'group_id' : group_id.value,
            'description' : discription_input.value,
            csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val(),
        },
        success: function(response){
            console.log("success")
            if (response.group_description === ""){
                add_Group_discrip.classList.remove('d-none')
                update_input_GD.classList.add('d-none')
            } else {
                GD_from_BE.textContent = response.group_description
                document.getElementById('display-group-descrip').classList.remove('d-none')
                update_input_GD.classList.add('d-none')
            }
        }
    })
}

function UpdateGroupName(){
    // grpName_{{g.id}}
    console.log("clicked update name button","==new_group_name", new_group_name.value)
    $.ajax({
        url: '/chat/',
        type: 'POST',
        data: {
            'action' : 'Rename-Group-Name',
            'group_id' : group_id.value,
            'new_grp_name' : new_group_name.value
        },
        headers: {
            'X-CSRFToken': $('input[name=csrfmiddlewaretoken]').val() 
        },
        success : function(response) {
            console.log("updated successfully",response);
            if (response.status == 200){
                grp_rename_block.classList.add('d-none')
                grp_name_block.classList.remove('d-none')
                group_name.textContent = response.group_name
                document.getElementById('grpName-chat').textContent = response.group_name
                document.getElementById(`sidebar_grpName_${group_id.value}`).textContent = response.group_name
            }
        },
        error: function(error){
            console.log("ERROR: ",error)
        }
    })
}

function addingTOGrp(checkbox) {
    const userDiv = checkbox.parentNode.parentNode;
    const selectedUsersDiv = document.getElementById("adding-users");
    const username = userDiv.querySelector('.username-for-group').textContent;
    const profile = userDiv.querySelector('.profile_img');
    const userId = userDiv.getAttribute('data-user-id');

    if (checkbox.checked) {
        if (selectedUsersDiv.querySelector(`.adding-to-group-${userId}`) === null) {
            let userElement = '';
            if (profile.tagName === 'IMG') {
                const img_url = profile.getAttribute('src');
                userElement = `
                    <div class="m-2 adding-to-group adding-to-group-${userId}">
                        <img src="${img_url}" class="profile_img m-2" alt="...">
                        <div class="d-flex justify-content-center">${username}</div>
                    </div>`;
            } else {
                userElement = `
                    <div class="m-2 adding-to-group adding-to-group-${userId}">
                        <div class="text-white profile m-2"><span class="profile_img">N</span></div>
                        <div class="d-flex justify-content-center">${username}</div>
                    </div>`;
            }
            selectedUsersDiv.insertAdjacentHTML('beforeend', userElement);
            addingMembersForGrp.push(parseInt(userId))
        }
    } else {
        const userToRemove = selectedUsersDiv.querySelector(`.adding-to-group-${userId}`);
        if (userToRemove !== null) {
            var index = addingMembersForGrp.indexOf(parseInt(userId));
            if (index > -1) {
                addingMembersForGrp.splice(index, 1);
            }
            userToRemove.remove();
        }
    }

    var addUserBlock = document.getElementById('add-user');
    const selectedUsers = selectedUsersDiv.querySelectorAll('.adding-to-group');
    addUserBlock.style.display = (selectedUsers.length > 0) ? 'block' : 'none';
    addUserBlock.classList.remove('d-none');
}

function addToGroup(){
    console.log("clocked to addToGroup", addingMembersForGrp)
    $.ajax({
        'url' : '/chat/',
        type : 'POST',
        data: {
            'action' : 'add-members-to-group',
            'group_id' : group_id.value,
            'add_members' : JSON.stringify(addingMembersForGrp),
            csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val(),
        },
        success: function(response){
            console.log("success")
            window.location.reload()
        },
        error: function(error){
            console.log("ERROR: ",error)
        }
    })
}

function exitGroup(){
    var grp_name = document.getElementById('grpName-chat').textContent 
    document.getElementById('exitGroupName').textContent = `Exit "${grp_name}" group?`
}

function confirmExitGrp(){
    console.log("Confirm exit from group")
    $.ajax({
        url: '/chat/',
        type: 'POST',
        data: {
            'action' : 'Exit-From-Group',
            'group_id' : group_id.value,
            'user' : first_user,
            csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val(),
        },
        success: function(){
            console.log("success")
            window.location.reload()
        },
        error: function(error){
            console.log("ERROR: ",error)
        }
    })
}

function makeGroupAdmin(memberID){
    var grp_name = document.getElementById('grpName-chat').textContent 
    var username = document.getElementById('member-username').textContent
    document.getElementById('memberID').value =  memberID
    document.getElementById('makeGroupAdmin').textContent = `Make ${username} an admin for "${grp_name}" group?`
}

function confirmMakeGroupAdmin(){
    var member_id = document.getElementById('memberID').value
    $.ajax({
        url: '/chat/',
        type: 'POST',
        data: {
            'action' : 'Make-Group-Admin',
            'group_id' : group_id.value,
            'member_id' : member_id,
            csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val(),
        },
        success : function(){
            console.log("success")
            window.location.reload();
        },
        error: function(error){
            console.log("ERROR: ",error)
        }
    })
}
function removeFromGroup(memberID){
    var grp_name = document.getElementById('grpName-chat').textContent 
    var username = document.getElementById('member-username').textContent
    document.getElementById('remove-member-id').value =  memberID
    document.getElementById('removeMemberFromGroup').textContent = `Remove ${username} from "${grp_name}" group?`
}

function confirmRemoveFromGroup(){
    var member_id = document.getElementById('remove-member-id').value
    $.ajax({
        url: '/chat/',
        type: 'POST',
        data: {
            'action' : 'Remove-Member-From-Group',
            'group_id' : group_id.value,
            'member_id' : member_id,
            csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val(),
        },
        success : function(){
            console.log("success")
            window.location.reload();
        },
        error: function(error){
            console.log("ERROR: ",error)
        }
    })
}