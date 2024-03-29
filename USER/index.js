const sideLinks = document.querySelectorAll('.sidebar .side-menu li a:not(.logout)');

sideLinks.forEach(item => {
    const li = item.parentElement;
    item.addEventListener('click', () => {
        sideLinks.forEach(i => {
            i.parentElement.classList.remove('active');
        })
        li.classList.add('active');
    })
});
/*dropdown*/

const menuBar = document.querySelector('.content nav .bx.bx-menu');
const sideBar = document.querySelector('.sidebar');

menuBar.addEventListener('click', () => {
    sideBar.classList.toggle('close');
});

const searchBtn = document.querySelector('.content nav form .form-input button');
const searchBtnIcon = document.querySelector('.content nav form .form-input button .bx');
const searchForm = document.querySelector('.content nav form');

searchBtn.addEventListener('click', function (e) {
    if (window.innerWidth < 576) {
        e.preventDefault;
        searchForm.classList.toggle('show');
        if (searchForm.classList.contains('show')) {
            searchBtnIcon.classList.replace('bx-search', 'bx-x');
        } else {
            searchBtnIcon.classList.replace('bx-x', 'bx-search');
        }
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth < 768) {
        sideBar.classList.add('close');
    } else {
        sideBar.classList.remove('close');
    }
    if (window.innerWidth > 576) {
        searchBtnIcon.classList.replace('bx-x', 'bx-search');
        searchForm.classList.remove('show');
    }
});

const toggler = document.getElementById('theme-toggle');

toggler.addEventListener('change', function () {
    if (this.checked) {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
});
//log 
 let logTableVisible = false; // Variable to track the visibility status for log table
let warnlogTableVisible = false; // Variable to track the visibility status for warnlog table

async function log() {
  try {
    const response = await fetch('http://192.168.1.213:5001/nfs/log', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('API request failed with status: ' + response.status);
    }

    const data = await response.json();

    // Create a table element
    const table = document.createElement("table");

    // Create a header row
    const headerRow = table.createTHead().insertRow(0);
    for (const key of Object.keys(data[0])) {
      const th = document.createElement("th");
      th.textContent = key;
      headerRow.appendChild(th);
    }

    // Create a table body
    const body = table.createTBody();
    for (const item of data) {
      const row = body.insertRow();
      for (const key of Object.keys(item)) {
        const cell = row.insertCell();
        cell.textContent = item[key];
      }
    }

    // Append the table to the element with the ID 'log'
    const logElement = document.getElementById('log');
    logElement.innerHTML = ''; // Clear existing content
    logElement.appendChild(table);

    // Toggle the visibility status
    logTableVisible = !logTableVisible;

    // Show/hide the table based on the visibility status
    if (logTableVisible) {
      table.style.display = 'table';
    } else {
      table.style.display = 'none';
    }

  } catch (error) {
    console.error('Error fetching data:', error);
    // Display an error message to the user if desired
  }
}

async function warnlog() {
  try {
    const response = await fetch('http://192.168.1.213:5001/nfs/warnlogs', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('API request failed with status: ' + response.status);
    }

    const data = await response.json();

    // Create a table element
    const table = document.createElement("table");

    // Create a header row
    const headerRow = table.createTHead().insertRow(0);
    for (const key of Object.keys(data[0])) {
      const th = document.createElement("th");
      th.textContent = key;
      headerRow.appendChild(th);
    }

    // Create a table body
    const body = table.createTBody();
    for (const item of data) {
      const row = body.insertRow();
      for (const key of Object.keys(item)) {
        const cell = row.insertCell();
        cell.textContent = item[key];
      }
    }

    // Append the table to the element with the ID 'warnlog'
    const warnlogElement = document.getElementById('warnlog');
    warnlogElement.innerHTML = ''; // Clear existing content
    warnlogElement.appendChild(table);

    // Toggle the visibility status
    warnlogTableVisible = !warnlogTableVisible;

    // Show/hide the table based on the visibility status
    if (warnlogTableVisible) {
      table.style.display = 'table';
    } else {
      table.style.display = 'none';
    }

  } catch (error) {
    console.error('Error fetching data:', error);
    // Display an error message to the user if desired
  }
}

// Additional function Totallog
async function Totallog() {
  try {
    const response = await fetch('http://192.168.1.213:5001/nfs/totallogs', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('API request failed with status: ' + response.status);
    }

    const data = await response.json();
    document.getElementById('info').textContent = JSON.stringify(data.info, null, 2);
    document.getElementById('warning').textContent = JSON.stringify(data.warning, null, 2);
    document.getElementById('error').textContent = JSON.stringify(data.error, null, 2);
  } catch (error) {
    console.error('Error fetching data:', error);
    // Display an error message to the user if desired
  }
}

//Chart nfs Perform  
let myChart;

async function fetchDataPerform() {
  const selectedApi = document.getElementById('apiSelector').value;
  let apiUrl;

  switch (selectedApi) {
    case 'api1':
      apiUrl = 'http://192.168.1.213:5001/nfs/performance?s_nf=free5gc';
      break;
    case 'api2':
      apiUrl = 'http://192.168.1.213:5001/nfs/performance/day?s_nf=free5gc';
      break;
    case 'api3':
      apiUrl = 'http://192.168.1.213:5001/nfs/performance/week?s_nf=free5gc';
      break;
    case 'api4':
      apiUrl = 'http://192.168.1.213:5001/nfs/performance/month?s_nf=free5gc';
      break;
    default:
      // Handle the case where selectedApi doesn't match any of the above
      break;
  }

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();

    // Destroy the existing chart if it exists
    if (myChart) {
      myChart.destroy();
    }

    createChart(data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function createChart(data) {
  try {
    const timestamps = data.map(entry => new Date(entry[0]));
    const datasets = [];

    // Define labels for each metric
    const labels = ['Disk', 'Memory', 'Load 1', 'Load 5', 'Load 15', 'Write', 'Read', 'CPU', 'Transmission Rate In', 'Transmission Rate Out', 'Bandwidth In', 'Bandwidth Out', 'Loss In', 'Loss Out'];

    // Create datasets for each metric
    for (let i = 1; i < data[0].length; i++) {
      datasets.push({
        label: labels[i - 1],
        data: data.map(entry => parseFloat(entry[i])),
        backgroundColor: `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255}, 0.2)`,
        borderColor: `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255}, 1)`,
        borderWidth: 1
      });
    }

    const ctx = document.getElementById('performanceChart').getContext('2d');

    myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: timestamps,
        datasets: datasets
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            }
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });
  } catch (error) {
    console.error('Error creating chart:', error);
  }
}

// Initial fetch when the page loads
fetchDataPerform();

/*logout function*/
function logout() {
    fetch('http://140.118.121.85:5001/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // If the endpoint requires a request body, you can include it here
        // body: JSON.stringify({ key: 'value' }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // If the request was successful, you can redirect the user or perform other actions
        return response.json();
    })
    .then(data => {
        console.log('Logout response:', data);
        // Assuming the logout was successful, redirect the user to the specified page
        window.location.href = 'http://140.118.121.85:5001';
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        alert('An error occurred. Please try again later.');
    });
}
document.getElementById('logoutButton').addEventListener('click', function() {
    logout();
});

