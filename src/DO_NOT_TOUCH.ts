// Load JSON text from server hosted file and return JSON parsed object
function loadJSON(filePath: string) {
  // Load json file;
  const json: string = loadTextFileAjaxSync(filePath, "application/json");
  // Parse json
  return JSON.parse(json);
}

// Load text with Ajax synchronously: takes path to file and optional MIME type
function loadTextFileAjaxSync(filePath: string, mimeType: any): string | null {
  const xmlhttp: XMLHttpRequest = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  if (mimeType != null) {
    if (xmlhttp.overrideMimeType) {
      xmlhttp.overrideMimeType(mimeType);
    }
  }
  xmlhttp.send();
  if (xmlhttp.status == 200 && xmlhttp.readyState == 4) {
    return xmlhttp.responseText;
  }
  else {
    // TODO Throw exception
    return null;
  }
}


