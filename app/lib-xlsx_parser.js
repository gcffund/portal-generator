const XLSX = require('xlsx');

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const MULTISPACE_REGEX = /[ \t]{2,}/;
// const UTF8_NEWLINE = escapeRegExp('&#10');
const NEWLINE_REGEX = new RegExp(escapeRegExp('&#10;'), 'g');

// simple closure to build a non-sparse, 2 dimensional array of cell values
function tableBuilder() {
  const table = [];
  let rowOffset = 0;

  function addCell(cell) {
    if (cell.row > ((table.length - 1) + rowOffset)) {
      // new row
      table.push([]);
      rowOffset = cell.row - (table.length - 1);
    }
    // existing row
    for (let index = table[table.length - 1].length; index < cell.col; index += 1) {
      table[table.length - 1][index] = '';
    }
    table[table.length - 1][cell.col] = cell.value;
  }
  return { addCell, table };
}


function parse(inputXLSXFile, options = {}) {
  const rowStartIndex = options.rowStartIndex || 0; // zero based
  const tb = tableBuilder();
  const wb = XLSX.readFile(inputXLSXFile);
  const MODIFIED_DATE_STRING = wb.Props.ModifiedDate.toISOString().substr(0, 16).replace('T', ' ');
  const ws = wb.Sheets[wb.SheetNames[0]];

  Object.keys(ws).forEach((wsRef) => {
    if (wsRef[0] === '!') return; // keys not begining with "!" are cell addresses
    const cell = {
      col: parseInt(wsRef.charCodeAt(0) - 65, 10),
      row: parseInt(wsRef.substring(1), 10) - 1,
      value: '',
    };
    if (cell.row < rowStartIndex) return;
    if (ws[wsRef].t === 's') {
      // string
      cell.value = ws[wsRef].v.replace(MULTISPACE_REGEX, ' ').trim();
      cell.value = cell.value.replace(NEWLINE_REGEX, '\n');
    } else if (ws[wsRef].t === 'n') {
      // number
      cell.value = String(ws[wsRef].v);
    }
    tb.addCell(cell);
  });
  return { data: tb.table, props: { modified: MODIFIED_DATE_STRING } };
}

module.exports = { parse };
