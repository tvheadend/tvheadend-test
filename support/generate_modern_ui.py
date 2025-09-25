#!/usr/bin/env python3
"""
Generate modern_ui.c file automatically from React build manifest
This ensures cache invalidation works properly without manual updates
"""

import json
import os
import sys

def generate_modern_ui_c():
    """Generate modern_ui.c with automatic asset versioning"""
    
    # Paths
    manifest_path = "src/webui/static/modern/asset-manifest.json"
    output_path = "src/webui/modern_ui.c"
    
    # Check if manifest exists
    if not os.path.exists(manifest_path):
        print(f"Warning: {manifest_path} not found, skipping generation")
        return
    
    # Read manifest
    try:
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
    except Exception as e:
        print(f"Error reading manifest: {e}")
        return
    
    # Extract main CSS and JS files from entrypoints
    entrypoints = manifest.get('entrypoints', [])
    css_file = None
    js_file = None
    
    for entry in entrypoints:
        if entry.endswith('.css'):
            css_file = entry
        elif entry.endswith('.js'):
            js_file = entry
    
    if not css_file or not js_file:
        print("Error: Could not find CSS or JS entrypoints in manifest")
        return
    
    # Generate C file content
    c_content = f'''/*
 *  tvheadend, Modern UI
 *  Copyright (C) 2024
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

#include "tvheadend.h"
#include "http.h"
#include "webui.h"
#include "modern_ui.h"

/**
 * Serve the main modern UI page
 * Auto-generated from asset manifest for cache invalidation
 */
static int
modern_ui_main(http_connection_t *hc, const char *remain, void *opaque)
{{
  htsbuf_queue_t *hq = &hc->hc_reply;

  htsbuf_append_str(hq, "<!DOCTYPE html>\\n");
  htsbuf_append_str(hq, "<html lang=\\"en\\">\\n");
  htsbuf_append_str(hq, "<head>\\n");
  htsbuf_append_str(hq, "  <meta charset=\\"utf-8\\" />\\n");
  htsbuf_append_str(hq, "  <link rel=\\"icon\\" href=\\"/static/modern/favicon.ico\\" />\\n");
  htsbuf_append_str(hq, "  <meta name=\\"viewport\\" content=\\"width=device-width,initial-scale=1\\" />\\n");
  htsbuf_append_str(hq, "  <meta name=\\"theme-color\\" content=\\"#000000\\" />\\n");
  htsbuf_append_str(hq, "  <meta name=\\"description\\" content=\\"Tvheadend Modern Interface\\" />\\n");
  htsbuf_append_str(hq, "  <title>Tvheadend</title>\\n");
  htsbuf_append_str(hq, "  <script defer=\\"defer\\" src=\\"/static/modern/{js_file}\\"></script>\\n");
  htsbuf_append_str(hq, "  <link href=\\"/static/modern/{css_file}\\" rel=\\"stylesheet\\">\\n");
  htsbuf_append_str(hq, "</head>\\n");
  htsbuf_append_str(hq, "<body>\\n");
  htsbuf_append_str(hq, "  <noscript>You need to enable JavaScript to run this app.</noscript>\\n");
  htsbuf_append_str(hq, "  <div id=\\"root\\"></div>\\n");
  htsbuf_append_str(hq, "</body>\\n");
  htsbuf_append_str(hq, "</html>\\n");

  http_output_html(hc);
  return 0;
}}

/**
 * Serve modern UI for all routes
 */
static int
modern_ui_route(http_connection_t *hc, const char *remain, void *opaque)
{{
  return modern_ui_main(hc, remain, opaque);
}}

/**
 * Initialize modern UI
 */
void
modern_ui_start(void)
{{
  http_path_add("/modern/index.html",    NULL, modern_ui_main,         ACCESS_WEB_INTERFACE);
  http_path_add("/modern/",             NULL, modern_ui_route,        ACCESS_WEB_INTERFACE);
  http_path_add("/modern",              NULL, modern_ui_route,        ACCESS_WEB_INTERFACE);
}}'''
    
    # Write C file
    try:
        with open(output_path, 'w') as f:
            f.write(c_content)
        print(f"Generated {output_path} with assets: {js_file}, {css_file}")
    except Exception as e:
        print(f"Error writing {output_path}: {e}")
        return

if __name__ == "__main__":
    generate_modern_ui_c()