function generateSheet() {
  let sheetCode = "1Q7G1zLCa-K6Py4jfazyeFEiCKsGFSyD6Ln0znLvIjCY"
  let sheetForm = "Overview!A1:F8"
  let googleSheetsKey = "AIzaSyAo1G7vJX6pPOg7nV0poq7dyY4UX5m4o8M"

  var xmlhttp = new XMLHttpRequest();

  var url = "https://sheets.googleapis.com/v4/spreadsheets/" + sheetCode + "/values/" + sheetForm + "?key=" + googleSheetsKey

  xmlhttp.onreadystatechange = function () {
    setTimeout(function () {
      if (document.getElementById("id01").wrap == "") {
        document.getElementById("id01").wrap = 'Unable to load data. Please go to "File > Publish To Web" on your Google Sheets page and ensure that it is published.'
      }
    }, 1500)
    if (this.readyState == 4 && this.status == 200) {
      var arr = JSON.parse(this.responseText)
      var tableBody = document.getElementById("wrap");
      // Clear the table body before populating it with new data
      tableBody.innerHTML = "";

      // Create the header row using the first row of the data
      const headerRow = document.createElement("tr");
      tableBody.appendChild(headerRow);
      for (const row of arr.values[0]) {

        const newCell = document.createElement("td");
        // Set the text content of the cell to the value of the current row
        // you can use newcell. something to set anything onto the element
        newCell.textContent = row;
        headerRow.appendChild(newCell);
      }
      // Create the data rows using the remaining rows of the data
      // Prepare duck progress variables and UI
      const usersBooks = [];
      let maxBooks = 1;

      // create bottom duck strip if it doesn't exist
      let duckStrip = document.getElementById('duck-strip');
      if (!duckStrip) {
        duckStrip = document.createElement('div');
        duckStrip.id = 'duck-strip';
        const track = document.createElement('div');
        track.id = 'duck-track';
        const duck = document.createElement('div');
        duck.id = 'duck';
        duck.textContent = '🦆';
        track.appendChild(duck);
        duckStrip.appendChild(track);
        document.body.appendChild(duckStrip);
      }

      // moveDuckTo uses maxBooks which we'll compute after collecting all users
      const moveDuckTo = (books) => {
        const pct = Math.min(100, Math.round((books / maxBooks) * 100));
        const duck = document.getElementById('duck');
        if (duck) {
          duck.style.left = pct + '%';
          duck.setAttribute('data-pct', pct);
        }
      };

      // Create the data rows using the remaining rows of the data
      for (const datum of arr.values.slice(1)) {
        const newRow = document.createElement("tr");
        tableBody.appendChild(newRow);
        for (const value of datum) {
          const newCell = document.createElement("td");
          newCell.textContent = value;
          newRow.appendChild(newCell);
        }
        const books = Number(datum[1]) || 0;
        usersBooks.push(books);
        newRow.style.cursor = 'pointer';
        newRow.addEventListener('click', () => moveDuckTo(books));
      }

      // compute maximum and set default duck position to first user (if any)
      if (usersBooks.length) {
        maxBooks = Math.max(...usersBooks, 1);
        moveDuckTo(usersBooks[0]);
      }
    }
  }

  xmlhttp.open("GET", url)
  xmlhttp.send()
}

window.onload = function () {
  generateSheet();
};
