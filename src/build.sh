#!/bin/sh
cd "$(dirname "$0")"
{ cat head.html; echo '<style>'; cat style.css; echo '</style>'; cat body.html; echo '<script>'; sed '/^if (typeof module/d' content.js; echo '</script>'; echo '<script>'; cat ui.js | sed '/^\/\* ---------- Start ---------- \*\//,$d'; cat accounts.js; sed -n '/^\/\* ---------- Start ---------- \*\//,$p' ui.js; echo '</script>'; } > index.html
