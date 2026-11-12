#!/usr/bin/env osascript -l JavaScript
// Fill and submit a Greasy Fork version form from an already logged-in Safari tab.
//
// Safari must be logged in to Greasy Fork and "Allow JavaScript from Apple Events"
// must be enabled. No credentials are stored or requested.
//
// Usage:
//   osascript -l JavaScript tools/publish/greasyfork-safari.js -- /path/to/jp-stats.greasyfork.user.js 605109
//
// The page should already be open at:
//   https://greasyfork.org/zh-CN/scripts/<id>/versions/new

function run(argv) {
  var file = argv[0];
  var scriptId = argv[1];
  if (!file || !scriptId) {
    throw new Error('usage: greasyfork-safari.js -- <file.user.js> <scriptId>');
  }
  ObjC.import('Foundation');
  var code = ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(file, $.NSUTF8StringEncoding, null));
  var Safari = Application('Safari');
  if (!Safari.documents.length) throw new Error('Safari has no open document');
  var doc = Safari.documents[0];
  function js(c) { return Safari.doJavaScript(c, { in: doc }); }

  var href = js('location.href');
  if (href.indexOf('/scripts/' + scriptId + '/versions/new') < 0) {
    throw new Error('open https://greasyfork.org/zh-CN/scripts/' + scriptId + '/versions/new in Safari first');
  }
  js('var ta=document.getElementById("script_version_code"); if(!ta) throw new Error("code field not found"); ta.value="";');
  var chunk = 40000;
  for (var i = 0; i < code.length; i += chunk) {
    var part = code.slice(i, i + chunk);
    js('document.getElementById("script_version_code").value += ' + JSON.stringify(part) + ';');
  }
  var changelog = argv[2] || 'Release update';
  js('document.getElementById("script_version_changelog").value=' + JSON.stringify(changelog) + ';');
  var len = js('document.getElementById("script_version_code").value.length');
  if (String(len) !== String(code.length)) {
    throw new Error('textarea length mismatch: ' + len + ' vs ' + code.length);
  }
  js('document.getElementById("new_script_version").submit();');
  return 'submitted ' + code.length + ' characters';
}
