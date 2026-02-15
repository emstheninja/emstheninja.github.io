function generateSheet() {
  let sheetUrl = ""
  let sheetCode = "1Q7G1zLCa-K6Py4jfazyeFEiCKsGFSyD6Ln0znLvIjCY"
  let dataArray = []
  let dataArrayFormatted = ""
  document.getElementById("id01").innerHTML = ""
  var xmlhttp = new XMLHttpRequest();
  sheetUrl = document.getElementById("sheetUrl").value;

  var url = "https://sheets.googleapis.com/v4/spreadsheets/1Q7G1zLCa-K6Py4jfazyeFEiCKsGFSyD6Ln0znLvIjCY/values/Overview!A1:F8?key=AIzaSyAo1G7vJX6pPOg7nV0poq7dyY4UX5m4o8M"
  https://sheets.googleapis.com/v4/spreadsheets/1Q7G1zLCa-K6Py4jfazyeFEiCKsGFSyD6Ln0znLvIjCY/values/Sheet1!A1:D5

  xmlhttp.onreadystatechange = function () {
    setTimeout(function () {
      if (document.getElementById("id01").wrap == "") {
        document.getElementById("id01").wrap = 'Unable to load data. Please go to "File > Publish To Web" on your Google Sheets page and ensure that it is published.'
      }
    }, 1500)
    if (this.readyState == 4 && this.status == 200) {
      var arr = JSON.parse(this.responseText)
      var tableBody = document.getElementById("wrap");

      tableBody.innerHTML = "";
      console.log(arr.values);
        const headerRow = document.createElement("tr");
        tableBody.appendChild(headerRow);
      for (const row of arr.values[0]) {
        const newCell = document.createElement("td");
        newCell.textContent = row;
        headerRow.appendChild(newCell);
      }


      for (const datum of arr.values.slice(1)) {
        const newRow = document.createElement("tr");
        tableBody.appendChild(newRow);
        for (const value of datum) {
          const newCell = document.createElement("td");
          newCell.textContent = value;
          newRow.appendChild(newCell);
        }
      }
    }
  }
  xmlhttp.open("GET", url)
  xmlhttp.send()
}
