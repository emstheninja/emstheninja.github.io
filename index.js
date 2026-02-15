function generateSheet() {
  let sheetCode = "1Q7G1zLCa-K6Py4jfazyeFEiCKsGFSyD6Ln0znLvIjCY"
  let sheetForm = "Overview!A1:F10"
  // Read API key from a local config script (git-ignored) or from global env-style var.
  let googleSheetsKey = (window.API_KEY || window.GOOGLE_SHEETS_API_KEY || 'AIzaSyAo1G7vJX6pPOg7nV0poq7dyY4UX5m4o8M');

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

      // set maximum scale to 30 (fixed)
      const maxBooks = 30;

      // --- Pie chart: total at arr.values[8][0], slices at [8][3],[8][4],[8][5] ---
      const pieRow = (arr.values[8] || []);
      const pieTotal = Number(pieRow[1]) || 0;
      const pieSlices = [Number(pieRow[3]) || 0, Number(pieRow[4]) || 0, Number(pieRow[5]) || 0];

      let pieContainer = document.getElementById('pie-container');
      if (!pieContainer) {
        pieContainer = document.createElement('div');
        pieContainer.id = 'pie-container';
        pieContainer.style.display = 'flex';
        pieContainer.style.justifyContent = 'center';
        pieContainer.style.margin = '12px 0';
        const canvas = document.createElement('canvas');
        canvas.id = 'pie-chart';
        canvas.width = 200;
        canvas.height = 200;
        pieContainer.appendChild(canvas);
        document.body.appendChild(pieContainer);
      }

      const canvas = document.getElementById('pie-chart');
      if (canvas && canvas.getContext) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const totalSlices = pieSlices.reduce((a, b) => a + b, 0) || 1;
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = Math.min(cx, cy) - 10;
        let start = -0.5 * Math.PI;
        const colors = ['#4CAF50', '#FF9800', '#2196F3'];
        for (let i = 0; i < pieSlices.length; i++) {
          const value = pieSlices[i];
          const angle = (value / totalSlices) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, radius, start, start + angle);
          ctx.closePath();
          ctx.fillStyle = colors[i % colors.length];
          ctx.fill();
          start += angle;
        }

        // draw inner white circle for donut effect and show total
        ctx.beginPath();
        ctx.fillStyle = '#ffffff';
        ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pieTotal, cx, cy);
      }

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
      users.slice(0,-1).forEach((u, i) => {
        const pct = Math.min(100, Math.round((u.books / maxBooks) * 100));
        const item = document.createElement('div');
        item.className = 'duck-item';
        item.style.left = pct + '%';
        item.setAttribute('data-pct', u.books);
        item.setAttribute('data-index', i);
        item.title = `${u.name}: ${u.books}`;

        const emoji = document.createElement('span');
        emoji.className = 'duck-emoji';
        emoji.textContent = '🦆';

        const label = document.createElement('span');
        label.className = 'duck-name';
        label.textContent = u.name;

        item.appendChild(emoji);
        item.appendChild(label);
        track.appendChild(item);

        // stagger vertically so multiple ducks at same percent remain visible
        const rowOffset = (i % 6) * 50; // up to 6 stagger rows
        item.style.top = (-28 - rowOffset) + 'px';
        item.style.zIndex = 1000 + (i % 6);
        item.addEventListener('click', () => highlightDuck(i));
      });

      // highlight function to visually indicate selected duck
      const highlightDuck = (index) => {
        const items = document.querySelectorAll('.duck-item');
        items.forEach(it => it.classList.remove('selected'));
        const sel = document.querySelector('.duck-item[data-index="' + index + '"]');
        if (sel) sel.classList.add('selected');
      };

      // scale the duck strip to fit the ducks' height so each duck is visible
      (function adjustDuckStripHeight() {
        const items = track.querySelectorAll('.duck-item');
        let minTop = 0;
        let maxBottom = track.offsetHeight || 4;
        items.forEach(it => {
          const top = parseInt(it.style.top, 10) || 0;
          minTop = Math.min(minTop, top);
          maxBottom = Math.max(maxBottom, top + it.offsetHeight);
        });
        const total = Math.abs(minTop) + maxBottom;
        // add small padding
        duckStrip.style.height = (total + 12) + 'px';
      })();

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
