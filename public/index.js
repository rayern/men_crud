document.addEventListener('DOMContentLoaded', function(){
    fetchAll('id', 'desc')
});

document.querySelector('table thead').addEventListener('click', function (event) {
    if (event.target.className === "col-head") {
        const order = event.target.getAttribute("data-order");
        const param = event.target.getAttribute("data-param");
        fetchAll(param, order)
        if(order == 'desc'){
            event.target.setAttribute("data-order","asc");
        }
        else{
            event.target.setAttribute("data-order","desc");
        }
    }
});
document.querySelector('table tbody').addEventListener('click', function (event) {
    if (event.target.className === "delete-row-btn") {
        deleteRowById(event.target.dataset.id);
    }
    if (event.target.className === "edit-row-btn") {
        handleEditRow(event.target.dataset.id);
    }
});

const updateBtn = document.querySelector('#update-row-btn');
const searchBtn = document.querySelector('#search-btn');

searchBtn.onclick = function () {
    const name = document.querySelector('#search-input').value;
    fetch('http://localhost:4000/search', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ name: name })
    })
        .then(response => response.json())
        .then(data => loadHTMLTable(data['data']));
}

function fetchAll(orderby, order) {
    const apiUrl = 'http://localhost:4000/getAll';
    fetch(`${apiUrl}?orderby=${orderby}&order=${order}`)
        .then(response => response.json())
        .then(data => loadHTMLTable(data['data']));
}

function deleteRowById(id) {
    fetch('http://localhost:4000/delete/' + id, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            }
        });
}

function handleEditRow(id) {
    const updateSection = document.querySelector('#update-row');
    updateSection.hidden = false;
    document.querySelector('#update-name-input').dataset.id = id;
}

updateBtn.onclick = function () {
    const updateNameInput = document.querySelector('#update-name-input');


    console.log(updateNameInput);

    fetch('http://localhost:4000/update', {
        method: 'PATCH',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            id: updateNameInput.dataset.id,
            name: updateNameInput.value
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            }
        })
}


const apiBtn = document.querySelector('#call-api-btn');

apiBtn.onclick = function () {
    document.querySelector('#message').textContent = ''
    const countInput = document.querySelector('#count-input');
    const count = countInput.value;
    countInput.value = "";

    fetch('http://localhost:4000/callAPI', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ count: count })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchAll("id", "desc")
            }
            else {
                document.querySelector('#message').textContent = data.message
            }
        });
}

function insertRowIntoTable(data) {
    const table = document.querySelector('table tbody');
    const isTableData = table.querySelector('.no-data');

    let tableHtml = "<tr>";

    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            if (key === 'dateAdded') {
                data[key] = new Date(data[key]).toLocaleString();
            }
            tableHtml += `<td>${data[key]}</td>`;
        }
    }

    tableHtml += `<td><button class="delete-row-btn" data-id=${data.id}>Delete</td>`;
    tableHtml += `<td><button class="edit-row-btn" data-id=${data.id}>Edit</td>`;

    tableHtml += "</tr>";

    if (isTableData) {
        table.innerHTML = tableHtml;
    } else {
        const newRow = table.insertRow();
        newRow.innerHTML = tableHtml;
    }
}

function loadHTMLTable(data) {
    const table = document.querySelector('table tbody');

    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='5'>No Data</td></tr>";
        return;
    }

    let tableHtml = "";

    data.forEach(function ({ id, name, count }) {
        tableHtml += "<tr>";
        tableHtml += `<td>${id}</td>`;
        tableHtml += `<td>${name}</td>`;
        tableHtml += `<td>${count}</td>`;
        tableHtml += `<td><button class="delete-row-btn" data-id=${id}>Delete</td>`;
        tableHtml += `<td><button class="edit-row-btn" data-id=${id}>Edit</td>`;
        tableHtml += "</tr>";
    });

    table.innerHTML = tableHtml;
}