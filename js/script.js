//const api = 'http://savvita-001-site1.atempurl.com';
//const api = 'https://localhost:7055';
const api = 'http://sssvvvttt-001-site1.itempurl.com';
const gadgetsPerPage = 10;

let categories;

let currentPage;
let currentCategory;
let count;
let filterName;

let tokenKey = 'accessToken';
let userKey = 'id';

function loadCategories(callback) {
    $.ajax({
        type: 'GET',
        url: `${api}/categories`,
        success: response => {
            categories = response;
            callback();
        }
    });
}

function initializeCategories() {
    loadCategories(() => {
        let container = $('#categoriesNav');
        let sideContainer = $('#categoriesSideNav');

        for(category of categories) {
            container.append(`<button type="button" class="btn btn-outline-light rounded-0" data-id="${category.id}">${category.name}</button>`);
            sideContainer.append(`<button type="button" class="btn btn-outline-light rounded-0 text-start" data-id="${category.id}">${category.name}</button>`);
        }
    });
}

function initializeButtons() {
    $('#searchBtn').click(function() {
        filterName = $('#searchTxt').val();
        loadPage(1, undefined, filterName);
        return false;
    });

    $('#signInBtn').click(function() {
        signIn();
        return false;
    });

    $('#cancelSignInBtn').click(function() {
        $('#email').val('');
        hideSignIn();
        return false;
    });

    $('#signUpBtn').click(function() {
        signUp();
        return false;
    });

    $('#cancelSignUpBtn').click(function() {
        $('#registerEmail').val('');
        hideSignUp();
        return false;
    });
}

function filterCategory(e) {
    filterName = undefined;
    $('#searchTxt').val('');
    currentCategory = parseInt(e.target.getAttribute('data-id'));
    $('#breadcrumb_active').text(e.target.textContent);
    loadPage(1, currentCategory);
}

function addPagination(page, count) {
    let container = $('#pagination');
    container.empty();

    container.append(`<li class="page-item">
                            <a id="prevBtn" class="page-link bg-dark text-white" href="#" aria-label="Previous">
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>
                        <li id="page-nav-item" class="pagination" onclick="goToPage(event)"></li>
                        <li class="page-item">
                            <a id="nextBtn" class="page-link bg-dark text-white" href="#" aria-label="Next">
                                <span aria-hidden="true">&raquo;</span>
                            </a>
                            </li>`);

    let item = $('#page-nav-item');

    for(let i = 0; i < count; i++) {
        item.append(`<li class="page-item${i + 1 === page ? ' active' : ''}"><a class="page-link bg-dark text-white rounded-0" href="#" data-page=${i + 1}>${i + 1}</a></li>`);
    }

    $('#prevBtn').click(function () {
        if(currentPage > 1) {
            loadPage(currentPage - 1, currentCategory, filterName);
        }
    });

    $('#nextBtn').click(function () {
        if(currentPage < count) {
            loadPage(currentPage + 1, currentCategory, filterName);
        }
    })
}

function removePagination() {
    let container = $('#pagination');
    container.empty();
}

function goToPage(e) {
    loadPage(parseInt(e.target.getAttribute('data-page')), currentCategory, filterName);
}

function showSignIn() {
    $('#signInErrorTxt').text('');
    $('#email').val('');
    $('#loginForm').show(500);
}

function hideSignIn() {
    $('#signInErrorTxt').text('');
    $('#email').val('');
    $('#loginForm').hide(500);
}

function showSignUp() {
    $('#signUpErrorTxt').text('');
    $('#registerEmail').val('');
    $('#registerForm').show(500);
}

function hideSignUp() {
    $('#signUpErrorTxt').text('');
    $('#registerEmail').val('');
    $('#registerForm').hide(500);
}

function setAccountMenu(isLogged) {
    let nav = $('#accountNav');
    nav.empty();
    if(isLogged) {
        nav.append(`<li><a class="dropdown-item" href="account.html">My profile</a></li>`);
        nav.append(`<li><a class="dropdown-item" href="#" onclick="logOut()">Log out</a></li>`);
    }
    else {
        nav.append(`<li><a class="dropdown-item" href="#" onclick="showSignIn()">Log in</a></li>`);
        nav.append(`<li><a class="dropdown-item" href="#" onclick="showSignUp()">Register</a></li>`);
    }
}

function loadPage(page, category, filterName) {
    let container = $('#container');
    container.empty();

    let url = `${api}/gadgets/page/${page}?perPage=${gadgetsPerPage}`;

    if(category != undefined) {
        url = `${api}/gadgets/category/${category}/page/${page}?perPage=${gadgetsPerPage}`;
    }

    if(filterName != undefined) {
        url = `${api}/gadgets/name/${filterName}?page=${page}&perPage=${gadgetsPerPage}`;
    }

    $.ajax({
        type: 'GET',
        url: url,

        success: response => {
            if(response.hits > 0) {
                for(gadget of response.result) {
                    container.append(addCard(gadget));
                }

                currentPage = page;
                currentCategory = category;
                count = response.hits;
                addPagination(currentPage, Math.ceil(response.hits / gadgetsPerPage));
            }
            
            else  {
                currentPage = undefined;
                count = 0;
                removePagination();
                container.append(`<p class="text-white m-3">Not found. Sorry :(</p>`);
            }
        }
    });
}

function signIn() {
    if($('#email').val() == '') {
        $('#signInErrorTxt').text('Enter your email');
        return;
    }

    $.ajax({
        type: "POST",
        url: `${api}/users/signin`,
        data: JSON.stringify(
          $('#email').val()
        ),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },

        success: function(data) {
            sessionStorage.setItem(tokenKey, data.access_token);
            sessionStorage.setItem(userKey, data.id);
            $('#signInErrorTxt').text('');
            
            hideSignIn();
            setAccountMenu(true);
        },
        error: function(data) {
            let error;

            if(data.status == 400 && data.responseJSON.code == 'invalid-credentials') {
                error = 'Invalid email';
            }
            else {
                error = 'Something went wrong. Try again later';
            }
            $('#signInErrorTxt').text(error);
        }
    });
}

function signUp() {
    if($('#registerEmail').val() == '') {
        $('#signUpErrorTxt').text('Enter your email');
        return;
    }

    $.ajax({
        type: "POST",
        url: `${api}/users/signup`,
        data: JSON.stringify(
          $('#registerEmail').val()
        ),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },

        success: function(data) {
            sessionStorage.setItem(tokenKey, data.access_token);
            sessionStorage.setItem(userKey, data.id);
            $('#signUpErrorTxt').text('');
            hideSignUp();
            setAccountMenu(true);       
        },
        error: function(data) {
            let error;

            if(data.status == 409) {
                error = 'This email is already registered';
            }
            else {
                error = 'Something went wrong. Try again later';
            }
            $('#signUpErrorTxt').text(error);
        }
    });
}

function logOut() {
    sessionStorage.removeItem(tokenKey);
    sessionStorage.removeItem(userKey);
    setAccountMenu(false);
    $(location).attr('href', 'index.html');
}

function setAccountBreadcrumb(value) {
    $('#breadcrumb_active').text(value);
}

function addAddingForm() {
    let container = $('#container');
    container.removeClass('justify-content-center');
    container.empty();

    container.append(`
    <form class="flex-grow-1">
        <div class="row mb-3">
            <label for="title" class="col-sm-2 col-form-label text-white p-3 m-0 mt-2">Gadget's title</label>
            <div class="col-sm-10 mt-3">
                <input type="text" class="form-control" id="title">
            </div>
        </div>
        <div class="row mb-3">
            <label for="price" class="col-sm-2 col-form-label text-white p-3 m-0 mt-2">Price</label>
            <div class="col-sm-10 mt-3">
                <div class="input-group">
                    <input type="text" class="form-control rounded-1" id="price">
                    <div class="input-group-text">$</div>
                </div>
            </div>
        </div>
        <div class="row mb-3">
            <label for="category" class="col-sm-2 col-form-label text-white p-3 m-0 mt-2">Category</label>
            <div class="col-sm-10 mt-3">
                <select class="form-select" id="category">
                    <option selected value="0">Choose...</option>
                </select>
        </div>   
        <div class="row m-3 p-3 bg-dark text-white">
            <button class="btn btn-outline-light m-3" style="width: 10rem;" onclick="addGadget(event)">Add</button>
            <button class="btn btn-outline-light m-3" style="width: 10rem;" onclick="clearAddingForm(event)">Cancel</button>
        </div>
        <div id="addErrorTxt" class="row m-2 bg-dark text-white"></div>
    </form>`);

    initilazeDropDownCategories($('#category'));
}

function initilazeDropDownCategories(container) {
    container.empty();
    return $.ajax({
        type: 'GET',
        url: `${api}/categories`,
        success: response => {
            container.append(`<option selected value="0">Choose...</option>`);
            for(category of response) {
                container.append(`<option value="${category.id}">${category.name}</option>`);
            }
        }
    });
}

function goMyProfile() {
    let id = sessionStorage.getItem(userKey);

    if(id == null) {
        logOut();
        showSignIn();
        return;
    }

    let container = $('#container');
    container.removeClass('justify-content-center');
    container.empty();

    $.ajax({
        type: "GET",
        url: `${api}/users/${id}`,
        headers: {
            'Authorization': "Bearer " + sessionStorage.getItem(tokenKey)
          },

        success: function(data) {       
            setAccountBreadcrumb('My profile');
            container.append(`<p class="text-white text-start m-2">${data.email}</p>`);
        },
        error: function(data) {
            let error;
            if(data.status == 401) {
                error = 'Access denied';
            }
            else if(data.status == 404) {
                error = 'User not found';
            }
            else {
                error = 'Something went wrong. Try again later';
            }
            container.append(`<p class="text-white>${error}<\p>`);
        }
    });
}

function goMyGadgets() {
    let id = sessionStorage.getItem(userKey);

    if(id == null) {
        logOut();
        showSignIn();
        return;
    }

    let container = $('#container');
    container.addClass('justify-content-center');
    container.empty();

    let url = `${api}/gadgets/user/${id}`;

    $.ajax({
        type: 'GET',
        url: url,

        success: response => {
            setAccountBreadcrumb('My gadgets');
                
            if(response.length !== 0) {
                for(gadget of response) {
                    container.append(addMyCard(gadget));
                }
            }
            
            else {
                container.append(`<p class="text-white m-3">Not found. Sorry :(</p>`);
             }
        },
        error: function() {
            container.append(`<p class="text-white m-3">Something went wrong. Try again later</p>`);
        }
    });
}

function goAddGadget() {
    setAccountBreadcrumb('Add new gadget');
    addAddingForm();
}

function clearAddingForm(e) {
    e.preventDefault();
    $('#title').val('');
    $('#price').val('');
    $('#category').val('0');
    $('#addErrorTxt').val('');
    return false;
}

function addGadget(e) {
    e.preventDefault();
    let id = sessionStorage.getItem(userKey);

    if(id == null) {
        logOut();
        showSignIn();
        return;
    }

    let gadget = {
        "Name": $('#title').val(),
        "Price": $('#price').val(),
        "CategoryId": $('#category').val()
    };


    $.ajax({
        type: 'POST',
        url: `${api}/gadgets`,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + sessionStorage.getItem(tokenKey)
        },
        data: JSON.stringify(
          gadget
        ),
        success: response => {
            $('#addErrorTxt').empty();
            $('#addErrorTxt').append(`<p>Added</p>`);
            clearAddingForm(e);
        },
        error: function(data) {
            $('#addErrorTxt').empty();

            let error;

            if(data.status == 401) {
                error = 'Access denied';
            }
            else if(data.status == 400) {
                error = 'Invalid data';
            }
            else {
                error = 'Something went wrong. Try again later';
            }
            $('#addErrorTxt').append(`<p>${error}</p>`);
        }
    });
}

function removeGadget(e) {
    e.preventDefault();
    
    $.ajax({
        type: "DELETE",
        url: `${api}/gadgets/${e.target.getAttribute('data-id')}`,
        headers: {
          'Authorization': "Bearer " + sessionStorage.getItem(tokenKey)
        },

        success: function(data) {
            console.log(data);
            goMyGadgets();
        },
        error: function(data) {
            $('#errorTxt').empty();

            let error;

            if(data.status == 401) {
                error = 'Access denied';
            }
            else if(data.status == 404) {
                error = 'Not found';
            }
            else {
                error = 'Something went wrong. Try again later';
            }
            $('#errorTxt').append(`<p>${error}</p>`);
        }

    });
}

function index() {
    initializeCategories();
    initializeButtons();
    $('#loginForm').hide(0);
    $('#registerForm').hide(0);

    if(sessionStorage.getItem(tokenKey) != null) {
        setAccountMenu(true);
    }
    else {
        setAccountMenu(false);
    }

    loadPage(1);
}

function account() {
    initializeButtons();
    $('#loginForm').hide(0);
    $('#registerForm').hide(0);
    $('#editForm').hide(0);
    $('#confirmRemovingForm').hide(0);
    setAccountMenu(true);
    goMyProfile();
}

function hideEditForm(e) {
    e.preventDefault();
    $('#editForm').hide(500);
}

async function editGadget(e) {
    e.preventDefault();
    await initilazeDropDownCategories($('#editCategory'));
    
    $.ajax({
        type: 'GET',
        url: `${api}/gadgets/${e.target.getAttribute('data-id')}`,
        success: response => {          
            $('#editTitle').val(response.name);
            $('#editPrice').val(response.price);
            $(`#editCategory option`).removeAttr('selected');
            $('#editErrorTxt').text('');
            $(`#editCategory`).val(response.categoryId);
            $('#editCategory').change();
            $('#saveBtn').attr('data-id', e.target.getAttribute('data-id'));
            $('#editForm').show(500);

            goMyGadgets();
        },
        error: function(data) {
            $('#editErrorTxt').empty();

            let error;

            if(data.status == 404) {
                error = 'Not found';
            }
            else {
                error = 'Something went wrong. Try again later';
            }
            $('#editErrorTxt').append(`<p>${error}</p>`);
        }
    });

    return false;
}

function saveGadget(e) {
    e.preventDefault();
    let id = sessionStorage.getItem(userKey);

    if(id == null) {
        logOut();
        showSignIn();
        return;
    }

    let gadget = {
        "Id": e.target.getAttribute('data-id'),
        "Name": $('#editTitle').val(),
        "Price": $('#editPrice').val(),
        "CategoryId": $('#editCategory').val()
    };

    $.ajax({
        type: 'PUT',
        url: `${api}/gadgets`,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': "Bearer " + sessionStorage.getItem(tokenKey)
        },
        data: JSON.stringify(
          gadget
        ),
        success: response => {
            hideEditForm(e);
            goMyGadgets();
        },
        error: function(data) {
            $('#editErrorTxt').empty();

            let error;

            if(data.status == 401) {
                error = 'Access denied';
            }
            else if(data.status == 400) {
                error = 'Invalid data';
            }
            else {
                error = 'Something went wrong. Try again later';
            }
            $('#editErrorTxt').append(`<p>${error}</p>`);
        }
    });
    return false;
}


function addCard(gadget) {
    return `<div class="card text-white bg-dark m-3 border-light" style="width: 18rem;">
                <p class="d-none">${gadget.Id}</p>
                <img src="../images/No_image_available.png" class="card-img-top" alt="${gadget.name}">
                <div class="card-body">
                <h5 class="card-title">${gadget.name}</h5>
                <p class="card-text">Category: ${gadget.category.name}</p>
                </div>
                <ul class="list-group list-group-flush">
                <li class="list-group-item">Price: ${gadget.price}</li>
                </ul>
            </div>`;
}

function addMyCard(gadget) {
    return `<div class="card text-white bg-dark m-3 border-light" style="width: 18rem;">
                <p class="d-none">${gadget.id}</p>
                <button class="bg-transparent position-absolute top-0 start-0 m-1 border-0" onclick="editGadget(event)"><img src="images/icons-pencil.png" data-id="${gadget.id}" alt="Edit" style="width: 30px; height: 30px"></button>
                <button class="text-white bg-dark position-absolute top-0 end-0 m-1 border-0" data-id=${gadget.id} onclick="removeGadget(event)">Х</button>
                <img src="../images/No_image_available.png" class="card-img-top" alt="${gadget.name}">
                <div class="card-body">
                <h5 class="card-title">${gadget.name}</h5>
                <p class="card-text">Category: ${gadget.category.name}</p>
                </div>
                <ul class="list-group list-group-flush">
                <li class="list-group-item">Price: ${gadget.price}</li>
                </ul>
            </div>`;
}

function hideConfirmRemovingForm(e) {
    e.preventDefault();
    $('#confirmRemovingForm').hide(500);
}

function showConfirmRemovingForm(e) {
   // e.preventDefault();
    $('#confirmRemovingForm').show(500);
}

function removeProfile(e) {
    e.preventDefault();

    let id = sessionStorage.getItem(userKey);

    if(id == null) {
        logOut();
        showSignIn();
        return;
    }

    $.ajax({
        type: 'DELETE',
        url: `${api}/users/${id}`,
        headers: {
          'Authorization': "Bearer " + sessionStorage.getItem(tokenKey)
        },

        success: response => {
            hideConfirmRemovingForm(e);
            logOut();
        },
        error: function(data) {
            $('#confirmRemovingErrorTxt').empty();

            let error;

            if(data.status == 401) {
                error = 'Access denied';
            }
            else if(data.status == 400) {
                error = 'Invalid data';
            }
            else if(data.status == 404) {
                error = 'User not found';
            }
            else {
                error = 'Something went wrong. Try again later';
            }
            $('#confirmRemovingErrorTxt').append(`<p>${error}</p>`);
        }
    });
    
    

    return false;
}