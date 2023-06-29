console.log("sidebar.js loaded!")

var inputGrpName = document.querySelector('#input-grpName')
var memberIDs = []
var group_img;

function addToGrp(userId){
    
    var selectUser = document.getElementById('selectUser') 
    var userElement = document.querySelector(`[data-user-id="${userId}"]`);
    var getSelectedUser = document.getElementById(`selectUserID-${userId}`)
    
    if (getSelectedUser) {
        return;
    }
    
    var username = userElement.querySelector('.username').textContent 
    var profileImage = userElement.querySelector('.profile_img');

    if (profileImage.tagName === 'IMG') {
        var profileUrl = profileImage.getAttribute('src')
        const userBlock = `<div class="d-flex flex-row p-2 mt-2" style="background-color: #f0f2f5; border-radius: 36px;" id="selectUserID-${userId}">
                            <img src="${profileUrl}" class="" alt="..." style="width:40px; height:40px; border-radius: 50%;">
                            <div class="p-2">${username}</div>
                            <div class="p-2"><button type="button" class="btn-close" aria-label="Close" onclick="removeFromGrp(${userId})" ></button></div>
                        </div>`
        selectUser.insertAdjacentHTML('beforeend', userBlock)
    } else {
        const userBlock = `<div class="d-flex flex-row p-2 mt-2" style="background-color: #f0f2f5; border-radius: 36px;" id="selectUserID-${userId}">
                            <div class="selectedUserP text-white">${username[0]}</div>
                            <div class="p-2">${username}</div>
                            <div class="p-2"><button type="button" class="btn-close" aria-label="Close" onclick="removeFromGrp(${userId})"></button></div>
                        </div>`
        selectUser.insertAdjacentHTML('beforeend', userBlock)
    }
    updateNextStep();
    memberIDs.push(parseInt(userId))
}

function removeFromGrp(userId){
    var selectedGrpUsers = document.getElementById(`selectUserID-${userId}`)
    var index = memberIDs.indexOf(userId);
    if (index > -1) {
        memberIDs.splice(index, 1);
    }
    selectedGrpUsers.remove();
    updateNextStep();
}

function updateNextStep(){
    var GoToNext = document.getElementById('GoToNext')
    var selectUser = document.getElementById('selectUser') 
    if (selectUser.childElementCount === 0) {
        GoToNext.classList.add('d-none')
    } else {
        GoToNext.classList.remove('d-none')
    }
}


function addGroupIcon(){
    var groupIconBlock = document.getElementById('pre-group-icon')
    var groupImgElement = document.getElementById('group-img')

    group_img = document.getElementById('grpIcon').files[0]
    groupImgElement.setAttribute('src', URL.createObjectURL(group_img))
    groupImgElement.classList.remove('d-none')
    groupIconBlock.classList.add('d-none')
}

function createGroup() {
    var formdata = new FormData();
    if (group_img) {
        formdata.append('img', group_img);
    }
    formdata.append('action', 'create_group');
    formdata.append('grpName', inputGrpName.value);
    formdata.append('memberIDs', JSON.stringify(memberIDs));

    $.ajax({
        url: '/chat/',
        type: 'POST',
        data: formdata,
        processData: false,
        contentType: false,
        headers: {
            'X-CSRFToken': $('input[name=csrfmiddlewaretoken]').val()
        },
        success: function(response) {
            console.log("success", response);
            if (response.status === 200) {
                window.location.href = '/chat';
            } else {
                alert("ERROR: Error while creating a group!");
            }
        },
        error: function(error) {
            console.log("ERROR: ", error);
        }
    });
}