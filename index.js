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
      // Build users list from sheet rows
      const users = [];

      for (const datum of arr.values.slice(1)) {
        const newRow = document.createElement("tr");
        tableBody.appendChild(newRow);
        for (const value of datum) {
          const newCell = document.createElement("td");
          newCell.textContent = value;
          newRow.appendChild(newCell);
        }
        const name = datum[0] || 'Unknown';
        const books = Number(datum[1]) || 0;
        users.push({ name, books });
        newRow.style.cursor = 'pointer';
        const rowIndex = users.length - 1;
        newRow.addEventListener('click', () => highlightDuck(rowIndex));
      }

      // compute maximum (avoid division by zero)
      const maxBooks = users.length ? Math.max(...users.map(u => u.books), 1) : 1;

      // create bottom duck strip and track
      let duckStrip = document.getElementById('duck-strip');
      if (!duckStrip) {
        duckStrip = document.createElement('div');
        duckStrip.id = 'duck-strip';
        const track = document.createElement('div');
        track.id = 'duck-track';
        duckStrip.appendChild(track);
        document.body.appendChild(duckStrip);
      }

      const track = document.getElementById('duck-track');
      track.innerHTML = '';

      // create one duck per user, positioned according to progress
      users.forEach((u, i) => {
        const pct = Math.min(100, Math.round((u.books / maxBooks) * 100));
        const item = document.createElement('div');
        item.className = 'duck-item';
        item.style.left = pct + '%';
        item.setAttribute('data-pct', pct);
        item.setAttribute('data-index', i);
        item.title = `${u.name}: ${u.books} books (${pct}%)`;

        const emoji = document.createElement('span');
        emoji.className = 'duck-emoji';
        emoji.textContent = '🦆';

        const label = document.createElement('span');
        label.className = 'duck-name';
        label.textContent = u.name;

        item.appendChild(emoji);
        item.appendChild(label);
        track.appendChild(item);

        item.addEventListener('click', () => highlightDuck(i));
      });

      // highlight function to visually indicate selected duck
      const highlightDuck = (index) => {
        const items = document.querySelectorAll('.duck-item');
        items.forEach(it => it.classList.remove('selected'));
        const sel = document.querySelector('.duck-item[data-index="' + index + '"]');
        if (sel) sel.classList.add('selected');
      };

      // default to first user
      if (users.length) highlightDuck(0);
    }
  }

  xmlhttp.open("GET", url)
  xmlhttp.send()
}

window.onload = function () {
  generateSheet();
};
