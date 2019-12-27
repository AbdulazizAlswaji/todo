$(document).ready(function () {
    tasks = [];
    $('#add-task-main').on('click', (event) => {
        event.preventDefault();
        $('#add-task-title').val($('#add-task-title-main').val());
    });

    getTasks();

    $('#add-task').on('click', () => {
        addTask();
    });

});

async function getTasks() {
    await db.once('value').then((snapshot) => {
        tasks = snapshot.val();
        Object.keys(tasks).forEach((task_id) => {
            if (tasks[task_id].delete == false) {
                percentage = Math.round(tasks[task_id].score / tasks[task_id].target_score * 100);
                viewTask(tasks[task_id].title, percentage, tasks[task_id].measurement,
                    tasks[task_id].score, tasks[task_id].target_score, task_id);
            }
        });
    });
}

function viewTask(title, percentage, measurement, score, target_score, task_id) {
    output = `
    <div class="task mb-4 shadow" id="task_${task_id}">
    <div class="d-flex">
        <div class="mr-auto pt-2"> <strong> ${title} </strong> <span>( <span id="score_${task_id}">${score}</span>/${target_score} ${measurement} )</span></div>
        <div class="pr-1">
                <span data-feather="edit" stroke-width="2" data-toggle="modal" data-target="#edit-task-form" onclick="editTaskForm('${task_id}')"></span> 
        </div>
        <div class="">
                <span data-feather="trash-2" stroke-width="2" onclick="deleteTask('${task_id}')"></span>
             </div>
             <div class="">
                <span data-feather="plus-circle" stroke-width="2" onclick="addOneScore('${task_id}')"></span>
             </div>
    </div>
    <div class="progress mt-2 mb-1">
        <div id="percentage_${task_id}" class="progress-bar bg-info" role="progressbar" style="width: ${percentage}%;" aria-valuenow="${percentage}"
            aria-valuemin="0" aria-valuemax="100">${percentage}%</div>
    </div>
</div>
    `;

    $('#tasks').append(output);
    feather.replace();
    tasks[task_id] = {
        title: title,
        score: score,
        target_score: target_score,
        measurement: measurement
    }
}

addOneScore = (task_id) => {
    let score = parseFloat(tasks[task_id].score);
    let target_score = parseFloat(tasks[task_id].target_score);
    let new_score = score + 1;

    if (new_score <= target_score) {
        $('#score_' + task_id).html(new_score);
        tasks[task_id].score = new_score;
        percentage = Math.round(tasks[task_id].score / tasks[task_id].target_score * 100);
        $('#percentage_' + task_id).html(percentage + '%');
        $('#percentage_' + task_id).attr('aria-valuenow', percentage);
        $('#percentage_' + task_id).css('width', percentage + '%');
        firebase.database().ref(task_id + '/score').set(new_score);
    }
}

editTaskForm = (task_id) => {
    $('#edit-task-title').val(tasks[task_id].title);
    $('#edit-task-measurement').val(tasks[task_id].measurement);
    $('#edit-task-score').val(tasks[task_id].score);
    $('#edit-task-target_score').val(tasks[task_id].target_score);
    $('#update-task').attr('onClick', `updateTask('${task_id}')`)
}

deleteTask = (task_id) => {
    let delete_task = confirm('Are you sure you want to delete this task ?');
    if (delete_task == true) {
        firebase.database().ref(task_id + '/delete').set(true);
        $('#task_' + task_id).hide();
    }
}

updateTask = (task_id) => {
    let title = $.trim($('#edit-task-title').val());
    let measurement = $.trim($('#edit-task-measurement').val());
    let target_score = $('#edit-task-target_score').val();
    let score = $('#edit-task-score').val();

    var pass = 0;
    var errors = '';
    if (title.length > 3
        && title.length <= 100) {
        pass++;
    } else {
        errors += '<li> Title is to short </li>';
    }

    if (measurement.length > 0
        && measurement.length > 3
        && measurement.length <= 100) {
        pass++;
    } else {
        errors += '<li> Measurement is to short </li>';
    }

    if (isNaN(target_score) == false
        && parseFloat(target_score) > 0
        && parseFloat(target_score) <= 1000) {
        pass++;
    } else {
        errors += '<li> Invalid Target Score </li>';
    }

    if (isNaN(score) == false
        && parseFloat(score) >= 0
        && parseFloat(score) <= parseFloat(target_score)) {
        console.log(target_score);
        pass++;
    } else {
        errors += '<li> Invalid Score </li>';
    }

    if (pass == 4 && errors == '') {
        firebase.database().ref(task_id).set({
            title: title,
            measurement: measurement,
            target_score: target_score,
            score: score,
            delete: false,
            done: false
        });

        location.reload();
    } else {
        $('#edit-errors-list').html(errors);
        $('#edit-errors-list').addClass('d-inline');
    }

}

addTask = () => {
    let title = $.trim($('#add-task-title').val());
    let measurement = $.trim($('#add-task-measurement').val());
    let target_score = $('#add-task-target_score').val();

    var pass = 0;
    var errors = '';
    if (title.length > 3 && title.length <= 100) {
        pass++;
    } else {
        errors += '<li> Title is to short </li>';
    }

    if (measurement.length > 0 && measurement.length > 3 && measurement.length <= 100) {
        pass++;
    } else {
        errors += '<li> Measurement is to short </li>';
    }

    if (isNaN(target_score) == false && parseFloat(target_score) > 0 && parseFloat(target_score) <= 1000) {
        pass++;
    } else {
        errors += '<li> Invalid Target Score </li>';
    }

    if (pass == 3 && errors == '') {
        db.child(randomString(70)).set({
            title: title,
            score: 0,
            target_score: target_score,
            delete: false,
            done: false,
            measurement: measurement
        });

        location.reload();

    } else {
        $('#add-errors-list').html(errors);
        $('#add-errors-list').addClass('d-inline');
    }
}

function randomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


