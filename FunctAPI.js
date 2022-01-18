let serverUrl = 'https://tasklist-minh.herokuapp.com';
            var user = null;
            var selectedTasklist;
            var selectedTask;
            var selectedUser;
            var taskListHash;

            const register = async () => {
                let email = document.getElementById('registerEmail').value;
                let password = document.getElementById('registerPassword').value;
                const response = await fetch(`${serverUrl}/auth`,{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                });
                if (response.ok)
                    alert("registered");
                    window.location.href='Login.html'                
            }

            const fetchUsers = async () => {
                const fetchUserRequest = await fetch(`${serverUrl}/users`,{
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...user
                    }
                });
                const users = await fetchUserRequest.json();
                const form = document.getElementById('users');
                form.innerHTML = '';
                for (let u of users) {
                    let input = document.createElement("input");
                    input.name = 'selectedUser';
                    input.value = u.id;
                    input.id = `user_${u.id}`;
                    input.type = 'radio';
                    input.oninput = onSelectUser;
                    form.appendChild(input);
                    let span = document.createElement("span");
                    span.innerHTML = u.email;
                    form.appendChild(span);
                    form.appendChild(document.createElement('br'));
                }
            }

            const saveLogin = async response => {
                user = {
                    'access-token': response.headers.get('access-token'),
                    uid: response.headers.get('uid'),
                    client: response.headers.get('client')
                };
                localStorage.setItem('user',JSON.stringify(user));
                const body = await response.json();
                user.name = body.name;
                await fetchUsers();
            }

            const login = async () => {
                let email = document.getElementById('email').value;
                let password = document.getElementById('password').value;
                const response = await fetch(`${serverUrl}/auth/sign_in`,{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                });
                // await saveLogin(response);
                if (response.ok)
                    alert("Logged in");
                    window.location.href='Calendar.html'  
            }

            const checkToken = async () => {
                user = JSON.parse(await localStorage.getItem('user'));
                try {
                    const response = await fetch(`${serverUrl}/profile`,{
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            ...user
                        },
                    });
                    await saveLogin(response);
                    document.getElementById('currentUser').innerHTML = `${user.name ?? ''} ${user.uid}`;
                    return true;
                } catch {
                    return false;
                }
            }

            const refreshTasks = async () => {
                if (selectedTasklist) {
                    const taskRequest = await fetch(`${serverUrl}/task_lists/${selectedTasklist}/todos`,{
                        headers: {
                            ...user
                        }
                    }); 
                    const tasks = await taskRequest.json();
                    console.log(tasks);
                    const form = document.getElementById('tasks');
                    form.innerHTML = '';
                    for (let task of tasks) {
                        let input = document.createElement("input");
                        input.name = 'selectedTask';
                        input.value = task.id;
                        input.id = `task_${task.id}`;
                        input.type = 'radio';
                        input.oninput = onSelectTask;
                        form.appendChild(input);
                        let span = document.createElement("span");
                        span.innerHTML = `${task.name}: ${task.description ?? ""}`;
                        form.appendChild(span);
                    }
                }
            }

            const onSelectTaskList = async function(event) {
                selectedTasklist = event.target.value;
                updateListname.value = taskListHash[selectedTasklist].name;
                refreshTasks();
            }

            const onSelectUser = async function(event) {
                selectedUser = event.target.value;
            }

            const onSelectTask = async function(event) {
                selectedTask = event.target.value;
            }

            const fetchTasklist = async () => {
                let form = document.getElementById('tasklistForm');
                form.innerHTML = '';
                if (user) {
                    const taskListRequest = await fetch(`${serverUrl}/task_lists`,{
                        headers: {
                            //'access-token':'HgvYj33lCyCoVL6qvc9XJw',
                            //uid: 'thanqminh+2@gmail.com',
                            //client: 'TXlAjMl6kFjVy8ULronJ0Q'
                            ...user
                        }
                    }); 
                    const sharedTaskListRequest = await fetch(`${serverUrl}/shared`,{
                        headers: {
                            //'access-token':'HgvYj33lCyCoVL6qvc9XJw',
                            //uid: 'thanqminh+2@gmail.com',
                            //client: 'TXlAjMl6kFjVy8ULronJ0Q'
                            ...user
                        }
                    });
                    let taskLists = await taskListRequest.json();
                    const sharedTaskLists = await sharedTaskListRequest.json();
                    taskLists = [...taskLists, ...sharedTaskLists];
                    taskListHash = {};
                    for (let list of taskLists) {
                        taskListHash[list.id] = list;
                        let input = document.createElement("input");
                        input.name = 'selectedTasklist';
                        input.value = list.id;
                        input.id = `tasklist_${list.id}`;
                        input.type = 'radio';
                        input.oninput = onSelectTaskList;
                        form.appendChild(input);
                        let span = document.createElement("span");
                        span.innerHTML = `${list.name}: ${list.description ?? ""}`;
                        form.appendChild(span);
                    }
                    if (selectedTasklist) 
                        document.getElementById(`tasklist_${selectedTasklist}`).checked = true;
                }
                else {
                    ul.innerHTML = 'Need to login first';
                }                
            }
 
            async function updateUserName() {
                if (user != null) {
                    let name = newName.value;
                    const response = await fetch(`${serverUrl}/auth`,{
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            ...user
                        },
                        body: JSON.stringify({
                            name
                        })
                    });
                    user.name = name;
                    document.getElementById('currentUser').innerHTML = `${user.name ?? ''} ${user.uid}`;
                }
            }
            async function updateUserPassword() {
                if (user != null) {
                    let password = newPassword.value;
                    const response = await fetch(`${serverUrl}/auth`,{
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            ...user
                        },
                        body: JSON.stringify({
                            user: {
                                password,
                                password_confirmation: password
                            }
                        })
                    });
                    alert(await response.json());
                }
            }