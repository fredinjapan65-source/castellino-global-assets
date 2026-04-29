document.getElementById("fileInput").addEventListener("change", handleFile);

let originalData = [];

function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheet = workbook.Sheets["Global Assets"];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        originalData = json;
        renderTable(json);
    };
    reader.readAsArrayBuffer(file);
}

function renderTable(data) {
    const table = document.getElementById("dataTable");
    table.innerHTML = "";

    if (data.length === 0) return;

    const headers = Object.keys(data[0]);

    // Header
    let headerRow = "<tr>";
    headers.forEach(h => {
        headerRow += `<th>${h}</th>`;
    });
    headerRow += "</tr>";
    table.innerHTML += headerRow;

    // Rows
    data.forEach((row) => {
        let tr = "<tr>";

        const isFinalTotal =
            row.Region === "Global" &&
            row["Asset Category"] === "Summary" &&
            row["Asset Owner"] === "System";

        headers.forEach(h => {
            let cell = row[h];

            // Remove 0 for text columns
            if (cell === 0 && ["Region", "Asset Category", "Asset Owner"].includes(h)) {
                cell = "";
            }

            // Convert numbers → remove decimals → format commas
            if (!isNaN(cell) && cell !== "" && cell !== null) {
                cell = Math.floor(Number(cell));   // 👈 removes all decimals
                cell = cell.toLocaleString("en-IN");
            }

            tr += `<td class="${isFinalTotal ? "final-total" : ""}">${cell}</td>`;
        });

        tr += "</tr>";
        table.innerHTML += tr;
    });
}

document.getElementById("searchInput").addEventListener("input", function () {
    const query = this.value.toLowerCase();
    const filtered = originalData.filter(row =>
        Object.values(row).some(val =>
            String(val).toLowerCase().includes(query)
        )
    );
    renderTable(filtered);
});